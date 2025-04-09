import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

function Login() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if there are any users, if not create an admin
    if (state.users.length === 0) {
      const adminUser = {
        id: uuidv4(),
        name: 'System Admin',
        email: 'admin@emotionalsavers.com',
        role: 'admin' as const,
        joinedAt: new Date().toISOString(),
      };
      dispatch({ type: 'SET_USERS', payload: [adminUser] });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the user in the existing members list
    const user = state.users.find(u => u.email === email);

    if (!user) {
      setError('Account not found. Please contact your administrator.');
      return;
    }

    dispatch({ type: 'SET_CURRENT_USER', payload: user });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Emotional Savers
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to continue
          </p>
          {state.users.length === 0 && (
            <p className="mt-2 text-center text-sm text-blue-600">
              Initial admin account is being created...
            </p>
          )}
          {state.users.length === 1 && state.users[0].role === 'admin' && (
            <p className="mt-2 text-center text-sm text-green-600">
              Admin email: admin@emotionalsavers.com
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div>
            <button type="submit" className="btn btn-primary w-full">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;