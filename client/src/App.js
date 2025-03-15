// client/src/App.js
import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import RestaurantView from './components/RestaurantView';
import CustomerView from './components/CustomerView';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // backend beží na porte 4000
  cache: new InMemoryCache()
});

function App() {
  const [view, setView] = useState('restaurant'); // predvolená view

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Food Court Orders</h1>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => setView('restaurant')}>Restaurant View</button>
          <button onClick={() => setView('customer')}>Customer View</button>
        </div>
        {view === 'restaurant' ? <RestaurantView /> : <CustomerView />}
      </div>
    </ApolloProvider>
  );
}

export default App;
