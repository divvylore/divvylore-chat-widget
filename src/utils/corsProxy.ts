/**
 * Utility functions for handling CORS in API requests
 */

import { retryableFetch, RetryableFetchOptions } from './retryableFetch';
import { logger } from './logger';

/**
 * Interface for CORS proxy options
 */
export interface CorsProxyOptions extends RetryableFetchOptions {
  skipDirectFetch?: boolean;
  preferredProxies?: string[];
}

/**
 * List of available CORS proxies
 */
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors-proxy.htmldriven.com/?url='
];

/**
 * Utility function to handle CORS issues when connecting to external APIs
 * 
 * @param url The URL to fetch
 * @param options Fetch options and CORS proxy options
 * @returns Promise with the response
 */
export async function corsProxyFetch(url: string, options: CorsProxyOptions = {}): Promise<Response> {
  const { skipDirectFetch, preferredProxies, ...fetchOptions } = options;
  
  // If not explicitly skipping direct fetch, try it first
  if (!skipDirectFetch) {
    try {
      // First try direct fetch with retry capability
      return await retryableFetch(url, {
        ...fetchOptions,
        maxRetries: 1  // Only retry once for direct fetch
      });
    } catch (error) {
      logger.warn('Direct fetch failed, possibly due to CORS:', error);
      // Continue to proxy approach
    }
  }
  
  // Determine which proxies to try
  const proxiesToTry = preferredProxies?.length 
    ? preferredProxies 
    : CORS_PROXIES;
  
  // Try each proxy in sequence
  let lastError: Error | null = null;
  
  for (const proxyUrl of proxiesToTry) {
    try {
      const proxiedUrl = `${proxyUrl}${encodeURIComponent(url)}`;
      logger.api(`Trying via CORS proxy: ${proxiedUrl}`);
      
      return await retryableFetch(proxiedUrl, {
        ...fetchOptions,
        maxRetries: 2
      });
    } catch (proxyError) {
      logger.warn(`CORS proxy ${proxyUrl} failed:`, proxyError);
      lastError = proxyError as Error;
      // Continue to next proxy
    }
  }
  
  // If we get here, all proxies failed
  logger.error('All CORS proxies failed');
  throw lastError || new Error('Failed to fetch via all available proxies');
}

/**
 * Creates a fetch-compatible function that automatically tries CORS proxies if needed
 * 
 * @returns A fetch-like function that handles CORS issues
 */
export function createCorsProxyFetch(): typeof fetch {
  return corsProxyFetch as any;
}
