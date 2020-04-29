module.exports = (refreshedToken, res) => {
    let nowTime = new Date().getTime();
    let cookieLife = process.env.REFRESH_TOKEN_TIME.replace('m', '') * 60 * 1000;
    let fullTime = +nowTime + +cookieLife;
    res.setHeader('Set-Cookie', 'refresh=' + refreshedToken + ';' + 'expires=' + new Date(fullTime));
};