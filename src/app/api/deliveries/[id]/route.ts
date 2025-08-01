import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { UpdateDeliveryStatusRequest } from '@/types';
import axios from 'axios';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || undefined);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'driver') {
      return NextResponse.json(
        { error: 'Driver access required' },
        { status: 403 }
      );
    }

    const body: UpdateDeliveryStatusRequest = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current delivery
    const deliveryResponse = await axios.get(`http://localhost:3001/deliveries/${params.id}`);
    const delivery = deliveryResponse.data;
    
    // Check if driver owns this delivery
    if (delivery.driverId !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only update your own deliveries' },
        { status: 403 }
      );
    }

    const updateData: { status: string; updatedAt: string; pickupTime?: string; deliveryTime?: string; notes?: string } = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Set pickup/delivery times based on status
    if (status === 'picked_up' && !delivery.pickupTime) {
      updateData.pickupTime = new Date().toISOString();
    } else if (status === 'delivered' && !delivery.deliveryTime) {
      updateData.deliveryTime = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    const response = await axios.patch(`http://localhost:3001/deliveries/${params.id}`, updateData);
    const updatedDelivery = response.data;

    // If delivery is completed, update order status
    if (status === 'delivered') {
      await axios.patch(`http://localhost:3001/orders/${delivery.orderId}`, {
        status: 'delivered',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error('Update delivery status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 