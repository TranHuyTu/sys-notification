require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const {app, server, socketIO} = require('./middlewares/http');
const bodyParser = require('body-parser');

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.use(cors({
  origin: 'http://localhost:3000' // Hoặc '*' để cho phép tất cả các nguồn gốc
}));

//Add this before the app.get() block
// setInterval(()=>{
//   console.log('Send Notification');
//   socketIO.emit('66477f8bbb210be76752bce9', {nuti: "Noti"});
// }, 10000);

// socketIO.on('connection', (socket) => {
//   console.log(`⚡: ${socket.id} user just connected!`);

//   //Listens and logs the message to the console
//   socket.on('message', (data) => {
//     console.log(data);
//   });

//   socket.on('disconnect', () => {
//     console.log('🔥: A user disconnected');
//   });
// });

// Sử dụng body-parser để parse JSON
app.use(bodyParser.json());


// init routers
app.use('/',require('./routes'))

// handling error 

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    return next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
});

const POST = 9000;

server.listen(POST,()=>{
    console.log(`WSV eCommerce started with ${POST}`);
})

module.exports = app;