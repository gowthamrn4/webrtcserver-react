var express = require("express");
const app = express();
var http = require("http");
var socketIo = require("socket.io");

const PORT = 8080;

// app.use(express.static(__dirname + "/app"));

app.get("/", (req, res) => {
  res.send({ message: 'hi' })
  // res.sendFile(__dirname + "/app/index.html");
});

const server = http.createServer(app);
const io = socketIo(server);

const peers = io.of("/webrtcPeer");

//Keep references of all socket connections
let connectedPeers = new Map();

peers.on("connection", (socket) => {
  console.log("New User Connected with socket id ", socket.id);
  connectedPeers.set(socket.id, socket);
  const broadcast = () =>
    socket.broadcast.emit("joined-peers", {
      peerCount: connectedPeers.size,
    });

  broadcast();

  socket.emit("connection-success", {
    success: socket.id,
    peerCount: connectedPeers.size,
  });

  const disconnectedPeer = (socketId) => {
    console.log(`New peer count ${connectedPeers.size}`);
    socket.broadcast.emit("peer-disconnected", {
      peerCount: connectedPeers.size,
      socketId,
    });
  };

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} is disconnected`);
    connectedPeers.delete(socket.id);
    disconnectedPeer(socket.id);
  });

  // socket.on('offerOrAnswer', data=>{
  //     for(const [socketId, socket] of connectedPeers.entries()){
  //         if(socketId !== data.socketId){
  //             console.log(socketId, data.payload.type);
  //             socket.emit('offerOrAnswer', data.payload);
  //         }
  //     }
  // })

  socket.on("offer", (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        socket.emit("offer", {
          sdp: data.payload,
          socketId: data.socketId.local,
        });
      }
    }
  });

  socket.on("answer", (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        socket.emit("answer", {
          sdp: data.payload,
          socketId: data.socketId.local,
        });
      }
    }
  });

  socket.on("candidate", (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        console.log(socketId, data.payload);
        socket.emit("candidate", {
          candidate: data.payload,
          socketId: data.socketId.local,
        });
      }
    }
  });

  socket.on("onlinePeers", (data) => {
    for (const [socketId, _socket] of connectedPeers.entries()) {
      if (socketId !== data.socketId.local) {
        console.log("Online Peer", data.socketId, socketId);
        socket.emit("online-peer", socketId);
      }
    }
  });
});

server.listen(PORT, () => console.log("Server is listening to port 8080"));

// server.listen(3000, '192.168.43.178', function () {
//   console.log('Server running at 3000')
// })