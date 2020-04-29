const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const controller = require('../controllers/posts');
const jwtMiddleware = require('../middleware/check-jwt');

module.exports = (req, res) => {
    let reqURL = url.parse(req.url, true);

    if (reqURL.pathname === '/posts/user' && req.method === 'GET') {
        jwtMiddleware.checkJWT(req, res);
        if (req.data && req.data.loggedIn) {
            let {id: reqUserId, limit, skip} = reqURL.query;
            req.postsParams = {
                id: reqUserId,
                limit,
                skip,
                all: false,
                canBeModify: req.data.admin
            };
            controller.getPosts(req, res)
        }
        else {
            res.statusCode = 401;
            return res.end(JSON.stringify({err: 'Login too watch this page'}));
        }
    }

    if (reqURL.pathname === '/posts' && req.method === 'GET') {
        jwtMiddleware.checkJWT(req, res);
        if (req.data && req.data.loggedIn) {
            let {limit, skip} = reqURL.query;
            req.postsParams = {
                id: req.data.id,
                limit,
                skip,
                all: true,
                canBeModify: req.data.admin,
                token: req.data.token
            };
            controller.getPosts(req, res)
        } else {
            res.statusCode = 401;
            return res.end(JSON.stringify({err: 'Login too watch this page'}));
        }
    }
};
