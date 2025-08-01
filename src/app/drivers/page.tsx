'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DriversPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'driver') {
        // Redirect drivers to their deliveries page
        router.push('/driver/deliveries');
      } else if (user.role === 'admin') {
        // Redirect admins to the admin drivers management page
        router.push('/admin/drivers');
      } else {
        // Redirect other users to home
        router.push('/');
      }
    } else {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 