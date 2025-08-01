import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterRequest } from '@/types';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name, role, phone } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const response = await axios.get('http://localhost:3001/users');
    const users = response.data;
    
    const existingUser = users.find((u: { email: string }) => u.email === email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      isAvailable: role === 'driver' ? true : undefined,
      createdAt: new Date().toISOString(),
    };

    // Create user in JSON server
    const createResponse = await axios.post('http://localhost:3001/users', newUser);

    const createdUser = createResponse.data;
    const token = generateToken(createdUser.id, createdUser.role);
    
    const { password: _, ...userWithoutPassword } = createdUser;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 