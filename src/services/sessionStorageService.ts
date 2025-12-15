/**
 * Session Storage Service for Multi-Session Chat Management
 * 
 * This service manages multiple chat sessions with localStorage persistence,
 * GUID-based session identification, and 7-day expiration.
 */

import { logger } from '../utils/logger';
import type { Message } from '../components/DivvyloreChatWidget/types';

export interface ChatSession {
  sessionId: string;
  clientId: string;
  agentId: string;
  createdAt: number;
  lastActivity: number;
  messages: Message[];
  title?: string; // Auto-generated from first user message
  isActive: boolean;
}

export interface SessionSummary {
  sessionId: string;
  title: string;
  lastActivity: number;
  messageCount: number;
  preview: string; // First few words of last message
  isActive: boolean;
}

/**
 * Session Storage Service with localStorage persistence
 */
export class SessionStorageService {
  private static SESSION_PREFIX = 'divvy_chat_session_';
  private static SESSIONS_INDEX_KEY = 'divvy_chat_sessions_index';
  private static EXPIRY_DAYS = 7;
  private static MAX_SESSIONS_PER_CLIENT_AGENT = 50; // Prevent localStorage bloat

  /**
   * Generate a new GUID-based session ID
   */
  static generateSessionId(clientId: string, agentId: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const guidPart = Math.random().toString(36).substring(2, 15);
    return `${clientId}_${agentId}_${timestamp}_${randomPart}_${guidPart}`;
  }

  /**
   * Create a new chat session
   */
  static createSession(clientId: string, agentId: string, initialMessage?: Message): ChatSession {
    const sessionId = this.generateSessionId(clientId, agentId);
    const now = Date.now();
    
    const session: ChatSession = {
      sessionId,
      clientId,
      agentId,
      createdAt: now,
      lastActivity: now,
      messages: initialMessage ? [initialMessage] : [],
      title: initialMessage ? this.generateSessionTitle(initialMessage.text) : 'New Chat',
      isActive: true
    };

    this.saveSession(session);
    this.updateSessionsIndex(session);
    
    logger.service(`Created new session: ${sessionId}`);
    return session;
  }

