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

const Orders = () => {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [createOrder] = useMutation(CREATE_ORDER);

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

  return (
    <div>
      <button onClick={handleCreateOrder}>Create Order</button>
      <ul>
        {data.orders.map(order => (
          <li key={order.id}>
            ID: {order.id} - {order.items.join(', ')} - {order.totalAmount}€ - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
