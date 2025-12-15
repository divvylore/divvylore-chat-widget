/**
 * Session Storage Service for Multi-Session Chat Management
 *
 * This service manages multiple chat sessions with localStorage persistence,
 * GUID-based session identification, and 7-day expiration.
 */
import type { Message } from '../components/DivvyloreChatWidget/types';
export interface ChatSession {
    sessionId: string;
    clientId: string;
    agentId: string;
    createdAt: number;
    lastActivity: number;
    messages: Message[];
    title?: string;
    isActive: boolean;
}
export interface SessionSummary {
    sessionId: string;
    title: string;
    lastActivity: number;
    messageCount: number;
    preview: string;
    isActive: boolean;
}
/**
 * Session Storage Service with localStorage persistence
 */
export declare class SessionStorageService {
    private static SESSION_PREFIX;
    private static SESSIONS_INDEX_KEY;
    private static EXPIRY_DAYS;
    private static MAX_SESSIONS_PER_CLIENT_AGENT;
    /**
     * Generate a new GUID-based session ID
     */
    static generateSessionId(clientId: string, agentId: string): string;
    /**
     * Create a new chat session
     */
    static createSession(clientId: string, agentId: string, initialMessage?: Message): ChatSession;
    /**
     * Get a session by ID
     */
    static getSession(sessionId: string): ChatSession | null;
    /**
     * Save/update a session
     */
    static saveSession(session: ChatSession): void;
    /**
     * Add a message to a session
     */
    static addMessageToSession(sessionId: string, message: Message): boolean;
    /**
     * Update messages for a session (replace all)
     */
    static updateSessionMessages(sessionId: string, messages: Message[]): boolean;
    /**
     * Get all sessions for a client-agent combination
     */
    static getSessionsForClientAgent(clientId: string, agentId: string): SessionSummary[];
    /**
     * Delete a session
     */
    static deleteSession(sessionId: string): boolean;
    /**
     * Delete all sessions for a client-agent combination
     */
    static deleteAllSessionsForClientAgent(clientId: string, agentId: string): number;
    /**
     * Mark a session as inactive (ended)
     */
    static endSession(sessionId: string): boolean;
    /**
     * Clean up expired sessions
     */
    static cleanupExpiredSessions(): number;
    /**
     * Get current active session for client-agent
     */
    static getActiveSession(clientId: string, agentId: string): ChatSession | null;
    /**
     * Set a session as the active one (mark others as inactive)
     */
    static setActiveSession(sessionId: string): boolean;
    private static getSessionsIndex;
    private static updateSessionsIndex;
    private static removeFromSessionsIndex;
    private static isSessionExpired;
    private static generateSessionTitle;
    private static createSessionSummary;
}
/**
 * Auto-cleanup utility - call periodically to clean expired sessions
 */
export declare const setupSessionCleanup: () => void;
export default SessionStorageService;
