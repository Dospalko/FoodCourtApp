// client/src/App.js
import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Orders from './components/Orders';
import SocketTest from './components/SocketTest';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // backend beží na porte 4000
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Food Court Orders</h1>
        <Orders />
        <SocketTest />
      </div>
    </ApolloProvider>
  );
}

export default App;
