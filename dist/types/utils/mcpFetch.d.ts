/**
 * Utility functions for MCP API requests
 *
 * This module provides fetching capabilities specifically designed for
 * communicating with MCP server endpoints.
 */
import { RetryableFetchOptions } from './retryableFetch';
/**
 * Fetch data from MCP server with retry capabilities
 *
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the response
 */
export declare function mcpFetch(url: string, options?: RetryableFetchOptions): Promise<Response>;
