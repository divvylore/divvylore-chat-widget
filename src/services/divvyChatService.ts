/**
 * DivvyChatService Integration
 * 
 * This service handles integration with the DivvyChatService backend
 * providing client isolation, session management, and agent chat functionality.
 */

import { EndpointBuilder, API_ENDPOINTS } from '../config/endpoints';
import { logger } from '../utils/logger';
import { domainAuthService } from './domainAuthService';
import { envConfig } from '../config/environment';

/**
 * DivvyChat Service response types
 */
export interface DivvyChatResponse {
  response: string;
  agent_info: {
    client_id: string;
    agent_id: string;
    session_id: string;
    message_id: string;
    tools_used: number;
    thinking: string;
  };
  tool_calls: any[];
  tool_results: any[];
  conversation_summary: any;
}

export interface DivvyChatConfig {
  bot_icon: string;
  bot_name: string;
  client_icon: string;  // Icon displayed in chat header and big chat button
  client_chat_title: string;  // Title displayed in chat header
  chat_header: string;  // Kept for backward compatibility
  start_button_text?: string;  // Optional text to display on the start button alongside the icon
  start_button_config?: {
    text_position?: 'left' | 'right';  // Position of text relative to icon
    font_size?: string;
    font_weight?: string;
    text_color?: string;
    font_family?: string;
  };
  popular_questions?: string[];  // Optional array of popular questions
  widget_style: {
    background_color: string;
    border_radius: string;
    font_family: string;
    primary_color: string;
    secondary_color: string;
    text_color: string;
  };
  logging?: {
    debug_mode?: boolean;
    log_level?: 'debug' | 'info' | 'warn' | 'error' | 'none';
    log_categories?: string[];
    show_timestamps?: boolean;
  };
}

export interface DivvyChatToolResult {
  tool_name: string;
  result: string;
  success: boolean;
}

/**
 * Session management for browser storage with agent support
 */
class SessionManager {
  private static SESSION_KEY_PREFIX = 'divvy_chat_session_';
  private static SESSION_EXPIRY_HOURS = 48; // 2 days

  /**
   * Generate a new session ID for a client-agent combination
   */
  static generateSessionId(clientId: string, agentId: string = 'default'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${clientId}_${agentId}_${timestamp}_${randomId}`;
  }

  /**
   * Store session ID in browser storage with expiry
   */
  static storeSessionId(clientId: string, sessionId: string, agentId: string = 'default'): void {
    const expiryTime = Date.now() + (this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    const sessionData = {
      sessionId,
      clientId,
      agentId,
      expiryTime,
      createdAt: Date.now()
    };
    
    localStorage.setItem(
      `${this.SESSION_KEY_PREFIX}${clientId}_${agentId}`,
      JSON.stringify(sessionData)
    );
  }

  /**
   * Get session ID from browser storage for specific client-agent combination
   */
  static getSessionId(clientId: string, agentId: string = 'default'): string | null {
    const sessionKey = `${this.SESSION_KEY_PREFIX}${clientId}_${agentId}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      return null;
    }

