// src/sockets/orderSocket.js
module.exports = function(io) {
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
  
      // Umožniť klientom pripojiť sa k miestnostiam (napr. "restaurant" alebo "customer")
      socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });
  
      socket.on('orderUpdate', (data) => {
        console.log('Order update received:', data);
        // Ak nie je špecifikované inak, vysielame všetkým
        io.emit('orderStatus', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  };
  