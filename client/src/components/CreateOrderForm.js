import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $items: [String!]!,
    $totalAmount: Float!,
    $pickupTime: String!,
    $customerAuthToken: String!,
    $restaurantAuthToken: String!
  ) {
    createOrder(
      items: $items,
      totalAmount: $totalAmount,
      pickupTime: $pickupTime,
      customerAuthToken: $customerAuthToken,
      restaurantAuthToken: $restaurantAuthToken
    ) {
      id
      items
      totalAmount
      pickupTime
      status
      customerAuthToken
      restaurantAuthToken
    }
  }
`;

const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      email
      role
    }
  }
`;

const CreateOrderForm = () => {
  const [itemsInput, setItemsInput] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  const { data: restaurantData } = useQuery(GET_RESTAURANTS);
  const [createOrder, { data, loading, error }] = useMutation(CREATE_ORDER);
  const customerAuthToken = localStorage.getItem('authToken') || '';

  // Ak sú reštaurácie načítané, nastavíme predvolenú hodnotu
  React.useEffect(() => {
    if (restaurantData && restaurantData.restaurants.length > 0 && !selectedRestaurant) {
      // Použijeme id reštaurácie ako restaurantAuthToken
      setSelectedRestaurant(restaurantData.restaurants[0].id);
    }
  }, [restaurantData, selectedRestaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsArray = itemsInput.split(',').map(item => item.trim()).filter(item => item);
    try {
      await createOrder({
        variables: {
          items: itemsArray,
          totalAmount: parseFloat(totalAmount),
          pickupTime: pickupTime,
          customerAuthToken: customerAuthToken,
          restaurantAuthToken: selectedRestaurant
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
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Order</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Items (comma separated):</label>
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
        <label className="block text-gray-700 text-sm font-bold mb-2">Total Amount:</label>
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
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Pickup Time:</label>
        <input
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select Restaurant:</label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="border rounded w-full p-2"
        >
          {restaurantData && restaurantData.restaurants.map((rest) => (
            <option key={rest.id} value={rest.id}>
              {rest.email} {/* Alebo ak máte pole name, použite ho */}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {loading ? 'Creating...' : 'Create Order'}
      </button>
      {error && <p className="text-red-500 mt-4 text-sm">Error: {error.message}</p>}
      {data && <p className="text-green-500 mt-4 text-sm">Order created with ID: {data.createOrder.id}</p>}
    </form>
  );
};

export default CreateOrderForm;
