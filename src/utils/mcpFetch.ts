/**
 * Utility functions for MCP API requests
 * 
 * This module provides fetching capabilities specifically designed for
 * communicating with MCP server endpoints.
 */

import { retryableFetch, RetryableFetchOptions } from './retryableFetch';

/**
 * Fetch data from MCP server with retry capabilities
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the response
 */
export async function mcpFetch(url: string, options: RetryableFetchOptions = {}): Promise<Response> {
  // Using retryableFetch for automatic retry capabilities
  return await retryableFetch(url, {
    // Default options for MCP endpoints
    credentials: 'include', // Include credentials for cross-origin requests
    mode: 'cors', // Explicitly enable CORS
    ...options,
    maxRetries: options.maxRetries ?? 2 // Default to 2 retries
  });
}
