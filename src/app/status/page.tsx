'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ToastContainer';
import { toastMessages } from '@/lib/toastUtils';

interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  environment: string;
  error?: string;
}

interface SystemStats {
  totalUsers: number;
  totalOrders: number;
  totalDeliveries: number;
  activeDrivers: number;
  pendingOrders: number;
  completedDeliveries: number;
}

interface StatItem {
  name: string;
  value: number;
  color: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  lastChecked: string;
}

type SortOption = 'name' | 'status' | 'responseTime' | 'value' | 'none';
type SortOrder = 'asc' | 'desc';

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { showToast } = useToast();

  const checkHealth = async () => {
    try {
      const response = await api.get('/api/health');
      setHealth(response.data);
      return response.data;
    } catch (error) {
      const errorData = {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        environment: 'development',
        error: error instanceof Error ? error.message : 'Failed to check health',
      };
      setHealth(errorData);
      return errorData;
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [usersResponse, ordersResponse, deliveriesResponse] = await Promise.all([
        api.get('/api/drivers'),
        api.get('/api/orders'),
        api.get('/api/deliveries'),
      ]);

      const users = usersResponse.data || [];
      const orders = ordersResponse.data || [];
      const deliveries = deliveriesResponse.data || [];

      const stats: SystemStats = {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalDeliveries: deliveries.length,
        activeDrivers: users.filter((user: { role: string; isAvailable?: boolean }) => user.role === 'driver' && user.isAvailable).length,
        pendingOrders: orders.filter((order: { status: string }) => order.status === 'pending').length,
        completedDeliveries: deliveries.filter((delivery: { status: string }) => delivery.status === 'delivered').length,
      };

      setStats(stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      return null;
    }
  };

  const checkServices = async () => {
    const servicesToCheck = [
      { name: 'Frontend App', url: window.location.origin },
      { name: 'Backend API', url: 'http://localhost:3001' },
    ];

    const serviceChecks = await Promise.allSettled(
      servicesToCheck.map(async (service) => {
        const startTime = Date.now();
        try {
          const response = await fetch(service.url, { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          const responseTime = Date.now() - startTime;
          
          return {
            name: service.name,
            status: 'online' as const,
            responseTime,
            lastChecked: new Date().toISOString(),
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'offline' as const,
            lastChecked: new Date().toISOString(),
          };
        }
      })
    );

    const serviceStatuses = serviceChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: servicesToCheck[index].name,
          status: 'error' as const,
          lastChecked: new Date().toISOString(),
        };
      }
    });

    setServices(serviceStatuses);
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        checkHealth(),
        fetchSystemStats(),
        checkServices(),
      ]);
      
      const toast = toastMessages.statusUpdateSuccess('System Status');
      showToast(toast.type, toast.title, toast.message);
    } catch (error) {
      const toast = toastMessages.updateError('System Status');
      showToast(toast.type, toast.title, toast.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSort = (option: SortOption) => {
    if (sortOption === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortOrder('asc');
    }
  };

  const getSortedServices = () => {
    if (sortOption === 'none') return services;

    return [...services].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortOption) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'responseTime':
          aValue = a.responseTime || 0;
          bValue = b.responseTime || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortedStats = (): StatItem[] | null => {
    if (!stats || sortOption === 'none') {
      return stats ? [
        { name: 'Total Users', value: stats.totalUsers, color: 'blue' },
        { name: 'Active Drivers', value: stats.activeDrivers, color: 'green' },
        { name: 'Total Orders', value: stats.totalOrders, color: 'yellow' },
        { name: 'Total Deliveries', value: stats.totalDeliveries, color: 'purple' },
        { name: 'Pending Orders', value: stats.pendingOrders, color: 'orange' },
        { name: 'Completed Deliveries', value: stats.completedDeliveries, color: 'indigo' },
      ] : null;
    }

    const statsArray: StatItem[] = [
      { name: 'Total Users', value: stats.totalUsers, color: 'blue' },
      { name: 'Active Drivers', value: stats.activeDrivers, color: 'green' },
      { name: 'Total Orders', value: stats.totalOrders, color: 'yellow' },
      { name: 'Total Deliveries', value: stats.totalDeliveries, color: 'purple' },
      { name: 'Pending Orders', value: stats.pendingOrders, color: 'orange' },
      { name: 'Completed Deliveries', value: stats.completedDeliveries, color: 'indigo' },
    ];

    return statsArray.sort((a: StatItem, b: StatItem) => {
      if (sortOption === 'value') {
        return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
      }
      if (sortOption === 'name') {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName < bName) return sortOrder === 'asc' ? -1 : 1;
        if (aName > bName) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  };

  useEffect(() => {
    const initializeStatus = async () => {
      await Promise.all([
        checkHealth(),
        fetchSystemStats(),
        checkServices(),
      ]);
      setLoading(false);
    };

    initializeStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(initializeStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'online':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
      case 'offline':
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'green': return 'bg-green-50 text-green-600';
      case 'yellow': return 'bg-yellow-50 text-yellow-600';
      case 'purple': return 'bg-purple-50 text-purple-600';
      case 'orange': return 'bg-orange-50 text-orange-600';
      case 'indigo': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system status...</p>
        </div>
      </div>
    );
  }

  const sortedServices = getSortedServices();
  const sortedStats = getSortedStats();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            System Status Dashboard
          </h1>
          <button
            onClick={refreshStatus}
            disabled={refreshing}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Sort Controls */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSort('name')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    sortOption === 'name' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Name {sortOption === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  onClick={() => handleSort('responseTime')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    sortOption === 'responseTime' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Response Time {sortOption === 'responseTime' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('value')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    sortOption === 'value' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Value {sortOption === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  setSortOption('value');
                  setSortOrder('desc');
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors border border-green-200"
              >
                Show First (High Values)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Status */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">System Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Overall Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(health?.status || '')}`}>
                    {health?.status || 'unknown'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Database:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(health?.database || '')}`}>
                    {health?.database || 'unknown'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Environment:</span>
                  <span className="text-sm text-gray-900">{health?.environment}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                  <span className="text-sm text-gray-900">
                    {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'unknown'}
                  </span>
                </div>
                
                {health?.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {health.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">System Statistics</h2>
              {sortedStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {sortedStats.map((stat, index) => (
                      <div key={index} className={`text-center p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs">{stat.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading statistics...</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Status */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Status</h2>
              <div className="space-y-3">
                {sortedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-500">
                        {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'online' ? 'bg-green-500' : 
                        service.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Troubleshooting Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Common Issues</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Database disconnected:</strong> Run <code className="bg-gray-100 px-1 rounded">npm run db</code></p>
                <p>• <strong>Services offline:</strong> Check if servers are running</p>
                <p>• <strong>API errors:</strong> Verify backend is accessible</p>
                <p>• <strong>Slow response:</strong> Check network connectivity</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Quick Commands</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <code className="bg-gray-100 px-1 rounded">npm run dev:full</code> - Start all services</p>
                <p>• <code className="bg-gray-100 px-1 rounded">npm run db</code> - Start database</p>
                <p>• <code className="bg-gray-100 px-1 rounded">npm run dev</code> - Start frontend</p>
                <p>• <code className="bg-gray-100 px-1 rounded">npm run build</code> - Build for production</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
          >
            Go to Application
          </button>
          <button
            onClick={() => window.open('/api/health', '_blank')}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
          >
            View API Health
          </button>
          <button
            onClick={() => window.open('http://localhost:3001', '_blank')}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
          >
            Database Admin
          </button>
        </div>
      </div>
    </div>
  );
} 