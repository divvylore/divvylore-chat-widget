/**
 * Centralized Logging Utility for DivvyChat
 *
 * This utility provides controlled logging that respects:
 * 1. Environment configuration (debug mode)
 * 2. Client configuration (logging preferences)
 * 3. Log levels for better organization
 *
 * Usage:
 * - logger.debug('Debug message')
 * - logger.info('Info message')
 * - logger.warn('Warning message')
 * - logger.error('Error message')
 * - logger.config('Config-related message')
 * - logger.api('API-related message')
 * - logger.ui('UI-related message')
 */
/**
 * Log levels in order of severity
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}
/**
 * Log categories for better organization
 */
export declare enum LogCategory {
    GENERAL = "GENERAL",
    CONFIG = "CONFIG",
    API = "API",
    UI = "UI",
    SERVICE = "SERVICE",
    ANIMATION = "ANIMATION"
}
/**
 * Logger configuration interface
 */
interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    categories: LogCategory[];
    showTimestamp: boolean;
    showCategory: boolean;
}
/**
 * Set the logger to wait for client configuration
 * This disables all logging until client config is applied
 */
export declare function setWaitingForClientConfig(waiting: boolean): void;
/**
 * Client-specific logging configuration
 */
interface ClientLoggingConfig {
    debug_mode?: boolean;
    log_level?: 'debug' | 'info' | 'warn' | 'error' | 'none';
    log_categories?: string[];
    show_timestamps?: boolean;
}
/**
 * Update logger configuration from client config
 */
export declare function updateLoggerConfig(clientConfig?: ClientLoggingConfig): void;
/**
 * Logger utility object with different log levels and categories
 */
export declare const logger: {
    /**
     * Debug level logging (most verbose)
     */
    debug: (message: string, ...args: any[]) => void;
    /**
     * Info level logging
     */
    info: (message: string, ...args: any[]) => void;
    /**
     * Warning level logging
     */
    warn: (message: string, ...args: any[]) => void;
    /**
     * Error level logging (always shown unless completely disabled)
     */
    error: (message: string, ...args: any[]) => void;
    /**
     * Configuration-related logging
     */
    config: (message: string, ...args: any[]) => void;
    /**
     * API-related logging
     */
    api: (message: string, ...args: any[]) => void;
    /**
     * UI-related logging
     */
    ui: (message: string, ...args: any[]) => void;
    /**
     * Service-related logging
     */
    service: (message: string, ...args: any[]) => void;
    /**
     * Animation-related logging
     */
    animation: (message: string, ...args: any[]) => void;
    /**
     * Get current logger configuration
     */
    getConfig: () => LoggerConfig;
    /**
     * Reset logger to default configuration
     */
    reset: () => void;
    /**
     * Enable/disable logging completely
     */
    setEnabled: (enabled: boolean) => void;
    /**
     * Set minimum log level
     */
    setLevel: (level: LogLevel) => void;
    /**
     * Set allowed categories
     */
    setCategories: (categories: LogCategory[]) => void;
};
/**
 * Backward compatibility: Direct console replacements
 * These will respect the logger configuration
 */
export declare const console_debug: (message: string, ...args: any[]) => void;
export declare const console_log: (message: string, ...args: any[]) => void;
export declare const console_info: (message: string, ...args: any[]) => void;
export declare const console_warn: (message: string, ...args: any[]) => void;
export declare const console_error: (message: string, ...args: any[]) => void;
export default logger;
