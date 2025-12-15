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

import { envConfig } from '../config/environment';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Log categories for better organization
 */
export enum LogCategory {
  GENERAL = 'GENERAL',
  CONFIG = 'CONFIG',
  API = 'API',
  UI = 'UI',
  SERVICE = 'SERVICE',
  ANIMATION = 'ANIMATION'
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
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: envConfig.debug,
  level: envConfig.environment === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  categories: Object.values(LogCategory),
  showTimestamp: true,
  showCategory: true
};

/**
 * Global logger configuration
 * Can be updated by client configuration
 * Starts disabled if we expect client configuration
 */
let loggerConfig: LoggerConfig = { ...DEFAULT_CONFIG };
let waitingForClientConfig = false;

/**
 * Set the logger to wait for client configuration
 * This disables all logging until client config is applied
 */
export function setWaitingForClientConfig(waiting: boolean): void {
  waitingForClientConfig = waiting;
  if (waiting) {
    // Temporarily disable all logging until client config is loaded
    loggerConfig.enabled = false;
  }
}

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
export function updateLoggerConfig(clientConfig?: ClientLoggingConfig): void {
  if (!clientConfig) {
    // No client config provided, enable default logging
    waitingForClientConfig = false;
    loggerConfig.enabled = DEFAULT_CONFIG.enabled;
    return;
  }

  // Clear waiting state - we now have client configuration
  waitingForClientConfig = false;

  if (clientConfig.debug_mode !== undefined) {
    loggerConfig.enabled = clientConfig.debug_mode;
    
    // If debug_mode is explicitly false, disable all logging except errors
    if (clientConfig.debug_mode === false) {
      loggerConfig.level = LogLevel.ERROR;
      loggerConfig.categories = [LogCategory.GENERAL]; // Only allow general category for errors
      return; // Don't process other settings if debug_mode is false
    }
  }

  if (clientConfig.log_level) {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      none: LogLevel.NONE
    };
    loggerConfig.level = levelMap[clientConfig.log_level] || LogLevel.DEBUG;
  }

  if (clientConfig.log_categories && Array.isArray(clientConfig.log_categories)) {
    loggerConfig.categories = clientConfig.log_categories
      .map(cat => cat.toUpperCase())
      .filter(cat => Object.values(LogCategory).includes(cat as LogCategory)) as LogCategory[];
  }

  if (clientConfig.show_timestamps !== undefined) {
    loggerConfig.showTimestamp = clientConfig.show_timestamps;
  }
}

/**
 * Check if logging is allowed for a specific level and category
 */
function shouldLog(level: LogLevel, category: LogCategory): boolean {
  // If waiting for client config, disable all logging except critical errors
  if (waitingForClientConfig && level < LogLevel.ERROR) {
    return false;
  }
  
  // If debug_mode is explicitly false, disable ALL logging except errors
  if (loggerConfig.enabled === false) {
    return level >= LogLevel.ERROR;
  }
  
  return (
    loggerConfig.enabled &&
    level >= loggerConfig.level &&
    loggerConfig.categories.includes(category)
  );
}

/**
 * Format log message with timestamp and category
 */
function formatMessage(level: string, category: LogCategory, message: string): string {
  const parts: string[] = [];
  
  if (loggerConfig.showTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  parts.push(`[${level}]`);
  
  if (loggerConfig.showCategory) {
    parts.push(`[${category}]`);
  }
  
  parts.push(message);
  
  return parts.join(' ');
}

/**
 * Internal logging function
 */
function log(
  level: LogLevel,
  category: LogCategory,
  levelName: string,
  consoleMethod: (...args: any[]) => void,
  message: string,
  ...args: any[]
): void {
  if (!shouldLog(level, category)) return;
  
  const formattedMessage = formatMessage(levelName, category, message);
  
  if (args.length > 0) {
    consoleMethod(formattedMessage, ...args);
  } else {
    consoleMethod(formattedMessage);
  }
}

/**
 * Logger utility object with different log levels and categories
 */
export const logger = {
  /**
   * Debug level logging (most verbose)
   */
  debug: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.GENERAL, 'DEBUG', console.log, message, ...args),

  /**
   * Info level logging
   */
  info: (message: string, ...args: any[]) => 
    log(LogLevel.INFO, LogCategory.GENERAL, 'INFO', console.info, message, ...args),

  /**
   * Warning level logging
   */
  warn: (message: string, ...args: any[]) => 
    log(LogLevel.WARN, LogCategory.GENERAL, 'WARN', console.warn, message, ...args),

  /**
   * Error level logging (always shown unless completely disabled)
   */
  error: (message: string, ...args: any[]) => 
    log(LogLevel.ERROR, LogCategory.GENERAL, 'ERROR', console.error, message, ...args),

  /**
   * Configuration-related logging
   */
  config: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.CONFIG, 'CONFIG', console.log, message, ...args),

  /**
   * API-related logging
   */
  api: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.API, 'API', console.log, message, ...args),

  /**
   * UI-related logging
   */
  ui: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.UI, 'UI', console.log, message, ...args),

  /**
   * Service-related logging
   */
  service: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.SERVICE, 'SERVICE', console.log, message, ...args),

  /**
   * Animation-related logging
   */
  animation: (message: string, ...args: any[]) => 
    log(LogLevel.DEBUG, LogCategory.ANIMATION, 'ANIMATION', console.log, message, ...args),

  /**
   * Get current logger configuration
   */
  getConfig: (): LoggerConfig => ({ ...loggerConfig }),

  /**
   * Reset logger to default configuration
   */
  reset: (): void => {
    loggerConfig = { ...DEFAULT_CONFIG };
  },

  /**
   * Enable/disable logging completely
   */
  setEnabled: (enabled: boolean): void => {
    loggerConfig.enabled = enabled;
  },

  /**
   * Set minimum log level
   */
  setLevel: (level: LogLevel): void => {
    loggerConfig.level = level;
  },

  /**
   * Set allowed categories
   */
  setCategories: (categories: LogCategory[]): void => {
    loggerConfig.categories = [...categories];
  }
};

/**
 * Backward compatibility: Direct console replacements
 * These will respect the logger configuration
 */
export const console_debug = logger.debug;
export const console_log = logger.info;
export const console_info = logger.info;
export const console_warn = logger.warn;
export const console_error = logger.error;

export default logger;
