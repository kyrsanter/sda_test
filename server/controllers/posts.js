const url = require('url');
const fetchNode = require('node-fetch');

exports.getPosts = async (req, res) => {
    let {id, canBeModify, limit, skip, all, token} = req.postsParams; //user id
    try {
        let posts = await fetchNode('http://jsonplaceholder.typicode.com/posts');
        let postsJSON = await posts.json();
        let neededPosts;
        let author;
        if (!all) {
            neededPosts = postsJSON.filter( p => p.userId == id );
        } else {
            neededPosts = postsJSON;
        }
        if (neededPosts.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({err: 'No one post was founded'}))
        }
        else {
            let newLimit;
            if (limit > neededPosts.length) {
                newLimit = neededPosts.length;
            };
            let outPosts = neededPosts.slice(skip, newLimit || limit);
            if (all) {
                for await (let p of outPosts) {
                    let authorId = p.userId;
                    let usersResponse = await fetchNode(`http://jsonplaceholder.typicode.com/users`);
                    let resultJSON = await usersResponse.json();
                    let userIdx = resultJSON.findIndex( (u) => u.id === authorId );
                    p.authorName = resultJSON[userIdx].name;
                    p.canBeModify = authorId === id
                }
            }
            else {
                outPosts.forEach((p) => {
                    p.canBeModify = canBeModify;
                });
            }
            let out = {
                posts: outPosts,
                postsLength: neededPosts.length,
                token
            };
            res.end(JSON.stringify(out))
        }
    }
    catch (error) {
        res.statusCode = 404;
        return res.end(JSON.stringify({err: 'No one post was founded'}))
    }
};