const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { removeUser, getUser, getUsersInRoom, joinUser} = require ('./users.js');


const port = process.env.PORT || 3001; 

const app = express();
const server = http.createServer(app);
const io = socketio(server); 

app.use(cors());

app.get('/')



io.on('connection', (socket) => {
    socket.on('JOIN', (data,callback) => {
        joinUser({data : data, id : socket.id});
        socket.join(data.meetingId)
        return callback({message:'Socket Connected'})        
    });

    socket.on('SETLAYOUT', (data,callback) =>{
        const sender = getUser({ id : socket.id, data : data });
        if (sender) {
            io.to(sender.meetingId).emit('GETLAYOUT', data);
            return callback('Success ');
        }
    })

    socket.on('DISCONNECTION', (data,callback) => {
        console.log('data',data)
        console.log('socket.id',socket.id)
        const user = removeUser({ id : socket.id, data:data});
        if(user) {
            io.to(user.meetingId).emit('leftUser', user);
        }
        
    })
})







server.listen(port, () => console.log(`Server has started on port ${port}`));
