import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { DashboardStats } from '@/types';
import { apiRateLimiter } from '@/lib/rateLimit';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!apiRateLimiter.isAllowed(`dashboard:${clientIp}`)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const token = getTokenFromHeader(request.headers.get('authorization') || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all required data
    const [ordersResponse, driversResponse] = await Promise.all([
      axios.get('http://localhost:3001/orders'),
      axios.get('http://localhost:3001/users?role=driver'),
    ]);

    const orders = ordersResponse.data;
    const drivers = driversResponse.data;

    // Calculate statistics
    const totalOrders = orders.length;
    const totalAvailableDrivers = drivers.filter((driver: { isAvailable: boolean }) => driver.isAvailable).length;
    const totalCompletedOrders = orders.filter((order: { status: string }) => order.status === 'delivered').length;
    const totalInProgressOrders = orders.filter((order: { status: string }) => 
      order.status === 'assigned' || order.status === 'in_progress'
    ).length;

    const stats: DashboardStats = {
      totalOrders,
      totalAvailableDrivers,
      totalCompletedOrders,
      totalInProgressOrders,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 