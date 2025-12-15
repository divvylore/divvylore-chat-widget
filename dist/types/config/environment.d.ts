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
export declare const envConfig: EnvironmentConfig;
/**
 * Update the configuration and persist changes to localStorage
 */
export declare function updateConfig(updates: Partial<EnvironmentConfig>): EnvironmentConfig;
/**
 * Reset configuration to environment defaults
 */
export declare function resetConfig(): void;
