const jwt = require('jsonwebtoken');
const url = require('url');
const generatorCookie = require('../helpers/generate-new-cookie');
let contr = require('../controllers/auth');


const generateNewToken = (obj, secret, time) => {
    let newToken = jwt.sign(
        obj,
        secret,
        {expiresIn: time}
    );
    return {
        newToken,
        id: obj.userId
    };
};

const checkJWT = (req, res) => {
    let newToken;                             // use to refresh token
    let newId;                                // use to refresh token
    let token = req.headers['authorization'].replace('Bearer ', '');
    if (!token) {
        res.statusCode = 401;
        return res.end(JSON.stringify({err: 'Login too watch this page'}))
    }
    else {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
            if (err && err.name === 'TokenExpiredError' && Date.parse(err.expiredAt) < Date.now() && err.message === 'jwt expired') {
                //=====================================================
                if (!req.headers['cookie']) {
                    res.statusCode = 401;
                    return res.end(JSON.stringify({err: 'Login too watch this page'}))
                }
                let cookie = req.headers['cookie'].replace('refresh=', '').trim();
                jwt.verify(cookie, process.env.REFRESH_TOKEN, (error, decodedRefresh) => {
                    if (error) {
                        res.statusCode = 401;
                        return res.end(JSON.stringify({err: 'Login too watch this page'}));
                    }
                    let newAccessToken = generateNewToken({
                        userName: decodedRefresh.userName,
                        userId: decodedRefresh.userId
                    }, process.env.SECRET_TOKEN, process.env.ACCESS_TOKEN_TIME);
                    let newRefreshToken = generateNewToken({
                        userName: decodedRefresh.userName,
                        userId: decodedRefresh.userId
                    }, process.env.REFRESH_TOKEN, process.env.REFRESH_TOKEN_TIME);
                    generatorCookie(newRefreshToken.newToken, res);
                    newToken = newAccessToken.newToken;
                    newId = newAccessToken.id;
                });
                //=============================================================
            }
            else if (err && err.name !== 'TokenExpiredError') {
                res.statusCode = 401;
                return res.end(JSON.stringify({err: 'Login too watch this page'}))
            }
            const reqUrl = url.parse(req.url, true);
            let id = !decoded ? newId : decoded.userId;        // new id will be not undefined after refresh token
            if (+id === +reqUrl.query.id) {
                req.data = {
                    id,
                    admin: true,
                    loggedIn: true,
                    token: newToken
                };
            }
            else {
                req.data = {
                    id: reqUrl.query.id,
                    admin: false,
                    loggedIn: true,
                    token: newToken
                };
            }
        })
    }
};

module.exports = {
    generateNewToken,
    checkJWT
};