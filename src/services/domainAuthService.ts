/**
 * Domain Token Authentication Service
 * 
 * Handles domain-based token authentication for DivvyChat widget
 */

import { logger } from '../utils/logger';
import { envConfig } from '../config/environment';
import { EndpointBuilder } from '../config/endpoints';

export interface AuthConfig {
  clientId: string;
  agentId: string;
  agentKey: string;
  domain: string;
  serviceUrl: string;
}

export interface DomainToken {
  success: boolean;
  token: string;
  client_id: string;
  agent_id: string;
  domain: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface AuthError {
  error: string;
  code?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  hasAuthError: boolean;
  authErrorType: 'auth_failed' | 'network_error' | 'server_error' | 'config_not_available' | null;
  errorMessage: string | null;
}

class DomainAuthService {
  private token: string | null = null;
  private config: AuthConfig | null = null;
  private tokenExpiry: number | null = null;
  private isInitialized: boolean = false;
  private authState: AuthState = {
    isAuthenticated: false,
    isInitializing: false,
    hasAuthError: false,
    authErrorType: null,
    errorMessage: null
  };
  private authStateListeners: Array<(state: AuthState) => void> = [];

  /**
   * Add listener for authentication state changes
   */
  addAuthStateListener(listener: (state: AuthState) => void): void {
    this.authStateListeners.push(listener);
  }

  /**
   * Remove authentication state listener
   */
  removeAuthStateListener(listener: (state: AuthState) => void): void {
    this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of authentication state changes
   */
  private notifyAuthStateChange(): void {
    this.authStateListeners.forEach(listener => {
      try {
        listener({ ...this.authState });
      } catch (error) {
        logger.error('Error notifying auth state listener:', error);
      }
    });
  }

  /**
   * Update authentication state
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    logger.debug('Auth state updated:', this.authState);
    this.notifyAuthStateChange();
  }

  /**
   * Check if the chat widget should be visible based on authentication state
   */
  shouldWidgetBeVisible(): boolean {
    const state = this.getAuthState();
    
    // Widget should be hidden for authentication failures and config unavailability
    if (state.hasAuthError && (
      state.authErrorType === 'auth_failed' || 
      state.authErrorType === 'config_not_available'
    )) {
      return false;
    }
    
    // Widget should be visible for:
    // - Successful authentication
    // - During initialization
    // - Server errors (429, 500, etc.)
    // - Network errors (temporary issues)
    return true;
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Set configuration error state (e.g., when config API returns 404)
   */
  setConfigNotAvailable(errorMessage: string): void {
    this.updateAuthState({
      hasAuthError: true,
      authErrorType: 'config_not_available',
      errorMessage,
      isInitializing: false
    });
  }

  /**
   * Initialize authentication service
   * @param clientId - The client/tenant identifier
   * @param agentId - The agent identifier
   * @param agentKey - The agent API key for authentication
   * @param serviceUrl - Optional service URL override
   */
  async initialize(clientId: string, agentId: string, agentKey: string, serviceUrl?: string): Promise<void> {
    console.log('[DomainAuthService] initialize called with:', {
      clientId,
      agentId,
      agentKeyProvided: !!agentKey,
      serviceUrl: serviceUrl || envConfig.divvyChatServiceUrl
    });
    
    const domain = this.getCurrentDomain();
    
    this.config = {
      clientId,
      agentId,
      agentKey,
      domain,
      serviceUrl: serviceUrl || envConfig.divvyChatServiceUrl
    };
    
    this.token = null;
    this.tokenExpiry = null;
    this.isInitialized = true;
    
    // Set initializing state
    this.updateAuthState({
      isInitializing: true,
      hasAuthError: false,
      authErrorType: null,
      errorMessage: null
    });
    
    console.log('[DomainAuthService] Config set, calling generateDomainToken...');
    logger.config('Domain auth service initialized, testing authentication...', {
      clientId,
      domain,
      serviceUrl: this.config.serviceUrl
    });

    // Immediately test authentication during initialization
    try {
      await this.generateDomainToken();
      this.updateAuthState({
        isAuthenticated: true,
        isInitializing: false,
        hasAuthError: false,
        authErrorType: null,
        errorMessage: null
      });
      logger.config('Authentication test successful - widget enabled');
    } catch (error) {
      logger.error('Authentication test failed - widget will be disabled:', error);
      this.handleAuthenticationFailure(error);
    }
  }

  /**
   * Handle authentication failure with proper error categorization
   */
  private handleAuthenticationFailure(error: any): void {
    let authErrorType: 'auth_failed' | 'network_error' | 'server_error' = 'auth_failed';
    let errorMessage = 'Authentication failed';
    let shouldDisableWidget = true;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Categorize error based on error name and message
      if (error.name === 'AuthenticationError' || 
          errorMessage.includes('Authentication failed') || 
          errorMessage.includes('Domain not authorized') ||
          errorMessage.includes('Invalid token') ||
          errorMessage.includes('Unauthorized')) {
        authErrorType = 'auth_failed';
        shouldDisableWidget = true;
      } else if (error.name === 'RateLimitError' ||
                 errorMessage.includes('Rate limit exceeded') ||
                 errorMessage.includes('429')) {
        authErrorType = 'server_error'; // Treat rate limiting as temporary server issue
        shouldDisableWidget = false; // Widget should remain visible for rate limiting
      } else if (error.name === 'ServerError' ||
                 errorMessage.includes('Server error') ||
                 errorMessage.includes('500') ||
                 errorMessage.includes('502') ||
                 errorMessage.includes('503')) {
        authErrorType = 'server_error';
        shouldDisableWidget = false; // Widget should remain visible for server errors
      } else if (errorMessage.includes('Network') || 
                 errorMessage.includes('fetch') ||
                 errorMessage.includes('Connection') ||
                 errorMessage.includes('timeout')) {
        authErrorType = 'network_error';
        shouldDisableWidget = false; // Widget should remain visible for network issues
      } else {
        // Default to auth failure for unknown errors
        authErrorType = 'auth_failed';
        shouldDisableWidget = true;
      }
    }

    this.updateAuthState({
      isAuthenticated: false,
      isInitializing: false,
      hasAuthError: true,
      authErrorType,
      errorMessage
    });

    // Only clear tokens on authentication failures, not on temporary issues
    if (shouldDisableWidget) {
      this.clearToken();
      logger.error('Widget disabled due to authentication failure:', { authErrorType, errorMessage });
    } else {
      logger.warn('Temporary error during authentication, widget remains visible:', { authErrorType, errorMessage });
    }
  }

  /**
   * Generate domain token for current domain
   */
  async generateDomainToken(): Promise<DomainToken> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Domain authentication service not initialized');
    }

