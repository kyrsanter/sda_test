const http = require('http');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

const server = http.createServer((req, res) => {
    authRoutes(req, res);
    postsRoutes(req, res);
});

server.listen(process.env.PORT);