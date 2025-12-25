/**
 * API Endpoints Configuration
 * 
 * Centralized endpoint definitions for DivvyChat project.
 * Only includes endpoints actually used by DivvyChat.
 */

/**
 * API endpoint paths used by DivvyChat
 */
export const API_ENDPOINTS = {
  // Configuration endpoint
  CONFIG: '/config',
  
  // Agent API endpoints (only ones used by DivvyChat)
  AGENT: {
    CHAT: '/api/v1/agent/chat',
    STATUS: '/api/v1/agent/status', 
    RESET: '/api/v1/agent/reset',
    UPDATE_REACTION: '/api/v1/agent/chat/update-reaction'
  }
} as const;

/**
 * Helper function to build full URL with base URL
 */
export function buildEndpointUrl(baseUrl: string, endpoint: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Helper function to build URL with query parameters
 */
export function buildUrlWithQuery(baseUrl: string, endpoint: string, queryParams?: Record<string, string | number | boolean>): string {
  const url = buildEndpointUrl(baseUrl, endpoint);
  
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return url;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  return `${url}?${searchParams.toString()}`;
}

/**
 * Endpoint builders for DivvyChat specific endpoints with agent support
 */
export const EndpointBuilder = {
  /**
   * Build config endpoint with required agent_id parameter
   * Authentication is required via X-Token header from domain authentication
   * @param baseUrl - Base URL for API
   * @param agentId - Agent ID
   * @param refresh - If true, bypasses cache to fetch fresh configuration (useful for playground/testing)
   */
  config: (baseUrl: string, agentId: string, refresh: boolean = false): string => {
    const params: Record<string, string | boolean> = { agent_id: agentId };
    if (refresh) {
      params.refresh = true;
    }
    return buildUrlWithQuery(baseUrl, API_ENDPOINTS.CONFIG, params);
  },
  
  /**
   * Build agent chat endpoint
   */
  agentChat: (baseUrl: string): string => {
    return buildEndpointUrl(baseUrl, API_ENDPOINTS.AGENT.CHAT);
  },
  
  /**
   * Build agent status endpoint with client_id and optional agent_id query parameters
   */
  agentStatus: (baseUrl: string, clientId: string, agentId?: string): string => {
    const params: Record<string, string> = { client_id: clientId };
    if (agentId && agentId !== 'default') {
      params.agent_id = agentId;
    }
    return buildUrlWithQuery(baseUrl, API_ENDPOINTS.AGENT.STATUS, params);
  },
  
  /**
   * Build agent reset endpoint
   */
  agentReset: (baseUrl: string): string => {
    return buildEndpointUrl(baseUrl, API_ENDPOINTS.AGENT.RESET);
  },

  /**
   * Build agent update reaction endpoint
   */
  agentUpdateReaction: (baseUrl: string): string => {
    return buildEndpointUrl(baseUrl, API_ENDPOINTS.AGENT.UPDATE_REACTION);
  }
};

export default API_ENDPOINTS;
