import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');

    console.log('Deliveries API - Driver ID:', driverId);
    console.log('Deliveries API - Status:', status);

    let url = 'http://localhost:3001/deliveries';
    const params = new URLSearchParams();
    
    if (driverId) params.append('driverId', driverId);
    if (status) params.append('status', status);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Deliveries API - URL:', url);

    const response = await axios.get(url);
    const deliveries = response.data;

    console.log('Deliveries API - Response:', deliveries);

    // If driver is requesting their deliveries, include order details
    if (decoded.role === 'driver' && driverId) {
      const deliveriesWithOrders = await Promise.all(
        deliveries.map(async (delivery: { orderId: number; id: number; driverId: number; status: string; pickupTime: string | null; deliveryTime: string | null; notes: string; createdAt: string; updatedAt: string }) => {
          const orderResponse = await axios.get(`http://localhost:3001/orders/${delivery.orderId}`);
          const order = orderResponse.data;
          return { ...delivery, order };
        })
      );
      return NextResponse.json(deliveriesWithOrders);
    }

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 