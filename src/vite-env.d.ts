/// <reference types="vite/client" />

// CSS Module declarations
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css?inline' {
  const css: string;
  export default css;
}

// Extend ImportMeta interface to include Vite env variables
interface ImportMetaEnv {
  readonly VITE_MCP_ENDPOINT?: string;
  readonly VITE_MCP_API_KEY?: string;
  readonly VITE_DEBUG?: string;
}
