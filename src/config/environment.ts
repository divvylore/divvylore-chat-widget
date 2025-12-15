/**
 * Environment configuration
 * 
 * This module handles environment variables and configuration settings
 * across different environments (development, production, etc.)
 */

/**
 * Configuration interface for environment variables
 */
export interface EnvironmentConfig {
  /** DivvyChatService endpoint URL */
  divvyChatServiceUrl: string;
  
  /** Current environment name */
  environment: 'development' | 'test' | 'production';
  
  /** Debug mode flag */
  debug: boolean;
}

/**
 * Get the current environment name
 */
function getImportMetaEnv(): Record<string, string> {
  try {
    if (typeof import.meta === 'undefined') {
      return {};
    }
    const meta = import.meta as unknown as { env?: Record<string, string> };
    return meta.env ?? {};
  } catch {
    return {};
  }
}

function getEnvironmentName(): 'development' | 'test' | 'production' {
  const metaEnv = getImportMetaEnv();
  if (metaEnv.MODE) {
    const mode = metaEnv.MODE.toLowerCase();
    if (mode.includes('prod')) return 'production';
    if (mode.includes('test')) return 'test';
  }
  
  // Default to development
  return 'development';
}

/**
 * Load configuration values from all available sources
 * Priority: Environment variables > localStorage > Default values
 */
function loadConfig(): EnvironmentConfig {
  const environment = getEnvironmentName();
  
  // DivvyChatService endpoint
  const metaEnv = getImportMetaEnv();
  const divvyChatServiceUrl = 
    (typeof window !== 'undefined' && (window as any).ENV_DIVVY_CHAT_SERVICE_URL) || 
    (typeof localStorage !== 'undefined' && localStorage.getItem('divvy-chat-service-url')) ||
    metaEnv.VITE_DIVVY_CHAT_SERVICE_URL ||
    // Default endpoints for different environments
    (environment === 'production' 
      ? 'https://divvy-chat-service-prod.azurewebsites.net'
      : environment === 'test'
        ? 'http://localhost:5001'
        : 'http://localhost:5001');
    
  // Debug mode
  const debug = 
    (typeof localStorage !== 'undefined' && localStorage.getItem('divvy-debug') === 'true') ||
    metaEnv.VITE_DEBUG === 'true' ||
    environment !== 'production';
  
  return {
    divvyChatServiceUrl,
    environment,
    debug
  };
}

// Export the configured environment
export const envConfig = loadConfig();

/**
 * Update the configuration and persist changes to localStorage
 */
export function updateConfig(updates: Partial<EnvironmentConfig>): EnvironmentConfig {
  if (updates.divvyChatServiceUrl) {
    localStorage.setItem('divvy-chat-service-url', updates.divvyChatServiceUrl);
  }
  
  if (updates.debug !== undefined) {
    localStorage.setItem('divvy-debug', updates.debug.toString());
  }
  
  // Reload the config to reflect changes
  Object.assign(envConfig, { ...loadConfig(), ...updates });
  
  return envConfig;
}

/**
 * Reset configuration to environment defaults
 */
export function resetConfig(): void {
  localStorage.removeItem('divvy-chat-service-url');
  localStorage.removeItem('divvy-debug');
  
  // Reload the config
  const freshConfig = loadConfig();
  Object.assign(envConfig, freshConfig);
}
