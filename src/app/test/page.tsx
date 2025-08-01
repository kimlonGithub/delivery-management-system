'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function TestPage() {
  const { user, token, login } = useAuth();
  const [email, setEmail] = useState('driver1@delivery.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      console.log('Login successful:', user);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Test Login'}
          </button>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h2 className="font-semibold mb-2">Current User:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {token && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h2 className="font-semibold mb-2">Token:</h2>
            <pre className="text-sm overflow-auto">
              {token.substring(0, 50)}...
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 