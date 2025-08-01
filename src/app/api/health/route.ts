import { NextResponse } from 'next/server';
import axios from 'axios';

interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
  environment: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: string;
      responseTime?: number;
      error?: string;
    };
    api: {
      status: string;
      responseTime?: number;
      error?: string;
    };
  };
  error?: string;
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    let dbStatus = 'disconnected';
    let dbResponseTime: number | undefined;
    let dbError: string | undefined;

    try {
      const dbStartTime = Date.now();
      const dbResponse = await axios.get('http://localhost:3001/users', {
        timeout: 5000,
      });
      dbResponseTime = Date.now() - dbStartTime;
      
      if (dbResponse.status === 200) {
        dbStatus = 'connected';
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Database connection failed';
    }

    // Check API endpoints
    let apiStatus = 'offline';
    let apiResponseTime: number | undefined;
    let apiError: string | undefined;

    try {
      const apiStartTime = Date.now();
      const apiResponse = await axios.get('http://localhost:3001', {
        timeout: 3000,
      });
      apiResponseTime = Date.now() - apiStartTime;
      
      if (apiResponse.status === 200) {
        apiStatus = 'online';
      }
    } catch (error) {
      apiError = error instanceof Error ? error.message : 'API connection failed';
    }

    // Determine overall status
    const overallStatus = dbStatus === 'connected' && apiStatus === 'online' ? 'ok' : 'error';

    const healthResponse: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
        api: {
          status: apiStatus,
          responseTime: apiResponseTime,
          error: apiError,
        },
      },
    };

    return NextResponse.json(healthResponse);
  } catch (error) {
    const errorResponse: HealthResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'disconnected',
          error: 'Health check failed',
        },
        api: {
          status: 'offline',
          error: 'Health check failed',
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 