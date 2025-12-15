/**
 * Domain Token Authentication Service
 *
 * Handles domain-based token authentication for DivvyChat widget
 */
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
declare class DomainAuthService {
    private token;
    private config;
    private tokenExpiry;
    private isInitialized;
    private authState;
    private authStateListeners;
    /**
     * Add listener for authentication state changes
     */
    addAuthStateListener(listener: (state: AuthState) => void): void;
    /**
     * Remove authentication state listener
     */
    removeAuthStateListener(listener: (state: AuthState) => void): void;
    /**
     * Notify all listeners of authentication state changes
     */
    private notifyAuthStateChange;
    /**
     * Update authentication state
     */
    private updateAuthState;
    /**
     * Check if the chat widget should be visible based on authentication state
     */
    shouldWidgetBeVisible(): boolean;
    /**
     * Get current authentication state
     */
    getAuthState(): AuthState;
    /**
     * Set configuration error state (e.g., when config API returns 404)
     */
    setConfigNotAvailable(errorMessage: string): void;
    /**
     * Initialize authentication service
     * @param clientId - The client/tenant identifier
     * @param agentId - The agent identifier
     * @param agentKey - The agent API key for authentication
     * @param serviceUrl - Optional service URL override
     */
    initialize(clientId: string, agentId: string, agentKey: string, serviceUrl?: string): Promise<void>;
    /**
     * Handle authentication failure with proper error categorization
     */
    private handleAuthenticationFailure;
    /**
     * Generate domain token for current domain
     */
    generateDomainToken(): Promise<DomainToken>;
    /**
     * Get current domain token, generating new one if needed
     */
    getToken(): Promise<string>;
    /**
     * Clear stored token (for logout/reset)
     */
    clearToken(): void;
    /**
     * Check if current token is valid
     */
    isTokenValid(): boolean;
    /**
     * Get current domain including port for development
     */
    getCurrentDomain(): string;
    /**
     * Validate domain token with server
     */
    validateToken(token: string, domain: string): Promise<boolean>;
    /**
     * Get authentication headers for API requests
     * Throws an error if authentication token is not available
     */
    getAuthHeaders(): Promise<Record<string, string>>;
    /**
     * Check if service is initialized
     */
    get initialized(): boolean;
    /**
     * Get current configuration
     */
    getConfig(): AuthConfig | null;
}
export declare const domainAuthService: DomainAuthService;
export {};
