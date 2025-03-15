// client/src/App.js
import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import RestaurantView from './components/RestaurantView';
import CustomerView from './components/CustomerView';
import './App.css';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

function App() {
  const [view, setView] = useState('restaurant');

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800">Food Court Orders</h1>
          <div className="flex justify-center mt-4 space-x-4">
            <button 
              onClick={() => setView('restaurant')} 
              className={`px-4 py-2 rounded ${view === 'restaurant' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'}`}
            >
              Restaurant View
            </button>
            <button 
              onClick={() => setView('customer')}
              className={`px-4 py-2 rounded ${view === 'customer' ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800'}`}
            >
              Customer View
            </button>
          </div>
        </header>
        <main className="container mx-auto">
          {view === 'restaurant' ? <RestaurantView /> : <CustomerView />}
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;
