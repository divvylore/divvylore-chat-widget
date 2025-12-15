/**
 * Utilities for making fetch requests with retries and timeouts
 */
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
export declare function retryableFetch(url: string, options?: RetryableFetchOptions): Promise<Response>;
/**
 * Helper to create a fetch function with preset retry options
 *
 * @param options Default retry options to apply to all requests
 * @returns A fetch-like function with retry capabilities
 */
export declare function createRetryableFetch(defaultOptions: Omit<RetryableFetchOptions, 'body' | 'method'>): (url: string, options?: RetryableFetchOptions) => Promise<Response>;
export default retryableFetch;
