import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { gql, useMutation } from '@apollo/client';
import CreateOrderForm from './CreateOrderForm';

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;

const CustomerView = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Funkcia načíta notifikácie podľa perzistentného customerId
  const fetchNotifications = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:4000/notifications?customerId=${customerId}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const customerId = localStorage.getItem('userId') || '';
    if (customerId) {
      fetchNotifications(customerId);
    }
    const sock = io('http://localhost:4000', { query: { authToken } });
    setSocket(sock);
    sock.on('connect', () => {
      console.log('Customer socket connected:', sock.id, 'with token:', authToken);
      sock.emit('joinRoom', authToken);
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

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification({ variables: { id } });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Customer Dashboard</h2>
      <CreateOrderForm />
      <h3 className="text-2xl font-semibold mt-6 text-gray-700">Persistent Notifications:</h3>
      <ul className="list-disc ml-8 mt-4 space-y-2">
        {notifications.map((notif, idx) => (
          <li key={notif.id || idx} className="flex justify-between items-center text-gray-600">
            <span>{notif.message}</span>
            <button
              onClick={() => handleDeleteNotification(notif.id)}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerView;
