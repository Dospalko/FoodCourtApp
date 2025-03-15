// src/sockets/orderSocket.js
module.exports = function(io) {
    io.on('connection', (socket) => {
      // Získame persistentný authToken z handshake query
      const authToken = socket.handshake.query.authToken;
      console.log(`Socket connected: ${socket.id} with authToken: ${authToken}`);
  
      // Uložme token na socket, ak by sme ho neskôr chceli využiť
      socket.authToken = authToken;
  
      socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });
  
      socket.on('orderUpdate', (data) => {
        console.log('Order update received:', data);
        io.emit('orderStatus', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  };
  