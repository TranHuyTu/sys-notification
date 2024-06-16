// httpServer.js
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const socketIO = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

module.exports = { app, server , socketIO};
