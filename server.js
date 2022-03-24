const app = require('express')();
const userRoutes = require('./backend/routes/userRoutes')
const chatRoutes = require('./backend/routes/chatRoutes')
const messageRoutes = require('./backend/routes/messageRoutes')
const {notFound , errorHandler} = require('./backend/middleware/errorMiddleware')
const path = require('path')


const dotenv = require('dotenv');
dotenv.config()   // to use variables present in .env file

const connectDB = require("./backend/config/db");
const express = require('express');
connectDB();

app.use(express.json());  // telling server to accept json data from client

app.get("/" , (req, res) => {
    res.send("Express API is running")
})

app.use('/api/user' , userRoutes)
app.use('/api/chat' , chatRoutes)
app.use('/api/message' , messageRoutes)

// ///////////////////deployment////////////////////////////////////////////////

// const __dirname1 = path.resolve()


app.use(notFound)
app.use(errorHandler)

// const PORT = process.env.PORT;
const hostname = '0.0.0.0';
const port = 5000;
// const server = app.listen(5000, console.log(`server started on ${PORT}`))
const server = app.listen(port, hostname, () => {
    console.log(`server started at http://${hostname}:${port}/`);
})
const io = require('socket.io')(server , {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
})

io.on("connection" , (socket) => {
    console.log("connected to socket.io");

    socket.on("setup" , (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
      });

    socket.on("typing", (room) => socket.in(room).emit("typing"))  
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))  

     socket.on("new message" , (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
     }) 

    //  very importnat step, closing the connection to save the bandwidth
     socket.off("setup", () => {
         console.log("USER DISCONNECTED");
         socket.leave(userData._id)
     })
})