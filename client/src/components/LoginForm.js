import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      id
      email
      role
      token
    }
  }
`;

const LoginForm = ({ setUserRole, setIsAuthenticated, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser({ variables: { input: { email, password } } });
      localStorage.setItem('authToken', result.data.loginUser.token);
      localStorage.setItem('userRole', result.data.loginUser.role);
      localStorage.setItem('userId', result.data.loginUser.id);
      setUserRole(result.data.loginUser.role);
      setIsAuthenticated(true);
      setView(result.data.loginUser.role);
      setEmail('');
      setPassword('');
      alert(`Logged in successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>
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
      <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">Error: {error.message}</p>}
    </form>
  );
};

export default LoginForm;
