'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Order, User } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ToastContainer';
import { toastMessages } from '@/lib/toastUtils';
import api from '@/lib/axios';

type SortOption = 'customerName' | 'status' | 'orderValue' | 'createdAt' | 'none';
type SortOrder = 'asc' | 'desc';

export default function AdminOrders() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useApi<Order[]>('/api/orders', {
    cacheTime: 15000, // 15 seconds cache
    debounceTime: 500, // 500ms debounce
    immediate: !!user, // Only fetch when user is available
    key: 'admin-orders', // Stable key to prevent unnecessary re-fetches
  });
  const { data: drivers, refetch: refetchDrivers } = useApi<User[]>('/api/drivers?available=true', {
    cacheTime: 30000, // 30 seconds cache
    debounceTime: 500, // 500ms debounce
    immediate: !!user, // Only fetch when user is available
    key: 'admin-drivers', // Stable key to prevent unnecessary re-fetches
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    productInfo: '',
    orderValue: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleSort = (option: SortOption) => {
    if (sortOption === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortOrder('asc');
    }
  };

  const getSortedOrders = () => {
    if (!orders || sortOption === 'none') return orders;

    return [...orders].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortOption) {
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'orderValue':
          aValue = a.orderValue;
          bValue = b.orderValue;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/orders', {
        ...formData,
        orderValue: Number(formData.orderValue),
      });

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({
          customerName: '',
          customerAddress: '',
          customerPhone: '',
          productInfo: '',
          orderValue: '',
        });
        refetchOrders();
        const toast = toastMessages.createSuccess('Order');
        showToast(toast.type, toast.title, toast.message);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      const toast = toastMessages.createError('Order');
      showToast(toast.type, toast.title, toast.message);
    }
  };

  const handleAssignDriver = async (orderId: string | number, driverId: string | number) => {
    try {
      const response = await api.post('/api/orders/assign', { 
        orderId, 
        driverId 
      });

      if (response.status === 200) {
        refetchOrders();
        refetchDrivers();
        const toast = toastMessages.assignSuccess('Driver');
        showToast(toast.type, toast.title, toast.message);
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
      const toast = toastMessages.assignError('Driver');
      showToast(toast.type, toast.title, toast.message);
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await api.delete(`/api/orders/${orderId}`);

      if (response.status === 200) {
        refetchOrders();
        const toast = toastMessages.deleteSuccess('Order');
        showToast(toast.type, toast.title, toast.message);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      const toast = toastMessages.deleteError('Order');
      showToast(toast.type, toast.title, toast.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const sortedOrders = getSortedOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Delivery Management System
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

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
            >
              Orders
            </button>
            <button
              onClick={() => router.push('/admin/drivers')}
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Drivers
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Orders Management
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Order
            </button>
          </div>

          {/* Sort Controls */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort Orders by:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSort('customerName')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      sortOption === 'customerName' 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Customer Name {sortOption === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('status')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      sortOption === 'status' 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Status {sortOption === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('orderValue')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      sortOption === 'orderValue' 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Order Value {sortOption === 'orderValue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      sortOption === 'createdAt' 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Date Created {sortOption === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSortOption('none');
                    setSortOrder('asc');
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Sort
                </button>
                <button
                  onClick={() => {
                    setSortOption('orderValue');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors border border-green-200"
                >
                  Show First (High Value)
                </button>
                <button
                  onClick={() => {
                    setSortOption('createdAt');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors border border-blue-200"
                >
                  Show First (Newest)
                </button>
              </div>
            </div>
          </div>

          {ordersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {sortedOrders?.map((order) => (
                  <li key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {order.customerName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {order.customerAddress}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerPhone}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.productInfo} - {formatCurrency(order.orderValue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        {order.status === 'pending' && (
                          <select
                            onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Assign Driver</option>
                            {drivers?.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 opacity-90 h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] transform transition-all duration-300 ease-out scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Create New Order</h3>
                  <p className="text-xs text-gray-500">Add a new delivery order</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrder} className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-sm"
                    placeholder="Enter delivery address"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder="Enter phone number"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Information *
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-sm"
                    placeholder="Describe the product or package"
                    value={formData.productInfo}
                    onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      placeholder="0.00"
                      value={formData.orderValue}
                      onChange={(e) => setFormData({ ...formData, orderValue: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900 opacity-90 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this order?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedOrder.customerAddress}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.productInfo}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    Value: {formatCurrency(selectedOrder.orderValue)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 