    const requestUrl = `${this.config.serviceUrl}/api/v1/auth/domain-token`;
    const requestBody = {
      client_id: this.config.clientId,
      agent_id: this.config.agentId,
      agent_key: this.config.agentKey
    };
    
    console.log('[DomainAuthService] Making domain-token request:', {
      url: requestUrl,
      body: { ...requestBody, agent_key: '***REDACTED***' }
    });

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[DomainAuthService] domain-token response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        // Handle different HTTP status codes appropriately
        if (response.status === 401 || response.status === 403) {
          // Authentication/authorization failures - these should disable the widget
          const error: AuthError = await response.json().catch(() => ({ error: 'Authentication failed' }));
          console.error('[DomainAuthService] Auth error (401/403):', error);
          const authError = new Error(`Authentication failed: ${error.error}`);
          authError.name = 'AuthenticationError';
          throw authError;
        } else if (response.status === 429) {
          // Rate limiting - temporary issue, widget should remain visible
          const error: AuthError = await response.json().catch(() => ({ error: 'Rate limit exceeded' }));
          console.error('[DomainAuthService] Rate limit error:', error);
          const rateLimitError = new Error(`Rate limit exceeded: ${error.error}`);
          rateLimitError.name = 'RateLimitError';
          throw rateLimitError;
        } else if (response.status >= 500) {
          // Server errors - temporary issue, widget should remain visible
          const error: AuthError = await response.json().catch(() => ({ error: 'Server error' }));
          console.error('[DomainAuthService] Server error:', error);
          const serverError = new Error(`Server error: ${error.error}`);
          serverError.name = 'ServerError';
          throw serverError;
        } else {
          // Other client errors (400, etc.) - could be configuration issues
          const error: AuthError = await response.json().catch(() => ({ error: 'Request failed' }));
          console.error('[DomainAuthService] Client error:', error);
          const clientError = new Error(`Request failed: ${error.error}`);
          clientError.name = 'ClientError';
          throw clientError;
        }
      }

      const tokenData: DomainToken = await response.json();
      
      // Store token and expiry time
      this.token = tokenData.token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      logger.config('Domain token generated successfully:', {
        client_id: tokenData.client_id,
        agent_id: tokenData.agent_id,
        domain: tokenData.domain,
        expires_in: tokenData.expires_in
      });
      
      return tokenData;
    } catch (error) {
      logger.error('Error generating domain token:', error);
      throw error;
    }
  }

  /**
   * Get current domain token, generating new one if needed
   */
  async getToken(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Domain authentication service not initialized');
    }

    // Check if we have a valid token
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) { // 1 minute buffer
      return this.token;
    }

    logger.config('Generating new domain token...');
    
    // Generate new token
    const tokenData = await this.generateDomainToken();
    return tokenData.token;
  }

  /**
   * Clear stored token (for logout/reset)
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
    logger.config('Domain token cleared');
  }

  /**
   * Check if current token is valid
   */
  isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry - 60000; // 1 minute buffer
  }

  /**
   * Get current domain including port for development
   */
  getCurrentDomain(): string {
    if (typeof window !== 'undefined') {
      // Include port for development environments
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // For development (localhost with port), include the port
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return port ? `${hostname}:${port}` : hostname;
      }
      
      // For production domains, just return hostname
      return hostname;
    }
    return 'localhost'; // fallback for server-side rendering
  }

  /**
   * Validate domain token with server
   */
  async validateToken(token: string, domain: string): Promise<boolean> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Domain authentication service not initialized');
    }

    try {
      const response = await fetch(`${this.config.serviceUrl}/api/v1/auth/validate-domain-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          domain: domain
        })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      logger.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Get authentication headers for API requests
   * Throws an error if authentication token is not available
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.isInitialized) {
      throw new Error('Domain authentication service not initialized');
    }
    
    const token = await this.getToken();
    if (!token) {
      throw new Error('No valid authentication token available');
    }
    
    return {
      'X-Token': token
    };
  }

  /**
   * Check if service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current configuration
   */
  getConfig(): AuthConfig | null {
    return this.config;
  }
}

// Singleton instance
export const domainAuthService = new DomainAuthService();
