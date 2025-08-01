// Development configuration to reduce hot reload requests
export const devConfig = {
  // Reduce API calls during development
  apiCallDelay: 1000, // 1 second delay between API calls
  cacheTime: 30000, // 30 seconds cache
  debounceTime: 500, // 500ms debounce
  
  // Hot reload settings
  hotReload: {
    enabled: true,
    pollInterval: 2000, // 2 seconds instead of 1
    maxRetries: 3,
  },
  
  // Development mode flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isHotReload: process.env.NODE_ENV === 'development',
  
  // API request limits
  maxRequestsPerMinute: 60,
  maxConcurrentRequests: 5,
};

// Throttle function for API calls
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Debounce function for API calls
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
} 