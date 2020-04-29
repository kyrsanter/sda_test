const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
let contr = require('../controllers/auth');
const jwtMiddleware = require('../middleware/check-jwt');

module.exports = (req, res) => {
    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname === '/login' && req.method === 'POST') {
        contr.loginUser(req, res)
    }

    if (reqUrl.pathname === '/user' && req.method === 'GET') {
        try {
            jwtMiddleware.checkJWT(req, res);
            if (req.data.loggedIn) {
                contr.getCurrentUser(req, res)
            }
            else {
                res.statusCode = 401;
                return res.end(JSON.stringify({err: 'Login too watch this page'}));
            }
        }
        catch(error) {
            return res.end(JSON.stringify({err: 'Error'}))
        }
    }

    if (reqUrl.pathname === '/users' && req.method === 'GET') {
        try {
            jwtMiddleware.checkJWT(req, res);
            if (req.data.loggedIn) {
                let {limit, skip} = reqUrl.query;
                req.usersParams = {
                    limit,
                    skip,
                    token: req.data.token
                };
                contr.getUsers(req, res);
            }
            else {
                res.statusCode = 401;
                return res.end(JSON.stringify({err: 'Login too watch this page'}));
            }
        }
        catch(error) {
            return res.end(JSON.stringify({err: 'Error'}))
        }
    }
};

