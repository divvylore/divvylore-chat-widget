/**
 * API Endpoints Configuration
 *
 * Centralized endpoint definitions for DivvyChat project.
 * Only includes endpoints actually used by DivvyChat.
 */
/**
 * API endpoint paths used by DivvyChat
 */
export declare const API_ENDPOINTS: {
    readonly CONFIG: "/config";
    readonly AGENT: {
        readonly CHAT: "/api/v1/agent/chat";
        readonly STATUS: "/api/v1/agent/status";
        readonly RESET: "/api/v1/agent/reset";
        readonly UPDATE_REACTION: "/api/v1/agent/chat/update-reaction";
    };
};
/**
 * Helper function to build full URL with base URL
 */
export declare function buildEndpointUrl(baseUrl: string, endpoint: string): string;
/**
 * Helper function to build URL with query parameters
 */
export declare function buildUrlWithQuery(baseUrl: string, endpoint: string, queryParams?: Record<string, string | number | boolean>): string;
/**
 * Endpoint builders for DivvyChat specific endpoints with agent support
 */
export declare const EndpointBuilder: {
    /**
     * Build config endpoint with required agent_id parameter
     * Authentication is required via X-Token header from domain authentication
     * @param baseUrl - Base URL for API
     * @param agentId - Agent ID
     * @param refresh - If true, bypasses cache to fetch fresh configuration (useful for playground/testing)
     */
    config: (baseUrl: string, agentId: string, refresh?: boolean) => string;
    /**
     * Build agent chat endpoint
     */
    agentChat: (baseUrl: string) => string;
    /**
     * Build agent status endpoint with client_id and optional agent_id query parameters
     */
    agentStatus: (baseUrl: string, clientId: string, agentId?: string) => string;
    /**
     * Build agent reset endpoint
     */
    agentReset: (baseUrl: string) => string;
    /**
     * Build agent update reaction endpoint
     */
    agentUpdateReaction: (baseUrl: string) => string;
};
export default API_ENDPOINTS;
