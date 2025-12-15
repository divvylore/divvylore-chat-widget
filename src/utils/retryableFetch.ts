/**
 * Utilities for making fetch requests with retries and timeouts
 */

import { logger } from './logger';

/**
 * Options for retryable fetch
 */
export interface RetryableFetchOptions extends RequestInit {
  maxRetries?: number;
  initialRetryDelayMs?: number;
  maxRetryDelayMs?: number;
  retryBackoffFactor?: number;
  retryStatusCodes?: number[];
  timeoutMs?: number;
}

/**
 * Function to fetch with exponential backoff retries
 * 
 * @param url The URL to fetch
 * @param options Fetch options including retry configuration
 * @returns Promise with the response
 */
export async function retryableFetch(
  url: string,
  options: RetryableFetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialRetryDelayMs = 1000,
    maxRetryDelayMs = 10000,
    retryBackoffFactor = 2,
    retryStatusCodes = [408, 429, 500, 502, 503, 504],
    timeoutMs = 30000,
    ...fetchOptions
  } = options;

  let currentRetry = 0;
  let currentDelay = initialRetryDelayMs;
  
  while (true) {
    try {
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        // Add the signal to the fetch options
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        // If the request succeeded but with a status code we want to retry
        if (retryStatusCodes.includes(response.status) && currentRetry < maxRetries) {
          // Check retry-after header for 429 responses
          if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            if (retryAfter) {
              const retryAfterMs = isNaN(Number(retryAfter))
                ? new Date(retryAfter).getTime() - Date.now()
                : Number(retryAfter) * 1000;
                
              if (retryAfterMs > 0) {
                currentDelay = Math.min(retryAfterMs, maxRetryDelayMs);
              }
            }
          }
          
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        // Return the successful response
        return response;
      } finally {
        // Always clear the timeout
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // If we've exhausted our retry attempts, throw the error
      if (currentRetry >= maxRetries) {
        throw error;
      }
      
      // Log retry attempt
      logger.warn(`Request to ${url} failed (attempt ${currentRetry + 1}/${maxRetries}), retrying in ${currentDelay}ms`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase counter and delay for next retry
      currentRetry++;
      currentDelay = Math.min(currentDelay * retryBackoffFactor, maxRetryDelayMs);
    }
  }
}

/**
 * Helper to create a fetch function with preset retry options
 * 
 * @param options Default retry options to apply to all requests
 * @returns A fetch-like function with retry capabilities
 */
export function createRetryableFetch(
  defaultOptions: Omit<RetryableFetchOptions, 'body' | 'method'>
): (url: string, options?: RetryableFetchOptions) => Promise<Response> {
  return (url: string, options: RetryableFetchOptions = {}) => {
    return retryableFetch(url, {
      ...defaultOptions,
      ...options,
    });
  };
}

export default retryableFetch;
