export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Database configuration
  dbUrl: 'http://localhost:3001',
  
  // Hot reload settings
  hotReload: {
    enabled: true,
    pollInterval: 1000,
  },
};

export default config; 