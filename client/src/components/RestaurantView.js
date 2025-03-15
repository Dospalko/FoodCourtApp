import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_ORDERS_BY_RESTAURANT = gql`
  query GetOrdersByRestaurant($restaurantAuthToken: String!) {
    ordersByRestaurant(restaurantAuthToken: $restaurantAuthToken) {
      id
      items
      totalAmount
      pickupTime
      status
    }
  }
`;

const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: ID!, $updates: OrderUpdateInput!, $role: String!) {
    updateOrder(id: $id, updates: $updates, role: $role) {
      id
      status
    }
  }
`;

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      id
    }
  }
`;

const RestaurantView = () => {
  const restaurantAuthToken = localStorage.getItem('userId') || "restaurant";
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { loading, error, data, refetch } = useQuery(GET_ORDERS_BY_RESTAURANT, {
    variables: { restaurantAuthToken }
  });
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:4000/notifications?authToken=${restaurantAuthToken}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications for restaurant:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const authToken = restaurantAuthToken;
    const sock = io('http://localhost:4000', { query: { authToken } });
    setSocket(sock);
    sock.on('connect', () => {
      console.log('Restaurant socket connected:', sock.id, 'with token:', authToken);
      sock.emit('joinRoom', authToken);
    });
    sock.on('orderStatus', (data) => {
      console.log('New order received for restaurant:', data);
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `New order received: ID ${data.id}`, type: 'new', orderId: data.id }
      ]);
      refetch();
    });
    sock.on('orderDeleted', (data) => {
      console.log('Order deletion received for restaurant:', data);
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: `Order deleted: ID ${data.id}`, type: 'deleted', orderId: data.id }
      ]);
      refetch();
    });
    return () => sock.disconnect();
  }, [refetch, restaurantAuthToken]);

  const markOrderReady = async (id) => {
    try {
      await updateOrder({
        variables: {
          id,
          updates: { status: "ready" },
          role: "restaurant"
        }
      });
      refetch();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteOrder({ variables: { id } });
      refetch();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Restaurant Dashboard</h2>
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Persistent Notifications:</h3>
      <ul className="list-disc ml-8 mb-6 space-y-2">
        {notifications.map((notif, idx) => (
          <li key={notif.id || idx} className="text-gray-600">{notif.message}</li>
        ))}
      </ul>
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Orders:</h3>
      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <ul className="space-y-4">
          {data && data.ordersByRestaurant && data.ordersByRestaurant.map(order => (
            <li key={order.id} className="border p-4 rounded shadow">
              <div className="mb-2">
                <span className="font-bold">ID:</span> {order.id} — {order.items.join(', ')} — {order.totalAmount}€ — {order.status}
              </div>
              {order.status !== 'ready' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => markOrderReady(order.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
                  >
                    Mark as Ready
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete Order
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RestaurantView;
