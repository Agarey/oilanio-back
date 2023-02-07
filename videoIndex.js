import express from 'express';
import { ExpressPeerServer } from 'peer';
import createPeerServerListeners from './groupCallHandler.js';
import { v4 as uuidv4 } from 'uuid';
import https from 'https'
import { Server } from "socket.io";
import fs from "fs";
const PORT = 5000;

const app = express();

const opts = {
    key: fs.readFileSync('realibi_kz.key'),
    cert: fs.readFileSync('realibi_kz.crt')
}
const server = https.createServer(opts, app)
const io = new Server(server, {
    cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,OPTIONS'.split(','),
    credentials: true
  }
});

const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);

createPeerServerListeners(peerServer);

let peers = [];
let groupCallRooms = [];

const broadcastEventTypes = {
  ACTIVE_USERS: 'ACTIVE_USERS',
  GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS'
};

io.on('connection', (socket) => {
  socket.emit('connection', null);
  console.log('new user connected');
  console.log(socket.id);

  socket.on('register-new-user', (data) => {
    peers.push({
      username: data.username,
      socketId: data.socketId
    });
    console.log('registered new user');
    console.log(peers);

    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.ACTIVE_USERS,
      activeUsers: peers
    });

    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.GROUP_CALL_ROOMS,
      groupCallRooms
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    peers = peers.filter(peer => peer.socketId !== socket.id);
    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.ACTIVE_USERS,
      activeUsers: peers
    });

    groupCallRooms = groupCallRooms.filter(room => room.socketId !== socket.id);
    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.GROUP_CALL_ROOMS,
      groupCallRooms
    });
  });

  // listeners related with direct call

  socket.on('pre-offer', (data) => {
    console.log('pre-offer handled');
    io.to(data.callee.socketId).emit('pre-offer', {
      callerUsername: data.caller.username,
      callerSocketId: socket.id
    });
  });

  socket.on('pre-offer-answer', (data) => {
    console.log('handling pre offer answer');
    io.to(data.callerSocketId).emit('pre-offer-answer', {
      answer: data.answer
    });
  });

  socket.on('webRTC-offer', (data) => {
    console.log('handling webRTC offer');
    io.to(data.calleeSocketId).emit('webRTC-offer', {
      offer: data.offer
    });
  });

  socket.on('webRTC-answer', (data) => {
    console.log('handling webRTC answer');
    io.to(data.callerSocketId).emit('webRTC-answer', {
      answer: data.answer
    });
  });

  socket.on('webRTC-candidate', (data) => {
    console.log('handling ice candidate');
    io.to(data.connectedUserSocketId).emit('webRTC-candidate', {
      candidate: data.candidate
    });
  });

  socket.on('user-hanged-up', (data) => {
    io.to(data.connectedUserSocketId).emit('user-hanged-up');
  });

  // listeners related with group call
  socket.on('group-call-register', (data) => {
    const roomId = uuidv4();
    socket.join(roomId);

    const newGroupCallRoom = {
      peerId: data.peerId,
      hostName: data.username,
      socketId: socket.id,
      roomId: roomId
    };

    groupCallRooms.push(newGroupCallRoom);
    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.GROUP_CALL_ROOMS,
      groupCallRooms
    });
  });

  socket.on('group-call-join-request', (data) => {
    io.to(data.roomId).emit('group-call-join-request', {
      peerId: data.peerId,
      streamId: data.streamId
    });

    socket.join(data.roomId);
  });

  socket.on('group-call-user-left', (data) => {
    socket.leave(data.roomId);

    io.to(data.roomId).emit('group-call-user-left', {
      streamId: data.streamId
    });
  });

  socket.on('group-call-closed-by-host', (data) => {
    groupCallRooms = groupCallRooms.filter(room => room.peerId !== data.peerId);

    io.sockets.emit('broadcast', {
      event: broadcastEventTypes.GROUP_CALL_ROOMS,
      groupCallRooms
    });
  });
});
  
server.listen(PORT, (err) => {
    if (err){
        throw Error(err);
    }
    console.log(`Video server started on port ${PORT}`)
})