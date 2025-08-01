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
    const available = searchParams.get('available');

    let url = 'http://localhost:3001/users?role=driver';
    
    if (available === 'true') {
      url += '&isAvailable=true';
    }

    const response = await axios.get(url);
    const drivers = response.data;

    // Remove password from response
    const driversWithoutPassword = drivers.map((driver: { password: string; id: number; email: string; role: string; name: string; phone?: string; isAvailable?: boolean; createdAt: string }) => {
      const { password, ...driverWithoutPassword } = driver;
      return driverWithoutPassword;
    });

    return NextResponse.json(driversWithoutPassword);
  } catch (error) {
    console.error('Get drivers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { name, email, phone, vehicleInfo, licenseNumber, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const driverData = {
      name,
      email,
      phone: phone || '',
      vehicleInfo: vehicleInfo || '',
      licenseNumber: licenseNumber || '',
      password,
      role,
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    const response = await axios.post('http://localhost:3001/users', driverData);

    if (response.status === 201) {
      const { password: _, ...driverWithoutPassword } = response.data;
      return NextResponse.json(driverWithoutPassword, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Create driver error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('id');

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.delete(`http://localhost:3001/users/${driverId}`);

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