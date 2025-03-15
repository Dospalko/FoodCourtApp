// src/sockets/orderSocket.js
module.exports = function(io) {
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
  
      socket.on('orderUpdate', (data) => {
        console.log('Order update received:', data);
        // Rozposlanie aktualizácie všetkým klientom
        io.emit('orderStatus', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  };
  