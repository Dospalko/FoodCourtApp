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
  // Stavy pre formulár
  const [itemsInput, setItemsInput] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Vytvorenie mutácie
  const [createOrder, { data, loading, error }] = useMutation(CREATE_ORDER);

  // Získanie persistentného tokenu z localStorage
  const customerAuthToken = localStorage.getItem('authToken') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Rozdelíme položky z textového reťazca na pole – predpokladáme, že sú oddelené čiarkami
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
      // Voliteľne vyčistíme formulár po úspešnom odoslaní
      setItemsInput('');
      setTotalAmount('');
      setPickupTime('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h2>Create Order</h2>
      <div>
        <label>Items (comma separated): </label>
        <input
          type="text"
          value={itemsInput}
          onChange={(e) => setItemsInput(e.target.value)}
          placeholder="Burger, Fries, Cola"
          required
        />
      </div>
      <div>
        <label>Total Amount: </label>
        <input
          type="number"
          step="0.01"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="e.g. 15.5"
          required
        />
      </div>
      <div>
        <label>Pickup Time: </label>
        <input
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Order'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && <p style={{ color: 'green' }}>Order created with ID: {data.createOrder.id}</p>}
    </form>
  );
};

export default CreateOrderForm;