    try {
      const parsed = JSON.parse(sessionData);
      
      // Check if session has expired
      if (Date.now() > parsed.expiryTime) {
        localStorage.removeItem(sessionKey);
        return null;
      }
      
      return parsed.sessionId;
    } catch (error) {
      logger.error('Error parsing session data:', error);
      localStorage.removeItem(sessionKey);
      return null;
    }
  }

  /**
   * Clear session ID from browser storage for specific client-agent combination
   */
  static clearSessionId(clientId: string, agentId: string = 'default'): void {
    localStorage.removeItem(`${this.SESSION_KEY_PREFIX}${clientId}_${agentId}`);
  }

  /**
   * Check if session is valid and not expired for specific client-agent combination
   */
  static isSessionValid(clientId: string, agentId: string = 'default'): boolean {
    return this.getSessionId(clientId, agentId) !== null;
  }

  /**
   * Clear all sessions for a client (all agents)
   */
  static clearAllSessionsForClient(clientId: string): void {
    if (clientId === '*') {
      // Clear all sessions for all clients
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.SESSION_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return;
    }

    const prefix = `${this.SESSION_KEY_PREFIX}${clientId}_`;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Persistent config cache using localStorage with token expiry
 */
class PersistentConfigCache {
  private static CONFIG_KEY_PREFIX = 'divvy_chat_config_';
  private static CACHE_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

  static getConfig(clientId: string): any | null {
    // DISABLED: Always return null to prevent caching and ensure fresh config on each widget initialization
    // This ensures that the config API is called every time the widget loads
    logger.service(`PersistentConfigCache: Cache disabled - always fetching fresh config for ${clientId}`);
    return null;
  }

  static setConfig(clientId: string, config: any): void {
    // DISABLED: Config caching disabled to ensure fresh config on each widget initialization
    logger.service(`PersistentConfigCache: Cache disabled - not storing config for ${clientId}`);
    // No longer caching config to localStorage
  }

  static clearConfig(clientId: string): void {
    const configKey = `${this.CONFIG_KEY_PREFIX}${clientId}`;
    localStorage.removeItem(configKey);
  }

  static clearAllConfigs(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CONFIG_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Service instance manager to prevent multiple instances and ensure proper caching
 */
class DivvyChatServiceManager {
  private static instances = new Map<string, DivvyChatService>();

  static getInstance(clientId: string, agentId: string, baseUrl?: string): DivvyChatService {
    const instanceKey = `${clientId}_${agentId}`;
    
    if (!this.instances.has(instanceKey)) {
      const serviceBaseUrl = baseUrl || 'http://localhost:5001';
      logger.service(`DivvyChatServiceManager: Creating new instance for ${instanceKey}`);
      this.instances.set(instanceKey, new DivvyChatService(clientId, agentId, serviceBaseUrl));
    } else {
      logger.service(`DivvyChatServiceManager: Reusing existing instance for ${instanceKey}`);
    }
    
    return this.instances.get(instanceKey)!;
  }

  static clearInstance(clientId: string, agentId: string = 'default'): void {
    const instanceKey = `${clientId}_${agentId}`;
    this.instances.delete(instanceKey);
  }

  static clearAllInstances(): void {
    this.instances.clear();
  }

  static hasInstance(clientId: string, agentId: string = 'default'): boolean {
    const instanceKey = `${clientId}_${agentId}`;
    return this.instances.has(instanceKey);
  }
}

/**
 * Main DivvyChatService integration class with multi-agent support
 */
export class DivvyChatService {
  private baseUrl: string;
  private clientId: string;
  private agentId: string;
  private sessionId: string | null = null;
  private clientInfo: any = null;
  private initialized: boolean = false;
  private initializationAttempts: number = 0;
  private maxRetries: number = 3;
  private isInitializing: boolean = false; // Add flag to prevent concurrent initialization

  constructor(clientId: string, agentId: string, baseUrl: string = 'http://localhost:5001') {
    this.clientId = clientId;
    this.agentId = agentId;
    this.baseUrl = baseUrl;
    
    // Note: Domain authentication service should already be initialized by DivvyloreChatWidget
    // before this service is used. The widget initializes auth with agentKey for security.
    
    // Try to restore session from browser storage for this client-agent combination
    this.sessionId = SessionManager.getSessionId(clientId, agentId);
  }

  /**
   * Initialize the service by getting client information
   */
  async initialize(): Promise<boolean> {
    logger.service(`DivvyChatService: Initialize called for client ${this.clientId}, already initialized: ${this.initialized}, has clientInfo: ${!!this.clientInfo}, isInitializing: ${this.isInitializing}`);
    
    // If already initialized and has valid data, return true
    if (this.initialized && this.clientInfo) {
      // Also ensure we have a valid session
      if (!this.sessionId || !SessionManager.isSessionValid(this.clientId, this.agentId)) {
        logger.service(`DivvyChatService: Session expired for client ${this.clientId}, creating new session`);
        this.sessionId = SessionManager.generateSessionId(this.clientId, this.agentId);
        SessionManager.storeSessionId(this.clientId, this.sessionId, this.agentId);
      }
      logger.service(`DivvyChatService: Already initialized for client ${this.clientId}, skipping initialization`);
      return true;
    }

    // If already initializing, wait for it to complete
    if (this.isInitializing) {
      logger.service(`DivvyChatService: Already initializing for client ${this.clientId}, waiting...`);
      // Simple polling wait with timeout
      let waitTime = 0;
      const maxWaitTime = 10000; // 10 seconds max wait
      
      while (this.isInitializing && waitTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
      }
      
      if (waitTime >= maxWaitTime) {
        logger.error(`DivvyChatService: Initialization timeout for client ${this.clientId}`);
        this.isInitializing = false; // Reset the flag
        return false;
      }
      
      return this.initialized && !!this.clientInfo;
    }

    this.isInitializing = true;

    // Check if we have cached config even if not marked as initialized
    if (!this.clientInfo) {
      this.clientInfo = PersistentConfigCache.getConfig(this.clientId);
      if (this.clientInfo) {
        logger.service(`DivvyChatService: Found cached config for client ${this.clientId}, marking as initialized`);
        this.initialized = true;
        this.isInitializing = false;
        return true;
      }
    }

    // Check retry limit
    if (this.initializationAttempts >= this.maxRetries) {
      logger.error(`DivvyChatService: Maximum initialization attempts (${this.maxRetries}) reached for client ${this.clientId}`);
      this.isInitializing = false;
      return false;
    }

    this.initializationAttempts++;

    try {
      logger.service(`DivvyChatService: Initialization attempt ${this.initializationAttempts}/${this.maxRetries} for client ${this.clientId}`);
      
      // First, try to get config from cache (double-check after retry limit)
      this.clientInfo = PersistentConfigCache.getConfig(this.clientId);
      
      if (!this.clientInfo) {
        // Config not cached or expired, fetch from server
        logger.service(`DivvyChatService: Config not cached, fetching from server for client ${this.clientId}`);
        
        const configUrl = EndpointBuilder.config(this.baseUrl, this.agentId);
        const authHeaders = await domainAuthService.getAuthHeaders();
        
        // Ensure we have valid authentication before proceeding
        if (!authHeaders['X-Token']) {
          throw new Error('Authentication required: No valid domain token available');
        }
        
        const response = await fetch(configUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });

        if (!response.ok) {
          // Handle authentication errors specifically
          if (response.status === 401 || response.status === 403) {
            logger.service(`DivvyChatService: Authentication failed for client ${this.clientId}, clearing cache`);
            this.clearCache();
            throw new Error(`Authentication failed: ${response.statusText}`);
          }
          throw new Error(`Failed to get client config: ${response.statusText}`);
        }

        this.clientInfo = await response.json();
        
        // Extract client_config if the response is wrapped
        if (this.clientInfo.client_config) {
          this.clientInfo = this.clientInfo.client_config;
        }
        
        // Cache the config for 2 days
        PersistentConfigCache.setConfig(this.clientId, this.clientInfo);
      } else {
        logger.service(`DivvyChatService: Using cached config for client ${this.clientId}`);
      }
      
      // Create session if none exists
      if (!this.sessionId) {
        this.sessionId = SessionManager.generateSessionId(this.clientId, this.agentId);
        SessionManager.storeSessionId(this.clientId, this.sessionId, this.agentId);
      }

      this.initialized = true;
      logger.service(`DivvyChatService: Successfully initialized for client ${this.clientId}`, this.clientInfo);
      return true;
    } catch (error) {
      logger.error(`DivvyChatService: Initialization attempt ${this.initializationAttempts} failed for client ${this.clientId}:`, error);
      
      // If this was the last attempt, mark as failed
      if (this.initializationAttempts >= this.maxRetries) {
        logger.error(`DivvyChatService: All initialization attempts failed for client ${this.clientId}`);
      }
      
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Send message to the agent chat endpoint
   */
  async sendMessage(message: string, messageId?: string): Promise<string> {
    // Ensure service is fully initialized before sending message
    if (!this.isInitialized()) {
      logger.service(`DivvyChatService: Service not fully initialized for client ${this.clientId}, attempting to initialize...`);
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error('Service initialization failed. Please check your configuration and try again.');
      }
    }

    // Additional session validation - check if sessionId exists and is valid in localStorage
    if (!this.sessionId || !SessionManager.isSessionValid(this.clientId, this.agentId)) {
      logger.service(`DivvyChatService: Session invalid or expired for client ${this.clientId}, creating new session...`);
      
      // Create a new session
      this.sessionId = SessionManager.generateSessionId(this.clientId, this.agentId);
      SessionManager.storeSessionId(this.clientId, this.sessionId, this.agentId);
      
      logger.service(`DivvyChatService: New session created: ${this.sessionId}`);
    }

    // Final validation - ensure we have all required data
    if (!this.sessionId || !this.clientInfo) {
      throw new Error('Service state is invalid. Please refresh the page and try again.');
    }

    try {
      const chatUrl = EndpointBuilder.agentChat(this.baseUrl);
      let authHeaders;
      
      try {
        authHeaders = await domainAuthService.getAuthHeaders();
      } catch (authError) {
        logger.error(`DivvyChatService: Authentication error for client ${this.clientId}:`, authError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }
      
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId,
          'X-Agent-ID': this.agentId,
          ...authHeaders,
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          agent_id: this.agentId,
          message_id: messageId, // Send the frontend-generated message ID
        }),
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          // Authentication failed - clear cache and suggest refresh
          logger.service(`DivvyChatService: Authentication failed, clearing cache for client ${this.clientId}`);
          this.clearCache();
          throw new Error('Authentication failed. Please refresh the page and try again.');
        }
        
        if (response.status === 400) {
          // Bad request - possibly invalid session
          const errorText = await response.text();
          logger.service(`DivvyChatService: Bad request for client ${this.clientId}, creating new session. Error: ${errorText}`);
          
          // Try creating a new session and retrying once
          this.sessionId = SessionManager.generateSessionId(this.clientId, this.agentId);
          SessionManager.storeSessionId(this.clientId, this.sessionId, this.agentId);
          
          // Retry with new session
          const retryResponse = await fetch(chatUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-ID': this.clientId,
              'X-Agent-ID': this.agentId,
              ...authHeaders,
            },
            body: JSON.stringify({
              message,
              session_id: this.sessionId,
              agent_id: this.agentId,
              message_id: messageId, // Send the frontend-generated message ID
            }),
          });
          
          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            logger.error('DivvyChatService retry failed:', retryErrorText);
            throw new Error(`Chat request failed after retry: ${retryResponse.statusText}`);
          }
          
          // Use retry response for processing
          const retryData: DivvyChatResponse = await retryResponse.json();
          return this.processResponse(retryData);
        }
        
        // Other errors
        const errorText = await response.text();
        logger.error('DivvyChatService error response:', errorText);
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const data: DivvyChatResponse = await response.json();
      return this.processResponse(data);
      
    } catch (error) {
      // Handle network errors and other exceptions
      if (error instanceof TypeError && error.message.includes('fetch')) {
        logger.error('Network error in sendMessage:', error);
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      logger.error('Error sending message:', error);
      
      // Re-throw known errors as-is
      if (error instanceof Error && (
        error.message.includes('Authentication failed') ||
        error.message.includes('Chat request failed') ||
        error.message.includes('Network error')
      )) {
        throw error;
      }
      
      // Generic error for unknown issues
      throw new Error('Failed to send message. Please try again.');
    }
  }

  /**
   * Process the chat response and extract meaningful content
   */
  private processResponse(data: DivvyChatResponse): string {
    // Debug logging - let's see exactly what we're getting
    logger.api('Full API Response:', JSON.stringify(data, null, 2));
    
    // ONLY process tool_results - completely ignore everything else
    if (data.tool_results && data.tool_results.length > 0) {
      logger.api('Found tool_results:', data.tool_results.length);
      
      // Extract ONLY the content from tool_results
      const allContent: string[] = [];
      
      data.tool_results.forEach((toolResult: any, index: number) => {
        logger.api(`Processing tool_result ${index}:`, toolResult);
        
        if (toolResult.result && toolResult.result.results && Array.isArray(toolResult.result.results)) {
          // Handle search results format
          toolResult.result.results.forEach((item: any, itemIndex: number) => {
            if (item.content && typeof item.content === 'string' && item.content.trim()) {
              logger.api(`Found content in item ${itemIndex}:`, item.content.substring(0, 100) + '...');
              
              // ONLY add the content - no source information
              const contentText = item.content.trim();
              allContent.push(contentText);
            }
          });
        } else if (toolResult.content && typeof toolResult.content === 'string' && toolResult.content.trim()) {
          // Direct content
          logger.api('Found direct content:', toolResult.content.substring(0, 100) + '...');
          allContent.push(toolResult.content.trim());
        }
      });
      
      if (allContent.length > 0) {
        // Join all content with double line breaks for separation
        const finalContent = allContent.join('\n\n');
        logger.api('Final content to display:');
        logger.api(finalContent);
        logger.api('Final content length:', finalContent.length);
        logger.api('Final content (raw):', JSON.stringify(finalContent));
        return finalContent;
      }
    }
    
    // No meaningful tool results found - check if agent provided a direct response
    if (data.response && typeof data.response === 'string' && data.response.trim()) {
      logger.api('Using agent\'s direct response since no tool results found');
      return data.response.trim();
    }
    
    // No tool results or agent response found
    logger.warn('No tool results or agent response found');
    return "I apologize, but I couldn't find any relevant information to answer your previous question. Could you please try rephrasing your question or providing more specific details? I'm here to help and want to make sure I give you the most accurate information possible.";
  }

  /**
   * Get agent status
   */
  async getAgentStatus(): Promise<any> {
    try {
      const statusUrl = EndpointBuilder.agentStatus(this.baseUrl, this.clientId, this.agentId);
      const authHeaders = await domainAuthService.getAuthHeaders();
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId,
          'X-Agent-ID': this.agentId,
          ...authHeaders,
        },
      });

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting agent status:', error);
      return null;
    }
  }

  /**
   * End chat session and cleanup
   */
  async endChat(): Promise<boolean> {
    if (!this.sessionId) {
      return true; // Already ended
    }

    try {
      // Reset agent conversation on the server
      const resetUrl = EndpointBuilder.agentReset(this.baseUrl);
      const authHeaders = await domainAuthService.getAuthHeaders();
      
      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId,
          'X-Agent-ID': this.agentId,
          ...authHeaders,
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          agent_id: this.agentId,
        }),
      });

      if (response.ok) {
        logger.service('Chat session ended successfully');
      } else {
        logger.warn('Failed to end chat session on server, but continuing cleanup');
      }

      // Clear session from browser storage
      SessionManager.clearSessionId(this.clientId, this.agentId);
      this.sessionId = null;

      return true;
    } catch (error) {
      logger.error('Error ending chat session:', error);
      
      // Still clear local session even if server request fails
      SessionManager.clearSessionId(this.clientId, this.agentId);
      this.sessionId = null;
      
      return false;
    }
  }

  /**
   * Start a new chat session
   */
  async startNewChat(): Promise<boolean> {
    try {
      // End current session first
      await this.endChat();
      
      // Create new session
      this.sessionId = SessionManager.generateSessionId(this.clientId, this.agentId);
      SessionManager.storeSessionId(this.clientId, this.sessionId, this.agentId);
      
      return true;
    } catch (error) {
      logger.error('Error starting new chat:', error);
      return false;
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Get agent ID
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get client information
   */
  getClientInfo(): any {
    return this.clientInfo;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    const hasValidSession = this.sessionId !== null && SessionManager.isSessionValid(this.clientId, this.agentId);
    const hasClientInfo = this.clientInfo !== null;
    const isMarkedInitialized = this.initialized;
    
    const result = isMarkedInitialized && hasValidSession && hasClientInfo;
    
    if (!result) {
      logger.service(`DivvyChatService: isInitialized check failed for client ${this.clientId} - initialized: ${isMarkedInitialized}, hasValidSession: ${hasValidSession}, hasClientInfo: ${hasClientInfo}`);
    }
    
    return result;
  }

  /**
   * Reset initialization state (for testing/debugging)
   */
  resetInitialization(): void {
    this.initialized = false;
    this.initializationAttempts = 0;
    this.clientInfo = null;
  }

  /**
   * Clear cached configuration for this client (useful when tokens expire)
   */
  clearCache(): void {
    PersistentConfigCache.clearConfig(this.clientId);
    this.clientInfo = null;
    this.initialized = false;
    logger.service(`DivvyChatService: Cache cleared for client ${this.clientId}`);
  }

  /**
   * Clear session and cache for this client-agent combination
   */
  logout(): void {
    SessionManager.clearSessionId(this.clientId, this.agentId);
    this.clearCache();
    this.sessionId = null;
    logger.service(`DivvyChatService: Logged out client ${this.clientId}, agent ${this.agentId}`);
  }

  /**
   * Static method to clear all cached data (useful for complete logout)
   */
  static clearAllCache(): void {
    PersistentConfigCache.clearAllConfigs();
    SessionManager.clearAllSessionsForClient('*'); // This would need to be implemented
    DivvyChatServiceManager.clearAllInstances();
    logger.service('DivvyChatService: All cache cleared');
  }

  /**
   * Clean up content formatting by removing excessive line breaks and spacing
   */

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      logger.service('Text copied to clipboard successfully');
    } catch (error) {
      logger.error('Failed to copy text to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }

  /**
   * Update message reaction (like/dislike)
   */
  async updateMessageReaction(messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Service not properly initialized');
      }

      const currentSessionId = sessionId || this.sessionId;
      if (!currentSessionId) {
        throw new Error('No active session');
      }

      const requestData = {
        session_id: currentSessionId,
        message_id: messageId,
        reaction: reaction
      };

      logger.service(`Updating message ${messageId} with reaction: ${reaction}`);

      // Get the base URL from client info or fallback to environment config
      const baseUrl = this.clientInfo?.base_url || envConfig.divvyChatServiceUrl;
      
      if (!baseUrl) {
        throw new Error('No base URL available from client configuration or environment');
      }

      const response = await fetch(
        EndpointBuilder.agentUpdateReaction(baseUrl),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-ID': this.clientId,
            'X-Agent-ID': this.agentId,
            ...await domainAuthService.getAuthHeaders()
          },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update reaction: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      logger.service(`Successfully updated message reaction: ${result.message}`);

    } catch (error) {
      logger.error('Error updating message reaction:', error);
      throw error;
    }
  }

  /**
   * Like a message
   */
  async likeMessage(messageId: string, sessionId?: string): Promise<void> {
    await this.updateMessageReaction(messageId, 'liked', sessionId);
  }

  /**
   * Dislike a message
   */
  async dislikeMessage(messageId: string, sessionId?: string): Promise<void> {
    await this.updateMessageReaction(messageId, 'disliked', sessionId);
  }

  /**
   * Clear reaction from a message
   */
  async clearMessageReaction(messageId: string, sessionId?: string): Promise<void> {
    await this.updateMessageReaction(messageId, '', sessionId);
  }

  /**
   * Retry/refresh a message by resending the previous user message
   * This will trigger a new agent response
   */
  async retryMessage(messageId: string): Promise<string> {
    try {
      // For now, we'll need to get the previous user message from context
      // This would ideally be handled by the chat component that has message history
      throw new Error('Retry functionality should be handled by the chat component with message history');
    } catch (error) {
      logger.error('Error retrying message:', error);
      throw error;
    }
  }
}

export default DivvyChatService;
export { DivvyChatServiceManager };
