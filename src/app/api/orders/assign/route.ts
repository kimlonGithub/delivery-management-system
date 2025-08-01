import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { AssignDriverRequest } from '@/types';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
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

    const body: AssignDriverRequest = await request.json();
    const { orderId, driverId } = body;

    if (!orderId || !driverId) {
      return NextResponse.json(
        { error: 'Order ID and Driver ID are required' },
        { status: 400 }
      );
    }

    // Convert to strings to ensure consistency with database
    const orderIdStr = String(orderId);
    const driverIdStr = String(driverId);

    // Check if driver is available
    const driverResponse = await axios.get(`http://localhost:3001/users/${driverIdStr}`);
    const driver = driverResponse.data;
    if (driver.role !== 'driver' || !driver.isAvailable) {
      return NextResponse.json(
        { error: 'Driver is not available' },
        { status: 400 }
      );
    }

    // Check if order exists and is pending
    const orderResponse = await axios.get(`http://localhost:3001/orders/${orderIdStr}`);
    const order = orderResponse.data;
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not available for assignment' },
        { status: 400 }
      );
    }

    // Update order with driver assignment
    const updateOrderResponse = await axios.patch(`http://localhost:3001/orders/${orderIdStr}`, {
      assignedDriverId: driverIdStr,
      status: 'assigned',
      updatedAt: new Date().toISOString(),
    });

    // Create delivery record
    const deliveryResponse = await axios.post('http://localhost:3001/deliveries', {
      orderId: orderIdStr,
      driverId: driverIdStr,
      status: 'pending',
      pickupTime: null,
      deliveryTime: null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const updatedOrder = updateOrderResponse.data;
    const delivery = deliveryResponse.data;

    return NextResponse.json({
      order: updatedOrder,
      delivery,
      message: 'Driver assigned successfully',
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 