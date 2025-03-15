// client/src/components/SocketTest.js
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketTest = ({ role }) => {
  useEffect(() => {
    const socket = io('http://localhost:4000');

    // Po pripojení sa prihlásime do miestnosti podľa role
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinRoom', role);
    });

    socket.on('orderUpdate', (data) => {
      console.log(`Order update received for role ${role}:`, data);
    });

    socket.on('orderDeleted', (data) => {
      console.log(`Order deletion received for role ${role}:`, data);
    });

    return () => socket.disconnect();
  }, [role]);

  return <div>Socket client for role: {role}</div>;
};

export default SocketTest;
