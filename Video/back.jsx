const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('offer', (data) => {
    // Forward the offer to the remote peer
    socket.to(data.room).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    // Forward the answer to the remote peer
    socket.to(data.room).emit('answer', data.answer);
  });

  socket.on('iceCandidate', (data) => {
    // Forward the ICE candidate to the remote peer
    socket.to(data.room).emit('iceCandidate', data.candidate);
  });

  socket.on('joinRoom', (room) => {
    // Join the specified room
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const port = 3001; // Change this if needed
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
