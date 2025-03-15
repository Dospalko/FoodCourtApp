// client/src/components/Orders.js
import React from 'react';
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

const CREATE_ORDER = gql`
  mutation CreateOrder($items: [String!]!, $totalAmount: Float!, $pickupTime: String!) {
    createOrder(items: $items, totalAmount: $totalAmount, pickupTime: $pickupTime) {
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
      items
      totalAmount
      pickupTime
      status
    }
  }
`;

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      id
      items
      totalAmount
      pickupTime
      status
    }
  }
`;

const Orders = () => {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleCreateOrder = async () => {
    try {
      await createOrder({
        variables: {
          items: ['Pizza', 'Cola'],
          totalAmount: 12.99,
          pickupTime: new Date().toISOString()
        }
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrder = async (id, newStatus) => {
    try {
      await updateOrder({
        variables: {
          id,
          updates: { status: newStatus },
          role: "restaurant"  // Napríklad aktualizácia zo strany restaurácie
        }
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteOrder({ variables: { id } });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleCreateOrder}>Create Order</button>
      <ul>
        {data.orders.map(order => (
          <li key={order.id} style={{ marginBottom: '1rem' }}>
            <div>
              <strong>ID:</strong> {order.id} — {order.items.join(', ')} — {order.totalAmount}€ — {order.status}
            </div>
            <div>
              <button onClick={() => handleUpdateOrder(order.id, "ready")}>Mark as Ready</button>
              <button onClick={() => handleDeleteOrder(order.id)}>Delete Order</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
