import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import axios from 'axios';

interface UseApiOptions {
  immediate?: boolean;
  cacheTime?: number;
  debounceTime?: number;
  key?: string; // Stable key to prevent unnecessary re-fetches
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const lastUrlRef = useRef<string>('');

  const {
    immediate = true,
    cacheTime = 30000, // 30 seconds
    debounceTime = 300, // 300ms
    key,
  } = options;

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!token || !url) return;

    // Use key if provided, otherwise use URL
    const cacheKey = key ? `${key}-${token}` : `${url}-${token}`;
    const cached = cacheRef.current.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(url, {
        signal,
      });

      const result = response.data;
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
    } catch (err) {
      if (axios.isCancel(err)) {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, token, cacheTime, key]);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      fetchData(abortControllerRef.current.signal);
    }, debounceTime);
  }, [fetchData, debounceTime]);

  // Store debouncedFetch in a ref to prevent unnecessary re-renders
  const debouncedFetchRef = useRef(debouncedFetch);
  debouncedFetchRef.current = debouncedFetch;

  const refetch = useCallback(async () => {
    // Clear cache for this URL/key
    const cacheKey = key ? `${key}-${token}` : `${url}-${token}`;
    cacheRef.current.delete(cacheKey);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    await fetchData(abortControllerRef.current.signal);
  }, [url, token, fetchData, key]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
    // Update cache
    const cacheKey = key ? `${key}-${token}` : `${url}-${token}`;
    cacheRef.current.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
    });
  }, [url, token, key]);

  useEffect(() => {
    // Only fetch if URL has actually changed or if we have a stable key
    const shouldFetch = immediate && token && url && (key || url !== lastUrlRef.current);
    
    if (shouldFetch) {
      lastUrlRef.current = url;
      debouncedFetchRef.current();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, token, url, key]);

  return { data, loading, error, refetch, mutate };
} 