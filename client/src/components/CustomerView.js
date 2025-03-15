// client/src/components/CustomerView.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const CustomerView = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const sock = io('http://localhost:4000');
    setSocket(sock);
    sock.on('connect', () => {
      console.log('Customer socket connected:', sock.id);
      // Pripojenie do miestnosti pre zákazníka
      sock.emit('joinRoom', 'customer');
    });
    // Zákazník počúva notifikácie o aktualizáciách objednávok (napr. keď je objednávka označená ako ready)
    sock.on('orderUpdate', (data) => {
      console.log('Order update received for customer:', data);
      setNotifications(prev => [...prev, { type: 'update', data }]);
    });
    return () => sock.disconnect();
  }, []);

  return (
    <div>
      <h2>Customer Dashboard</h2>
      <h3>Notifications:</h3>
      <ul>
        {notifications.map((notif, idx) => (
          <li key={idx}>
            {notif.type === 'update' && `Your order ID ${notif.data.id} is now ${notif.data.status}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerView;