  /**
   * Get a session by ID
   */
  static getSession(sessionId: string): ChatSession | null {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    
    try {
      const sessionData = localStorage.getItem(sessionKey);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as ChatSession;
      
      // Check if session has expired
      if (this.isSessionExpired(session)) {
        this.deleteSession(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      logger.error('Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Save/update a session
   */
  static saveSession(session: ChatSession): void {
    const sessionKey = `${this.SESSION_PREFIX}${session.sessionId}`;
    
    try {
      // Update last activity
      session.lastActivity = Date.now();
      
      // Update title if empty and has messages
      if (!session.title || session.title === 'New Chat') {
        const firstUserMessage = session.messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          session.title = this.generateSessionTitle(firstUserMessage.text);
        }
      }

      localStorage.setItem(sessionKey, JSON.stringify(session));
      this.updateSessionsIndex(session);
      
      logger.service(`Saved session: ${session.sessionId}`);
    } catch (error) {
      logger.error('Error saving session:', error);
    }
  }

  /**
   * Add a message to a session
   */
  static addMessageToSession(sessionId: string, message: Message): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    session.messages.push(message);
    this.saveSession(session);
    
    return true;
  }

  /**
   * Update messages for a session (replace all)
   */
  static updateSessionMessages(sessionId: string, messages: Message[]): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    session.messages = messages;
    this.saveSession(session);
    
    return true;
  }

  /**
   * Get all sessions for a client-agent combination
   */
  static getSessionsForClientAgent(clientId: string, agentId: string): SessionSummary[] {
    try {
      const index = this.getSessionsIndex();
      const clientAgentKey = `${clientId}_${agentId}`;
      const sessionIds = index[clientAgentKey] || [];

      const summaries: SessionSummary[] = [];
      
      for (const sessionId of sessionIds) {
        const session = this.getSession(sessionId);
        if (session) {
          summaries.push(this.createSessionSummary(session));
        }
      }

      // Sort by last activity (most recent first)
      summaries.sort((a, b) => b.lastActivity - a.lastActivity);
      
      return summaries;
    } catch (error) {
      logger.error('Error getting sessions for client-agent:', error);
      return [];
    }
  }

  /**
   * Delete a session
   */
  static deleteSession(sessionId: string): boolean {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    
    try {
      // Get session to find client-agent info
      const session = this.getSession(sessionId);
      
      // Remove from localStorage
      localStorage.removeItem(sessionKey);
      
      // Update index
      if (session) {
        this.removeFromSessionsIndex(session.clientId, session.agentId, sessionId);
      }
      
      logger.service(`Deleted session: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Delete all sessions for a client-agent combination
   */
  static deleteAllSessionsForClientAgent(clientId: string, agentId: string): number {
    const sessions = this.getSessionsForClientAgent(clientId, agentId);
    let deletedCount = 0;

    for (const summary of sessions) {
      if (this.deleteSession(summary.sessionId)) {
        deletedCount++;
      }
    }

    logger.service(`Deleted ${deletedCount} sessions for ${clientId}_${agentId}`);
    return deletedCount;
  }

  /**
   * Mark a session as inactive (ended)
   */
  static endSession(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = false;
    this.saveSession(session);
    
    logger.service(`Ended session: ${sessionId}`);
    return true;
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): number {
    try {
      const index = this.getSessionsIndex();
      let cleanedCount = 0;

      for (const clientAgentKey in index) {
        const sessionIds = index[clientAgentKey] || [];
        const validSessionIds: string[] = [];

        for (const sessionId of sessionIds) {
          const session = this.getSession(sessionId);
          if (session && !this.isSessionExpired(session)) {
            validSessionIds.push(sessionId);
          } else {
            // Session expired or doesn't exist, remove it
            const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
            localStorage.removeItem(sessionKey);
            cleanedCount++;
          }
        }

        index[clientAgentKey] = validSessionIds;
      }

      // Update the index
      localStorage.setItem(this.SESSIONS_INDEX_KEY, JSON.stringify(index));
      
      if (cleanedCount > 0) {
        logger.service(`Cleaned up ${cleanedCount} expired sessions`);
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get current active session for client-agent
   */
  static getActiveSession(clientId: string, agentId: string): ChatSession | null {
    const sessions = this.getSessionsForClientAgent(clientId, agentId);
    const activeSession = sessions.find(s => s.isActive);
    
    if (activeSession) {
      return this.getSession(activeSession.sessionId);
    }
    
    return null;
  }

  /**
   * Set a session as the active one (mark others as inactive)
   */
  static setActiveSession(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Mark this session as active
    session.isActive = true;
    this.saveSession(session);

    // Mark other sessions for the same client-agent as inactive
    const sessions = this.getSessionsForClientAgent(session.clientId, session.agentId);
    for (const summary of sessions) {
      if (summary.sessionId !== sessionId && summary.isActive) {
        const otherSession = this.getSession(summary.sessionId);
        if (otherSession) {
          otherSession.isActive = false;
          this.saveSession(otherSession);
        }
      }
    }

    logger.service(`Set active session: ${sessionId}`);
    return true;
  }

  // Private helper methods

  private static getSessionsIndex(): Record<string, string[]> {
    try {
      const indexData = localStorage.getItem(this.SESSIONS_INDEX_KEY);
      return indexData ? JSON.parse(indexData) : {};
    } catch (error) {
      logger.error('Error getting sessions index:', error);
      return {};
    }
  }

  private static updateSessionsIndex(session: ChatSession): void {
    try {
      const index = this.getSessionsIndex();
      const clientAgentKey = `${session.clientId}_${session.agentId}`;
      
      if (!index[clientAgentKey]) {
        index[clientAgentKey] = [];
      }

      // Add session ID if not already present
      if (!index[clientAgentKey].includes(session.sessionId)) {
        index[clientAgentKey].push(session.sessionId);
        
        // Limit the number of sessions to prevent localStorage bloat
        if (index[clientAgentKey].length > this.MAX_SESSIONS_PER_CLIENT_AGENT) {
          const oldestSessionId = index[clientAgentKey].shift();
          if (oldestSessionId) {
            this.deleteSession(oldestSessionId);
          }
        }
      }

      localStorage.setItem(this.SESSIONS_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      logger.error('Error updating sessions index:', error);
    }
  }

  private static removeFromSessionsIndex(clientId: string, agentId: string, sessionId: string): void {
    try {
      const index = this.getSessionsIndex();
      const clientAgentKey = `${clientId}_${agentId}`;
      
      if (index[clientAgentKey]) {
        index[clientAgentKey] = index[clientAgentKey].filter(id => id !== sessionId);
        localStorage.setItem(this.SESSIONS_INDEX_KEY, JSON.stringify(index));
      }
    } catch (error) {
      logger.error('Error removing from sessions index:', error);
    }
  }

  private static isSessionExpired(session: ChatSession): boolean {
    const expiryTime = this.EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return Date.now() - session.lastActivity > expiryTime;
  }

  private static generateSessionTitle(firstMessage: string): string {
    // Take first 30 characters and add ellipsis if longer
    const maxLength = 30;
    const title = firstMessage.trim();
    
    if (title.length <= maxLength) {
      return title;
    }
    
    return title.substring(0, maxLength).trim() + '...';
  }

  private static createSessionSummary(session: ChatSession): SessionSummary {
    const lastMessage = session.messages[session.messages.length - 1];
    const preview = lastMessage ? 
      (lastMessage.text.length > 50 ? 
        lastMessage.text.substring(0, 50) + '...' : 
        lastMessage.text) : 
      'No messages';

    return {
      sessionId: session.sessionId,
      title: session.title || 'New Chat',
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
      preview,
      isActive: session.isActive
    };
  }
}

/**
 * Auto-cleanup utility - call periodically to clean expired sessions
 */
export const setupSessionCleanup = () => {
  // Clean up on page load
  SessionStorageService.cleanupExpiredSessions();

  // Set up periodic cleanup (every hour)
  setInterval(() => {
    SessionStorageService.cleanupExpiredSessions();
  }, 60 * 60 * 1000);
};

export default SessionStorageService;
