/**
 * DivvyChatService Integration
 *
 * This service handles integration with the DivvyChatService backend
 * providing client isolation, session management, and agent chat functionality.
 */
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
    client_icon: string;
    client_chat_title: string;
    chat_header: string;
    start_button_text?: string;
    start_button_config?: {
        text_position?: 'left' | 'right';
        font_size?: string;
        font_weight?: string;
        text_color?: string;
        font_family?: string;
    };
    popular_questions?: string[];
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
 * Service instance manager to prevent multiple instances and ensure proper caching
 */
declare class DivvyChatServiceManager {
    private static instances;
    static getInstance(clientId: string, agentId: string, baseUrl?: string, disableCache?: boolean): DivvyChatService;
    static clearInstance(clientId: string, agentId?: string): void;
    static clearAllInstances(): void;
    static hasInstance(clientId: string, agentId?: string): boolean;
}
/**
 * Main DivvyChatService integration class with multi-agent support
 */
export declare class DivvyChatService {
    private baseUrl;
    private clientId;
    private agentId;
    private sessionId;
    private clientInfo;
    private initialized;
    private initializationAttempts;
    private maxRetries;
    private isInitializing;
    private disableCache;
    constructor(clientId: string, agentId: string, baseUrl?: string, disableCache?: boolean);
    /**
     * Initialize the service by getting client information
     */
    initialize(): Promise<boolean>;
    /**
     * Send message to the agent chat endpoint
     */
    sendMessage(message: string, messageId?: string): Promise<string>;
    /**
     * Process the chat response and extract meaningful content
     */
    private processResponse;
    /**
     * Get agent status
     */
    getAgentStatus(): Promise<any>;
    /**
     * End chat session and cleanup
     */
    endChat(): Promise<boolean>;
    /**
     * Start a new chat session
     */
    startNewChat(): Promise<boolean>;
    /**
     * Get current session ID
     */
    getCurrentSessionId(): string | null;
    /**
     * Get client ID
     */
    getClientId(): string;
    /**
     * Get agent ID
     */
    getAgentId(): string;
    /**
     * Get client information
     */
    getClientInfo(): any;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
    /**
     * Reset initialization state (for testing/debugging)
     */
    resetInitialization(): void;
    /**
     * Clear cached configuration for this client (useful when tokens expire)
     */
    clearCache(): void;
    /**
     * Clear session and cache for this client-agent combination
     */
    logout(): void;
    /**
     * Static method to clear all cached data (useful for complete logout)
     */
    static clearAllCache(): void;
    /**
     * Clean up content formatting by removing excessive line breaks and spacing
     */
    /**
     * Copy text to clipboard
     */
    copyToClipboard(text: string): Promise<void>;
    /**
     * Update message reaction (like/dislike)
     */
    updateMessageReaction(messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string): Promise<void>;
    /**
     * Like a message
     */
    likeMessage(messageId: string, sessionId?: string): Promise<void>;
    /**
     * Dislike a message
     */
    dislikeMessage(messageId: string, sessionId?: string): Promise<void>;
    /**
     * Clear reaction from a message
     */
    clearMessageReaction(messageId: string, sessionId?: string): Promise<void>;
    /**
     * Retry/refresh a message by resending the previous user message
     * This will trigger a new agent response
     */
    retryMessage(messageId: string): Promise<string>;
}
export default DivvyChatService;
export { DivvyChatServiceManager };
