// client/src/components/ViewNotifications.js
import React, { useState } from 'react';

const ViewNotifications = () => {
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState([]);

  const fetchNotificationsByEmail = async () => {
    try {
      const response = await fetch(`http://localhost:4000/notifications?email=${email}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications by email:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">View My Notifications</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Enter your email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded w-full p-2"
          placeholder="your.email@example.com"
        />
      </div>
      <button 
        onClick={fetchNotificationsByEmail} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Fetch Notifications
      </button>
      <ul className="list-disc ml-8 mt-4 space-y-2">
        {notifications.map((notif, idx) => (
          <li key={notif.id || idx} className="text-gray-600">{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default ViewNotifications;
