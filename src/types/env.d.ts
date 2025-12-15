/**
 * Global environment variable declarations
 */

declare global {
  interface Window {
    ENV_MCP_ENDPOINT?: string;
    ENV_MCP_API_KEY?: string;
    ENV_AUTH_ENDPOINT?: string;
  }
}

export {};
