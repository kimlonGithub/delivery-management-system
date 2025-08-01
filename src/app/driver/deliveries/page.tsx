'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Delivery, Order } from '@/types';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ToastContainer';
import { toastMessages } from '@/lib/toastUtils';
import api from '@/lib/axios';

interface DeliveryWithOrder extends Delivery {
  order: Order;
}

export default function DriverDeliveries() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Debug logging
  console.log('Driver Deliveries - User:', user);
  console.log('Driver Deliveries - Token:', token);
  
  // Only fetch when user is available
  const { data: deliveries, loading, refetch: refetchDeliveries } = useApi<DeliveryWithOrder[]>(
    user?.id ? `/api/deliveries?driverId=${user.id}` : '',
    {
      cacheTime: 10000, // 10 seconds cache
      debounceTime: 500, // 500ms debounce
      immediate: !!user?.id, // Only fetch when user is available
      key: 'driver-deliveries', // Stable key to prevent unnecessary re-fetches
    }
  );

  console.log('Driver Deliveries - Deliveries:', deliveries);
  console.log('Driver Deliveries - Loading:', loading);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleUpdateStatus = async (deliveryId: string | number, status: string, notes?: string) => {
    try {
      const response = await api.put(`/api/deliveries/${deliveryId}`, { status, notes });
      
      if (response.status === 200) {
        refetchDeliveries();
        const toast = toastMessages.statusUpdateSuccess(status);
        showToast(toast.type, toast.title, toast.message);
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      const toast = toastMessages.updateError('Delivery Status');
      showToast(toast.type, toast.title, toast.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || user.role !== 'driver') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Driver Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Deliveries
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deliveries...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!deliveries || deliveries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No deliveries assigned yet.</p>
                </div>
              ) : (
                deliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {delivery.order.customerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {delivery.order.customerAddress}
                        </p>
                        <p className="text-sm text-gray-500">
                          {delivery.order.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDeliveryStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(delivery.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                          <p className="text-sm text-gray-600">
                            Product: {delivery.order.productInfo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Value: ${delivery.order.orderValue}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Delivery Actions</h4>
                          <div className="space-y-2">
                            {delivery.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdateStatus(delivery.id, 'accepted')}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(delivery.id, 'rejected')}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {delivery.status === 'accepted' && (
                              <button
                                onClick={() => handleUpdateStatus(delivery.id, 'picked_up', 'Package picked up successfully')}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Mark as Picked Up
                              </button>
                            )}
                            {delivery.status === 'picked_up' && (
                              <button
                                onClick={() => handleUpdateStatus(delivery.id, 'on_way', 'On the way to delivery')}
                                className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                              >
                                Start Delivery
                              </button>
                            )}
                            {delivery.status === 'on_way' && (
                              <button
                                onClick={() => handleUpdateStatus(delivery.id, 'delivered', 'Package delivered successfully')}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {delivery.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{delivery.notes}</p>
                        </div>
                      )}

                      {delivery.pickupTime && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            Picked up: {formatDate(delivery.pickupTime)}
                          </p>
                        </div>
                      )}

                      {delivery.deliveryTime && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Delivered: {formatDate(delivery.deliveryTime)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 