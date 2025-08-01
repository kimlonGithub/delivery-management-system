'use client';

import { useState, useEffect } from 'react';

interface ApiCall {
  url: string;
  timestamp: number;
  method: string;
}

export default function ApiDebugger() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor console logs for API calls
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('[Axios Request]')) {
        const method = message.includes('GET') ? 'GET' : 
                     message.includes('POST') ? 'POST' : 
                     message.includes('PUT') ? 'PUT' : 
                     message.includes('DELETE') ? 'DELETE' : 'GET';
        const url = message.split(' ').pop() || '';
        
        setApiCalls(prev => [...prev, {
          url,
          timestamp: Date.now(),
          method
        }]);
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const clearCalls = () => {
    setApiCalls([]);
  };

  const getRecentCalls = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    return apiCalls.filter(call => call.timestamp > oneMinuteAgo);
  };

  const recentCalls = getRecentCalls();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-md text-sm z-50"
      >
        API Debug ({recentCalls.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">API Calls (Last Minute)</h3>
        <div className="flex space-x-2">
          <button
            onClick={clearCalls}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto space-y-2">
        {recentCalls.length === 0 ? (
          <p className="text-sm text-gray-500">No recent API calls</p>
        ) : (
          recentCalls.map((call, index) => (
            <div key={index} className="text-xs border-b border-gray-100 pb-1">
              <div className="font-mono text-gray-700">{call.method} {call.url}</div>
              <div className="text-gray-500">
                {new Date(call.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        Total calls: {apiCalls.length} | Recent: {recentCalls.length}
      </div>
    </div>
  );
} 