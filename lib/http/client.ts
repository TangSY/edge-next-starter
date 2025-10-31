/**
 * Axios HTTP client with unified error handling
 * Adapts backend API response format to frontend usage
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse, ApiSuccessResponse } from './types';
import { ErrorType } from '@/lib/errors';

/**
 * Create axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    config => {
      // You can add auth tokens here if needed
      // const token = getAuthToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const data = response.data;

      // Check if response follows the unified format
      if (typeof data === 'object' && data !== null && 'success' in data) {
        if (data.success) {
          // Success response - return the data directly
          return response;
        } else {
          // Error response from backend
          const errorData = data.error;
          throw new ApiError(
            errorData.message || 'Request failed',
            response.status,
            errorData.type || ErrorType.UNKNOWN_ERROR,
            errorData.details
          );
        }
      }

      // If response doesn't follow the unified format, return as is
      return response;
    },
    (error: AxiosError<ApiResponse>) => {
      // Network error or other axios errors
      if (error.response) {
        // Server responded with error status
        const data = error.response.data;

        if (typeof data === 'object' && data !== null && 'success' in data && !data.success) {
          // Unified error response
          const errorData = data.error;
          throw new ApiError(
            errorData.message || 'Request failed',
            error.response.status,
            errorData.type || ErrorType.UNKNOWN_ERROR,
            errorData.details
          );
        } else {
          // Non-unified error response
          throw new ApiError(
            error.message || 'Request failed',
            error.response.status,
            ErrorType.UNKNOWN_ERROR
          );
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new ApiError('Network error - no response received', 0, ErrorType.NETWORK_ERROR);
      } else {
        // Something happened in setting up the request
        throw new ApiError(error.message || 'Request setup failed', 0, ErrorType.UNKNOWN_ERROR);
      }
    }
  );

  return instance;
};

/**
 * Axios instance singleton
 */
export const httpClient = createAxiosInstance();

/**
 * Generic HTTP request wrapper
 * Extracts data from unified API response format
 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.request<ApiSuccessResponse<T>>(config);
  return response.data.data;
}

/**
 * HTTP client with typed methods
 */
export const http = {
  /**
   * GET request
   */
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'GET', url });
  },

  /**
   * POST request
   */
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'POST', url, data });
  },

  /**
   * PUT request
   */
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'PUT', url, data });
  },

  /**
   * PATCH request
   */
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'PATCH', url, data });
  },

  /**
   * DELETE request
   */
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'DELETE', url });
  },

  /**
   * GET request with full response (including meta)
   */
  getWithMeta: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> => {
    const response = await httpClient.request<ApiSuccessResponse<T>>({
      ...config,
      method: 'GET',
      url,
    });
    return response.data;
  },

  /**
   * POST request with full response (including meta)
   */
  postWithMeta: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> => {
    const response = await httpClient.request<ApiSuccessResponse<T>>({
      ...config,
      method: 'POST',
      url,
      data,
    });
    return response.data;
  },
};
