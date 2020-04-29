const url = require('url');
const fetchNode = require('node-fetch');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('../middleware/check-jwt');
const generatorCookie = require('../helpers/generate-new-cookie');

exports.loginUser = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', async () => {
        let postBody = JSON.parse(body);
        if (!validator.isEmail(postBody)) {
            res.statusCode = 401;
            return res.end(JSON.stringify({err: 'Bad email'}));
        }
    try {
        let users = await fetchNode('http://jsonplaceholder.typicode.com/users');
        let usersJSON = await users.json();
        let neededUser = usersJSON.filter( (u) => u.email === postBody );
        if (neededUser.length === 0) {
            res.statusCode = 401;
            return res.end(JSON.stringify({err: 'User with the same email was not found'}))
        }
        else {
            let {newToken: token} = jwtMiddleware.generateNewToken({
                    userName: neededUser[0].name,
                    userId: neededUser[0].id
                },
                process.env.SECRET_TOKEN, process.env.ACCESS_TOKEN_TIME);

            let {newToken: refreshToken} = jwtMiddleware.generateNewToken({
                    userName: neededUser[0].name,
                    userId: neededUser[0].id
                },
                process.env.REFRESH_TOKEN, process.env.REFRESH_TOKEN_TIME);
            generatorCookie(refreshToken, res);
            let response = {
                token,
                userId: neededUser[0].id
            };
            res.end(JSON.stringify(response))
        }
    }
    catch(err) {
        res.statusCode = 401;
        return res.end(JSON.stringify({err: 'login too watch this page'}))
    }
    });
};

exports.getCurrentUser = async (req, res) => {
    try {
        let {id, admin, token} = req.data;
        let users = await fetchNode('http://jsonplaceholder.typicode.com/users');
        let usersJSON = await users.json();
        let idx = usersJSON.filter((u) => u.id == id);
        if (idx.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({err: 'User was not found'}))
        }
        else {
            let out = {
                user: {...idx[0], admin},
                token
            };
            res.end(JSON.stringify(out));
        }
    }
    catch(err) {
        return res.end(JSON.stringify({err: 'Error'}))
    }
};

exports.getUsers = async (req, res) => {
    let {limit, skip, token} = req.usersParams;
    try {
        let usersResponse = await fetchNode('http://jsonplaceholder.typicode.com/users');
        let usersJSON = await usersResponse.json();
        if (usersJSON.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({err: 'Users were not found'}))
        }
        else {
            let newLimit;
            if (limit > usersJSON.length) {
                newLimit = usersJSON.length;
            };
            let limitedUsers = usersJSON.slice(skip, newLimit || limit);
            let users = limitedUsers.map( u => {
                return {
                    name: u.name,
                    phone: u.phone,
                    email: u.email,
                    id: u.id,
                    username: u.username
                }
            });
            let out = {
                users,
                usersLength: usersJSON.length,
                token
            };
            res.end(JSON.stringify(out));
        }
    }
    catch(err) {
        res.statusCode = 404;
        return res.end(JSON.stringify({err: 'Users were not found'}))
    }
};
