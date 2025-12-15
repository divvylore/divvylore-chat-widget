/**
 * Analytics and logging utilities for MCP service interactions
 * 
 * This module provides structured logging and analytics capabilities
 * for tracking MCP service performance, errors, and usage patterns
 * in production environments.
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Analytics event types
export enum EventType {
  MCP_REQUEST = 'mcp_request',
  MCP_RESPONSE = 'mcp_response',
  MCP_ERROR = 'mcp_error',
  TOKEN_REFRESH = 'token_refresh',
  CONFIG_CHANGE = 'config_change'
}

// Analytics event interface
export interface AnalyticsEvent {
  eventType: EventType;
  timestamp: number;
  data: Record<string, any>;
  sessionId?: string;
  userId?: string;
}

// Logger interface
export interface Logger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error, data?: Record<string, any>): void;
}

// Analytics service interface
export interface AnalyticsService {
  trackEvent(eventType: EventType, data: Record<string, any>): void;
  setUser(userId: string): void;
  setSessionId(sessionId: string): void;
}

class ConsoleLogger implements Logger {
  private level: LogLevel;
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }
  
  debug(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
  
  info(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }
  
  warn(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }
  
  error(message: string, error?: Error, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, error || '', data || '');
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

class LocalAnalyticsService implements AnalyticsService {
  private sessionId: string = '';
  private userId: string = '';
  private events: AnalyticsEvent[] = [];
  private logger: Logger;
  private maxEvents: number;
  
  constructor(logger: Logger, maxEvents: number = 1000) {
    this.logger = logger;
    this.maxEvents = maxEvents;
    
    // Generate a default session ID
    this.sessionId = this.generateSessionId();
  }
  
  trackEvent(eventType: EventType, data: Record<string, any>): void {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId || undefined
    };
    
    // Add to local cache
    this.events.push(event);
    
    // Trim if too many
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Log the event
    this.logger.debug(`Analytics event: ${eventType}`, { eventType, ...data });
    
    // Save to localStorage for persistence
    this.persistEvents();
  }
  
  setUser(userId: string): void {
    this.userId = userId;
  }
  
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  private persistEvents(): void {
    try {
      localStorage.setItem('mcp-analytics-events', JSON.stringify(this.events));
    } catch (e) {
      this.logger.warn('Failed to persist analytics events', { error: e });
    }
  }
  
  // Get current events for reporting
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
  
  // Clear events
  clearEvents(): void {
    this.events = [];
    try {
      localStorage.removeItem('mcp-analytics-events');
    } catch (e) {
      this.logger.warn('Failed to clear analytics events from storage', { error: e });
    }
  }
}

/**
 * MCP service performance metrics
 */
export class MCPPerformanceMetrics {
  private requestCounts: Record<string, number> = {}; // Endpoint -> count
  private requestTimes: Record<string, number[]> = {}; // Endpoint -> response times (ms)
  private errorCounts: Record<string, number> = {}; // Error type -> count
  
  // Track a new request
  trackRequest(endpoint: string, timeMs: number, success: boolean, errorType?: string): void {
    // Increment request count
    this.requestCounts[endpoint] = (this.requestCounts[endpoint] || 0) + 1;
    
    // Record response time
    if (!this.requestTimes[endpoint]) {
      this.requestTimes[endpoint] = [];
    }
    this.requestTimes[endpoint].push(timeMs);
    
    // Limit stored times to last 100
    if (this.requestTimes[endpoint].length > 100) {
      this.requestTimes[endpoint] = this.requestTimes[endpoint].slice(-100);
    }
    
    // Track error if applicable
    if (!success && errorType) {
      this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
    }
  }
  
  // Get average response time for an endpoint
  getAverageResponseTime(endpoint: string): number {
    const times = this.requestTimes[endpoint];
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((total, time) => total + time, 0);
    return sum / times.length;
  }
  
  // Get success rate for an endpoint
  getSuccessRate(endpoint: string): number {
    const total = this.requestCounts[endpoint] || 0;
    if (total === 0) return 1; // No requests = 100% success
    
    // Sum up errors for this endpoint
    const errors = Object.keys(this.errorCounts)
      .filter(key => key.startsWith(endpoint))
      .reduce((sum, key) => sum + this.errorCounts[key], 0);
    
    return (total - errors) / total;
  }
  
  // Get summary metrics
  getSummary(): Record<string, any> {
    const endpoints = Object.keys(this.requestCounts);
    
    const summary: Record<string, any> = {};
    
    endpoints.forEach(endpoint => {
      summary[endpoint] = {
        requestCount: this.requestCounts[endpoint],
        averageResponseTime: this.getAverageResponseTime(endpoint),
        successRate: this.getSuccessRate(endpoint)
      };
    });
    
    return summary;
  }
  
  // Reset metrics
  reset(): void {
    this.requestCounts = {};
    this.requestTimes = {};
    this.errorCounts = {};
  }
}

// Create default instances for use throughout the app
export const logger = new ConsoleLogger(
  typeof window !== 'undefined' && window.location.hostname === 'localhost' ? LogLevel.DEBUG : LogLevel.INFO
);

export const analytics = new LocalAnalyticsService(logger);
export const mcpMetrics = new MCPPerformanceMetrics();

// Export configured instances
export default {
  logger,
  analytics,
  mcpMetrics,
  LogLevel,
  EventType
};
