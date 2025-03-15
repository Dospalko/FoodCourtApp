// client/src/components/RestaurantView.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_ORDERS = gql`
  query GetOrders {
    orders {
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

const RestaurantView = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [updateOrder] = useMutation(UPDATE_ORDER);

  useEffect(() => {
    const sock = io('http://localhost:4000');
    setSocket(sock);
    sock.on('connect', () => {
      console.log('Restaurant socket connected:', sock.id);
      // Pripojenie do miestnosti pre restauráciu
      sock.emit('joinRoom', 'restaurant');
    });
    // Restaurácia môže počúvať napríklad nové objednávky (ak sú rozposlané do tejto miestnosti)
    sock.on('orderStatus', (data) => {
      console.log('New order received for restaurant:', data);
      setNotifications(prev => [...prev, { type: 'new', data }]);
      refetch();
    });
    return () => sock.disconnect();
  }, [refetch]);

  const markOrderReady = async (id) => {
    try {
      await updateOrder({
        variables: {
          id,
          updates: { status: "ready" },
          role: "restaurant" // aktualizácia zo strany restaurácie
        }
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Restaurant Dashboard</h2>
      <h3>Notifications:</h3>
      <ul>
        {notifications.map((notif, idx) => (
          <li key={idx}>
            {notif.type === 'new' && `New order received: ID ${notif.data.id}`}
          </li>
        ))}
      </ul>
      <h3>Orders:</h3>
      {loading ? <p>Loading orders...</p> : error ? <p>Error: {error.message}</p> : (
        <ul>
          {data.orders.map(order => (
            <li key={order.id} style={{ marginBottom: '1rem' }}>
              <div>
                <strong>ID:</strong> {order.id} — {order.items.join(', ')} — {order.totalAmount}€ — {order.status}
              </div>
              {order.status !== 'ready' && (
                <button onClick={() => markOrderReady(order.id)}>Mark as Ready</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RestaurantView;
