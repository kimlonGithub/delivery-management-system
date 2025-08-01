import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import axios from 'axios';

export async function GET(
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
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const response = await axios.get(`http://localhost:3001/users/${params.id}`);
    const driver = response.data;

    // Remove password from response
    const { password, ...driverWithoutPassword } = driver;

    return NextResponse.json(driverWithoutPassword);
  } catch (error) {
    console.error('Get driver error:', error);
    return NextResponse.json(
      { error: 'Driver not found' },
      { status: 404 }
    );
  }
}

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
    if (!decoded || (decoded.role !== 'admin' && String(decoded.userId) !== params.id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone, vehicleInfo, licenseNumber, isAvailable } = body;

    const updateData: Partial<{
      name: string;
      email: string;
      phone: string;
      vehicleInfo: string;
      licenseNumber: string;
      isAvailable: boolean;
    }> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (vehicleInfo !== undefined) updateData.vehicleInfo = vehicleInfo;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const response = await axios.put(`http://localhost:3001/users/${params.id}`, updateData);

    if (response.status === 200) {
      const { password, ...driverWithoutPassword } = response.data;
      return NextResponse.json(driverWithoutPassword);
    }

    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Update driver error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const response = await axios.delete(`http://localhost:3001/users/${params.id}`);

    if (response.status === 200) {
      return NextResponse.json({ message: 'Driver deleted successfully' });
    }

    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Delete driver error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 