// client/src/components/CreateOrderForm.js
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $items: [String!]!,
    $totalAmount: Float!,
    $pickupTime: String!,
    $customerAuthToken: String!
  ) {
    createOrder(
      items: $items,
      totalAmount: $totalAmount,
      pickupTime: $pickupTime,
      customerAuthToken: $customerAuthToken
    ) {
      id
      items
      totalAmount
      pickupTime
      status
      customerAuthToken
    }
  }
`;

const CreateOrderForm = () => {
  const [itemsInput, setItemsInput] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const [createOrder, { data, loading, error }] = useMutation(CREATE_ORDER);
  const customerAuthToken = localStorage.getItem('authToken') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsArray = itemsInput.split(',').map(item => item.trim()).filter(item => item);
    try {
      await createOrder({
        variables: {
          items: itemsArray,
          totalAmount: parseFloat(totalAmount),
          pickupTime: pickupTime,
          customerAuthToken: customerAuthToken
        }
      });
      setItemsInput('');
      setTotalAmount('');
      setPickupTime('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 mb-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Create Order</h2>
      <div className="mb-2">
        <label className="block font-medium">Items (comma separated):</label>
        <input
          type="text"
          value={itemsInput}
          onChange={(e) => setItemsInput(e.target.value)}
          placeholder="Burger, Fries, Cola"
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div className="mb-2">
        <label className="block font-medium">Total Amount:</label>
        <input
          type="number"
          step="0.01"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="e.g. 15.5"
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div className="mb-2">
        <label className="block font-medium">Pickup Time:</label>
        <input
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
          className="border rounded w-full p-2"
        />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        {loading ? 'Creating...' : 'Create Order'}
      </button>
      {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
      {data && <p className="text-green-500 mt-2">Order created with ID: {data.createOrder.id}</p>}
    </form>
  );
};

export default CreateOrderForm;
