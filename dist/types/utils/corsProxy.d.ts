/**
 * Utility functions for handling CORS in API requests
 */
import { RetryableFetchOptions } from './retryableFetch';
/**
 * Interface for CORS proxy options
 */
export interface CorsProxyOptions extends RetryableFetchOptions {
    skipDirectFetch?: boolean;
    preferredProxies?: string[];
}
/**
 * Utility function to handle CORS issues when connecting to external APIs
 *
 * @param url The URL to fetch
 * @param options Fetch options and CORS proxy options
 * @returns Promise with the response
 */
export declare function corsProxyFetch(url: string, options?: CorsProxyOptions): Promise<Response>;
/**
 * Creates a fetch-compatible function that automatically tries CORS proxies if needed
 *
 * @returns A fetch-like function that handles CORS issues
 */
export declare function createCorsProxyFetch(): typeof fetch;
