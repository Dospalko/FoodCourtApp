import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {
      id
      email
      role
      token
    }
  }
`;

const RegisterForm = ({ setUserRole, setIsAuthenticated, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [registerUser, { loading, error }] = useMutation(REGISTER_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerUser({ variables: { input: { email, password, role } } });
      localStorage.setItem('authToken', result.data.registerUser.token);
      localStorage.setItem('userRole', result.data.registerUser.role);
      localStorage.setItem('userId', result.data.registerUser.id);
      setUserRole(result.data.registerUser.role);
      setIsAuthenticated(true);
      setView(result.data.registerUser.role);
      setEmail('');
      setPassword('');
      alert(`User registered!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Register</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded w-full p-2">
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant</option>
        </select>
      </div>
      <button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">Error: {error.message}</p>}
    </form>
  );
};

export default RegisterForm;
