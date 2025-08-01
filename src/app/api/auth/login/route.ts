import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginRequest } from '@/types';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email, password: password ? '[HIDDEN]' : 'undefined' });

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real app, you'd fetch from your database
    // For now, we'll use the JSON server
    const response = await axios.get('http://localhost:3001/users');
    const users = response.data;
    
    console.log('Users from database:', users.map((u: { id: number; email: string; role: string }) => ({ id: u.id, email: u.email, role: u.role })));
    
    const user = users.find((u: { email: string; password: string; id: number; role: string; name: string }) => u.email === email);
    
    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    
    if (!user) {
      console.log('Login failed: User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    
    console.log('Password validation:', { isValidPassword, providedPassword: password, hashedPassword: user.password });
    
    if (!isValidPassword) {
      console.log('Login failed: Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.role);
    
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 