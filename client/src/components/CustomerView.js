// client/src/components/CustomerView.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CreateOrderForm from './CreateOrderForm';

const CustomerView = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async (authToken) => {
    try {
      const response = await fetch(`http://localhost:4000/notifications?authToken=${authToken}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    let authToken = localStorage.getItem('authToken');
    if (!authToken) {
      authToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('authToken', authToken);
    }
    fetchNotifications(authToken);

    const sock = io('http://localhost:4000', { query: { authToken } });
    setSocket(sock);
    sock.on('connect', () => {
      console.log('Customer socket connected:', sock.id, 'with token:', authToken);
      sock.emit('joinRoom', 'customer');
    });
    sock.on('orderUpdate', (data) => {
      console.log('Order update received for customer:', data);
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `Your order ID ${data.id} is now ${data.status}`, type: 'update', orderId: data.id }
      ]);
    });
    sock.on('orderDeleted', (data) => {
      console.log('Order deletion received for customer:', data);
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `Order ID ${data.id} has been deleted`, type: 'deleted', orderId: data.id }
      ]);
    });
    return () => sock.disconnect();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Customer Dashboard</h2>
      <CreateOrderForm />
      <h3 className="text-2xl font-semibold mt-6 text-gray-700">Persistent Notifications:</h3>
      <ul className="list-disc ml-8 mt-4 space-y-2">
        {notifications.map((notif, idx) => (
          <li key={notif.id || idx} className="text-gray-600">{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerView;
