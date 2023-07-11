const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Listen for socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit a notification event to all connected clients
  socket.on('sendNotification', (notification) => {
    io.emit('receiveNotification', notification);
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 3001;
http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
