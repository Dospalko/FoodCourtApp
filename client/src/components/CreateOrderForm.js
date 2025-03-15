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
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Order</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Items (comma separated)
        </label>
        <input
          type="text"
          value={itemsInput}
          onChange={(e) => setItemsInput(e.target.value)}
          placeholder="Burger, Fries, Cola"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Amount
        </label>
        <input
          type="number"
          step="0.01"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="e.g. 15.5"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Pickup Time
        </label>
        <input
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4 text-sm">Error: {error.message}</p>}
      {data && <p className="text-green-500 mt-4 text-sm">Order created with ID: {data.createOrder.id}</p>}
    </form>
  );
};

export default CreateOrderForm;
