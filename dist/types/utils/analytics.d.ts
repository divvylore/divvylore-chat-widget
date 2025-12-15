/**
 * Analytics and logging utilities for MCP service interactions
 *
 * This module provides structured logging and analytics capabilities
 * for tracking MCP service performance, errors, and usage patterns
 * in production environments.
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export declare enum EventType {
    MCP_REQUEST = "mcp_request",
    MCP_RESPONSE = "mcp_response",
    MCP_ERROR = "mcp_error",
    TOKEN_REFRESH = "token_refresh",
    CONFIG_CHANGE = "config_change"
}
export interface AnalyticsEvent {
    eventType: EventType;
    timestamp: number;
    data: Record<string, any>;
    sessionId?: string;
    userId?: string;
}
export interface Logger {
    debug(message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, error?: Error, data?: Record<string, any>): void;
}
export interface AnalyticsService {
    trackEvent(eventType: EventType, data: Record<string, any>): void;
    setUser(userId: string): void;
    setSessionId(sessionId: string): void;
}
declare class ConsoleLogger implements Logger {
    private level;
    constructor(level?: LogLevel);
    debug(message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, error?: Error, data?: Record<string, any>): void;
    private shouldLog;
}
declare class LocalAnalyticsService implements AnalyticsService {
    private sessionId;
    private userId;
    private events;
    private logger;
    private maxEvents;
    constructor(logger: Logger, maxEvents?: number);
    trackEvent(eventType: EventType, data: Record<string, any>): void;
    setUser(userId: string): void;
    setSessionId(sessionId: string): void;
    private generateSessionId;
    private persistEvents;
    getEvents(): AnalyticsEvent[];
    clearEvents(): void;
}
/**
 * MCP service performance metrics
 */
export declare class MCPPerformanceMetrics {
    private requestCounts;
    private requestTimes;
    private errorCounts;
    trackRequest(endpoint: string, timeMs: number, success: boolean, errorType?: string): void;
    getAverageResponseTime(endpoint: string): number;
    getSuccessRate(endpoint: string): number;
    getSummary(): Record<string, any>;
    reset(): void;
}
export declare const logger: ConsoleLogger;
export declare const analytics: LocalAnalyticsService;
export declare const mcpMetrics: MCPPerformanceMetrics;
declare const _default: {
    logger: ConsoleLogger;
    analytics: LocalAnalyticsService;
    mcpMetrics: MCPPerformanceMetrics;
    LogLevel: typeof LogLevel;
    EventType: typeof EventType;
};
export default _default;
