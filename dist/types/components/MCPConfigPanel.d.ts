/**
 * MCP Configuration Panel Component
 *
 * This component provides:
 * - MCP endpoint configuration
 * - Authentication settings
 * - Testing options
 */
import React from 'react';
export interface MCPConfigOptions {
    endpoint: string;
    apiKey: string;
    useAuth: boolean;
    orgId: string;
    debug: boolean;
}
interface MCPConfigPanelProps {
    config: MCPConfigOptions;
    onChange: (config: MCPConfigOptions) => void;
    onSave: () => void;
    onReset?: () => void;
}
declare const MCPConfigPanel: React.FC<MCPConfigPanelProps>;
export default MCPConfigPanel;
