/**
 * Types for the chat services
 */

/**
 * Represents a single chat message in the conversation
 */
export interface ChatMessage {
  /** Unique message identifier (usually a timestamp) */
  id: number;
  
  /** Who sent the message */
  sender: "user" | "bot";
  
  /** Message content */
  text: string;
  
  /** Optional URL for the avatar image */
  avatarUrl?: string;
}

/**
 * Represents a chat conversation history item
 */
export interface ChatHistoryItem {
  /** Unique identifier for the chat session */
  id: string;
  
  /** Title of the chat (usually derived from the first message) */
  title: string;
  
  /** Last message sender name */
  lastMessage: string;
  
  /** Timestamp of the last message */
  timestamp: string;
  
  /** Whether the chat is currently open */
  isOpen: boolean;
  
  /** Optional array of messages in this chat */
  messages?: ChatMessage[];
}

/**
 * Organization configuration
 */
export interface OrgConfig {
  /** Organization ID */
  id: string;
  
  /** Organization name */
  name: string;
  
  /** Organization URL */
  url: string;
  
  /** Welcome message to display */
  welcomeMessage: string;
  
  /** Popular questions to suggest */
  popularQuestions: string[];
  
  /** Theme configuration */
  theme?: {
    /** Primary color for the chat widget */
    primaryColor?: string;
    
    /** Bot avatar URL */
    botAvatarUrl?: string;
    
    /** User avatar URL */
    userAvatarUrl?: string | null;
    
    /** Bot name to display */
    botName?: string;
  };
}

/**
 * MCP Server configuration
 */
export interface MCPConfig {
  /** Server endpoint URL (base URL without trailing slash) */
  endpoint: string;
  
  /** API key or token for authentication */
  apiKey?: string;
  
  /** Additional headers */
  headers?: Record<string, string>;
  
  /** API endpoint paths */
  paths?: {
    /** Path for chat API (default: "/api/chat") */
    chat?: string;
    
    /** Path for streaming chat API (default: "/api/chat/stream") */
    chatStream?: string;
    
    /** Path for health check API (default: "/api/health") */
    health?: string;
    
    /** Path for popular questions API (default: "/api/popular-questions") */
    popularQuestions?: string;
    
    /** Path for initialization API (default: "/chat/initialize") */
    initialize?: string;
  };
}

/**
 * MCP Server request payload
 */
export interface MCPRequest {
  /** Message text */
  message: string;
  
  /** Organization ID */
  orgId: string;
  
  /** Chat history for context */
  history?: ChatMessage[];
  
  /** Additional parameters */
  parameters?: Record<string, any>;
}

/**
 * MCP Server response
 */
export interface MCPResponse {
  /** Response text */
  text: string;
  
  /** Response ID */
  id: string;
  
  /** Additional data */
  [key: string]: any;
}

/**
 * Chat message with streaming support
 * Extends ChatMessage with streaming-specific properties
 */
export interface StreamingChatMessage extends ChatMessage {
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
  
  /** The stream ID if applicable */
  streamId?: string;
}

/**
 * User information for authenticated chat sessions
 */
export interface ChatUserInfo {
  /** User identifier */
  id: string;
  
  /** User display name */
  name: string;
  
  /** User email address */
  email?: string;
  
  /** User avatar URL */
  avatarUrl?: string;
  
  /** User preferences */
  preferences?: {
    /** Theme preference */
    theme?: 'light' | 'dark' | 'system';
    
    /** Whether to save chat history */
    saveHistory?: boolean;
    
    /** Other user preferences */
    [key: string]: any;
  };
}

/**
 * Configuration for real-time features
 */
export interface RealtimeConfig {
  /** WebSocket endpoint */
  wsEndpoint: string;
  
  /** Authentication token for WebSocket */
  authToken?: string;
  
  /** Reconnect strategy */
  reconnect?: {
    /** Whether to automatically reconnect */
    auto: boolean;
    
    /** Max reconnect attempts */
    maxAttempts: number;
    
    /** Base delay between reconnect attempts (in ms) */
    baseDelay: number;
  };
}

/**
 * Chat analytics event
 */
export interface ChatAnalyticsEvent {
  /** Event type */
  type: 'message_sent' | 'message_received' | 'chat_started' | 'chat_ended' | 'error' | string;
  
  /** Event timestamp */
  timestamp: string;
  
  /** Organization ID */
  orgId: string;
  
  /** Session ID */
  sessionId: string;
  
  /** User ID if available */
  userId?: string;
  
  /** Additional event data */
  data?: Record<string, any>;
}
