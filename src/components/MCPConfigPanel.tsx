/**
 * MCP Configuration Panel Component
 * 
 * This component provides:
 * - MCP endpoint configuration
 * - Authentication settings
 * - Testing options
 */

import React, { useState, useEffect } from 'react';

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

const MCPConfigPanel: React.FC<MCPConfigPanelProps> = ({ config, onChange, onSave, onReset }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [localConfig, setLocalConfig] = useState<MCPConfigOptions>(config);
  
  // Update local state when config prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);
  
  // Handle local changes before propagating up
  const handleChange = (field: keyof MCPConfigOptions, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    setLocalConfig(updatedConfig);
    onChange(updatedConfig);
  };
  
  // Save configuration to localStorage
  const handleSaveConfig = () => {
    localStorage.setItem('mcp-config', JSON.stringify(localConfig));
    onSave();
  };
  
  return (
    <div style={{ 
      border: '1px solid #d0d7de',
      borderRadius: '8px',
      marginBottom: '20px',
      overflow: 'hidden'
    }}>
      <div 
        style={{ 
          backgroundColor: '#f0f4f8', 
          padding: '10px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: '0' }}>MCP Configuration</h3>
        <button 
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ padding: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>MCP Endpoint:</label>
            <input
              type="text"
              value={localConfig.endpoint}
              onChange={(e) => handleChange('endpoint', e.target.value)}
              style={{ 
                padding: '8px', 
                width: '100%', 
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
            />
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
              Full URL of the MCP server
            </p>
          </div>
          
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="use-auth"
              checked={localConfig.useAuth}
              onChange={(e) => handleChange('useAuth', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="use-auth" style={{ fontWeight: 'bold' }}>Use Authentication</label>
          </div>
          
          {localConfig.useAuth && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>API Key:</label>
              <input
                type="text"
                value={localConfig.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                style={{ 
                  padding: '8px', 
                  width: '100%', 
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              />
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                API key for authentication (stored locally only)
              </p>
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Organization ID:</label>
            <input
              type="text"
              value={localConfig.orgId}
              onChange={(e) => handleChange('orgId', e.target.value)}
              style={{ 
                padding: '8px', 
                width: '100%', 
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="debug-mode"
              checked={localConfig.debug}
              onChange={(e) => handleChange('debug', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="debug-mode" style={{ fontWeight: 'bold' }}>Debug Mode</label>
            <p style={{ margin: '0 0 0 10px', fontSize: '13px', color: '#666' }}>
              Show additional debug information
            </p>
          </div>
            <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveConfig}
              style={{
                padding: '8px 16px',
                backgroundColor: '#744da9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save Configuration
            </button>
            
            {onReset && (
              <button
                onClick={onReset}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reset to Defaults
              </button>
            )}
            
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
              Configuration is saved locally in your browser
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPConfigPanel;
