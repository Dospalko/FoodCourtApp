// client/src/components/SocketTest.js
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketTest = () => {
  useEffect(() => {
    const socket = io('http://localhost:4000'); // pripojenie na backend
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('orderStatus', (data) => {
      console.log('Order status update received:', data);
    });
    // Príklad: odoslanie eventu po 3 sekundách
    setTimeout(() => {
      socket.emit('orderUpdate', { orderId: 1, status: 'ready' });
    }, 3000);

    return () => socket.disconnect();
  }, []);

  return <div>Testing Socket.io in React</div>;
};

export default SocketTest;
