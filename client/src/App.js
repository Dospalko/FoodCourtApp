import React, { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import RestaurantView from './components/RestaurantView';
import CustomerView from './components/CustomerView';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

function App() {
  const [view, setView] = useState('auth'); // auth, restaurant, customer
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setView(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
    setView('auth');
  };

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="mb-6 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center text-gray-800">Food Court Orders</h1>
          <div className="flex justify-center mt-4 space-x-4">
            {!isAuthenticated && (
              <button 
                onClick={() => setView('auth')} 
                className={`px-4 py-2 rounded ${view === 'auth' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}
              >
                Auth View
              </button>
            )}
            {isAuthenticated && (
              <>
                {userRole === 'restaurant' && (
                  <button 
                    onClick={() => setView('restaurant')} 
                    className={`px-4 py-2 rounded ${view === 'restaurant' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'}`}
                  >
                    Restaurant View
                  </button>
                )}
                {userRole === 'customer' && (
                  <button 
                    onClick={() => setView('customer')} 
                    className={`px-4 py-2 rounded ${view === 'customer' ? 'bg-green-600 text-white' : 'bg-green-200 text-green-800'}`}
                  >
                    Customer View
                  </button>
                )}
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>
        <main className="container mx-auto">
          {view === 'auth' && (
            <div className="flex flex-col items-center space-y-4">
              <RegisterForm setUserRole={setUserRole} setIsAuthenticated={setIsAuthenticated} setView={setView} />
              <LoginForm setUserRole={setUserRole} setIsAuthenticated={setIsAuthenticated} setView={setView} />
            </div>
          )}
          {view === 'restaurant' && <RestaurantView />}
          {view === 'customer' && <CustomerView />}
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;
