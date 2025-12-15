import React, { useState } from 'react';
import DivvyloreChatWidget from '../components/DivvyloreChatWidget/DivvyloreChatWidget';
import { logger } from '../utils/logger';

// Document upload interfaces for type safety
interface UploadResponse {
  success: boolean;
  job_id?: string;
  message?: string;
  error?: string;
  details?: {
    client_id: string;
    agent_id: string;
    uploaded_files: number;
    file_details: Array<{
      file_id: string;
      original_filename: string;
      file_size: number;
      storage_path: string;
    }>;
    status: string;
    ready_to_start: boolean;
  };
}

interface StartJobResponse {
  success: boolean;
  job_id?: string;
  scheduler_job_id?: string;
  message?: string;
  error?: string;
  details?: {
    client_id: string;
    agent_id: string;
    total_files: number;
    priority: string;
    max_retries: number;
    status: string;
    started_at: string;
  };
}

/**
 * Demo component showing how to integrate DivvyloreChatWidget with DivvyChatService
 */
const DivvyChatServiceDemo: React.FC = () => {
  // Test credentials - in production, partners would provide their own values
  const [currentClient, setCurrentClient] = useState('62df2816af8efaa1cae30882');
  const [currentAgent, setCurrentAgent] = useState('68aaa5f5c701066ab80f7e1c');
  const [currentAgentKey, setCurrentAgentKey] = useState('ak_J5a0SnYN3tdEzHGby-5tZ5j1eIYLxTCKTcihSvJ89YY');
  const [enableMultiSession, setEnableMultiSession] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat');
  
  // Document upload state
  const [clientId, setClientId] = useState<string>('62df2816af8efaa1cae30882');
  const [agentId, setAgentId] = useState<string>('68aaa5f5c701066ab80f7e1c');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [startResult, setStartJobResponse] = useState<StartJobResponse | null>(null);
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [maxRetries, setMaxRetries] = useState<number>(3);
  
  const clientConfigs = [
    { id: '62df2816af8efaa1cae30882', name: 'Enterprise Client (Chat with Support + Building Icon)' },
    { id: 'healthcare_client', name: 'Healthcare Client (Get Medical Help + Hospital Icon)' },
    { id: 'tech_startup', name: 'Tech Startup (Need Help? + Computer Icon)' },
    { id: '68aaa5f5c701066ab80f7e1c', name: 'Default Client (No Text + Default Icon)' }
  ];

  const agentConfigs = [
    { id: '68aaa5f5c701066ab80f7e1c', name: 'Default Agent' },
    { id: 'support', name: 'Support Agent' },
    { id: 'sales', name: 'Sales Agent' },
    { id: 'technical', name: 'Technical Agent' }
  ];

  // Document upload functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    // Clear previous results when new files are selected
    setUploadResult(null);
    setStartJobResponse(null);
  };

  const uploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!clientId.trim() || !agentId.trim()) {
      alert('Please provide both Client ID and Agent ID');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      
      // Add all selected files
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'X-Client-ID': clientId.trim(),
        'X-Agent-ID': agentId.trim(),
      };

      // Add JWT token if provided
      if (jwtToken.trim()) {
        headers['Authorization'] = `Bearer ${jwtToken.trim()}`;
      }

      const response = await fetch('http://localhost:5001/api/v1/jobs/upload', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const result: UploadResponse = await response.json();
      setUploadResult(result);

      if (!result.success) {
        logger.error('Upload failed:', result.error);
      } else {
        logger.info('Files uploaded successfully:', result.job_id);
      }
    } catch (error) {
      logger.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startJobProcessing = async () => {
    if (!uploadResult?.success || !uploadResult.job_id) {
      alert('Please upload files first');
      return;
    }

    setIsStarting(true);
    setStartJobResponse(null);

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'X-Client-ID': clientId.trim(),
        'X-Agent-ID': agentId.trim(),
        'Content-Type': 'application/json'
      };

      // Add JWT token if provided
      if (jwtToken.trim()) {
        headers['Authorization'] = `Bearer ${jwtToken.trim()}`;
      }

      const requestBody = JSON.stringify({
        job_id: uploadResult.job_id
      });

      const response = await fetch('http://localhost:5001/api/v1/jobs/start', {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });

      const result: StartJobResponse = await response.json();
      setStartJobResponse(result);

      if (!result.success) {
        logger.error('Job start failed:', result.error);
      } else {
        logger.info('Job started successfully:', result.job_id);
      }
    } catch (error) {
      logger.error('Job start error:', error);
      setStartJobResponse({
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsStarting(false);
    }
  };

  const resetUploadDemo = () => {
    setSelectedFiles(null);
    setUploadResult(null);
    setStartJobResponse(null);
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div style={{ padding: '20px', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ marginTop: '20px' }}>
        <h2>DivvyChat Service Demo - Chat & Document Upload</h2>
        <p>This demo showcases both the chat widget functionality and the new two-phase document upload workflow.</p>
        
        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '0', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'chat' ? '#744da9' : 'white',
              color: activeTab === 'chat' ? 'white' : '#744da9',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            Chat Widget Demo
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'upload' ? '#744da9' : 'white',
              color: activeTab === 'upload' ? 'white' : '#744da9',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            Document Upload Demo
          </button>
        </div>
        
        {/* Chat Widget Demo Tab */}
        {activeTab === 'chat' && (
          <>
            <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
              <h3>Chat Widget Configuration Demo</h3>
              <p>This demo shows the configurable start button with brand icon, text, and advanced styling options including text positioning. 
              It also demonstrates the new multi-agent support where each client can have multiple specialized agents, and the new multi-session 
              chat management with localStorage persistence and chat history.</p>
              
              <h4>Test Different Client Configurations:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {clientConfigs.map(config => (
              <button
                key={config.id}
                onClick={() => setCurrentClient(config.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: currentClient === config.id ? '2px solid #744da9' : '1px solid #ccc',
                  background: currentClient === config.id ? '#f9f5ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {config.name}
              </button>
            ))}
          </div>

          <h3>Test Different Agent Types:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {agentConfigs.map(config => (
              <button
                key={config.id}
                onClick={() => setCurrentAgent(config.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: currentAgent === config.id ? '2px solid #744da9' : '1px solid #ccc',
                  background: currentAgent === config.id ? '#f9f5ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {config.name}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
            <h4 style={{ marginTop: 0 }}>Agent API Key (Required for Authentication):</h4>
            <input
              type="password"
              value={currentAgentKey}
              onChange={(e) => setCurrentAgentKey(e.target.value)}
              placeholder="Enter your Agent API Key"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '12px', color: '#856404', margin: '8px 0 0 0' }}>
              Get your API key from CMAT Agent Settings. This key is required for domain token authentication.
            </p>
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
            <h4>Multi-Session Management:</h4>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={enableMultiSession}
                  onChange={(e) => setEnableMultiSession(e.target.checked)}
                />
                Enable Multi-Session Chat Management
              </label>
            </div>
            {enableMultiSession && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                <strong>Multi-Session Features:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  <li>Each conversation is saved as a separate session with GUID ID</li>
                  <li>Sessions persist in localStorage with 7-day expiration</li>
                  <li>Chat history button shows list of all sessions with previews</li>
                  <li>Switch between sessions seamlessly</li>
                  <li>Auto-generated session titles from first user message</li>
                  <li>Session search and bulk deletion</li>
                </ul>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
            <h4>Expected Behavior & Styling:</h4>
            <ul style={{ margin: 0, fontSize: '14px' }}>
              <li><strong>Enterprise:</strong> Shows "Chat with Support" text with building icon 🏢 (text on right)</li>
              <li><strong>Healthcare:</strong> Shows "Get Medical Help" text with hospital icon 🏥 (text on left)</li>
              <li><strong>Tech Startup:</strong> Shows "Need Help?" text with computer icon 💻 (custom styling - right position)</li>
              <li><strong>Default:</strong> Shows only circular icon (no text) with default chat avatar</li>
            </ul>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
              <strong>Agent Types:</strong>
              <ul>
                <li><strong>Default:</strong> General-purpose agent with standard knowledge base</li>
                <li><strong>Support:</strong> Specialized support agent with customer service knowledge</li>
                <li><strong>Sales:</strong> Sales-focused agent with product and pricing information</li>
                <li><strong>Technical:</strong> Technical support agent with specialized technical knowledge</li>
              </ul>
              <strong>Multi-Agent Benefits:</strong>
              <ul>
                <li>Each agent has isolated conversation history</li>
                <li>Agents can have different knowledge bases and tools</li>
                <li>Allows specialized responses for different use cases</li>
              </ul>
              <strong>New Styling Features:</strong>
              <ul>
                <li>Text position: left or right of icon</li>
                <li>Custom font size, weight, color, and family</li>
                <li>Configurable via backend start_button_config</li>
              </ul>
            </div>
          </div>
        </div>
        
        <DivvyloreChatWidget
          key={`${currentClient}-${currentAgent}-${currentAgentKey}-${enableMultiSession}`} // Force re-render when options change
          organizationId={currentClient === 'default' ? undefined : currentClient}
          agentId={currentAgent}
          agentKey={currentAgentKey}
          enableMultiSession={enableMultiSession}
          showWelcomeScreen={true}
          onEndChat={() => {
            logger.ui(`Chat ended for client=${currentClient}, agent=${currentAgent}, multiSession=${enableMultiSession} - cleanup completed`);
          }}
          onNewChat={() => {
            logger.ui(`New chat started for client=${currentClient}, agent=${currentAgent}, multiSession=${enableMultiSession}`);
          }}
        />
          </>
        )}
        
        {/* Document Upload Demo Tab */}
        {activeTab === 'upload' && (
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
            <h3>Document Upload API Demo</h3>
            <p>This demo shows the two-phase document upload workflow: Upload files → Start processing</p>

            {/* Authentication Configuration */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
              <h4>Authentication Configuration</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Client ID (Required):
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g., test-client-001"
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Agent ID (Required):
                </label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="e.g., test-agent-001"
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  JWT Token (Optional):
                </label>
                <input
                  type="text"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="Bearer token (optional)"
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
            </div>

            {/* Phase 1: File Upload */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
              <h4>Phase 1: Upload Files</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Select Documents to Upload:
                </label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.html,.htm,.csv,.json,.xml,.rtf,.odt"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '8px' }}
                />
                <small style={{ color: '#666' }}>
                  Supported formats: PDF, DOC, DOCX, TXT, MD, HTML, CSV, JSON, XML, RTF, ODT (Max 50MB per file)
                </small>
              </div>
              
              <button
                onClick={uploadFiles}
                disabled={isUploading || !selectedFiles}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUploading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>

              {selectedFiles && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Selected files:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {Array.from(selectedFiles).map((file, index) => (
                      <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Upload Results */}
            {uploadResult && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: uploadResult.success ? '#d4edda' : '#f8d7da',
                borderRadius: '5px',
                border: `1px solid ${uploadResult.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <h4>Upload Result</h4>
                {uploadResult.success ? (
                  <div>
                    <p style={{ color: '#155724', fontWeight: 'bold' }}>✅ {uploadResult.message}</p>
                    <p><strong>Job ID:</strong> {uploadResult.job_id}</p>
                    {uploadResult.details && (
                      <div>
                        <p><strong>Files uploaded:</strong> {uploadResult.details.uploaded_files}</p>
                        <p><strong>Status:</strong> {uploadResult.details.status}</p>
                        <p><strong>Ready to start:</strong> {uploadResult.details.ready_to_start ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#721c24', fontWeight: 'bold' }}>❌ {uploadResult.error}</p>
                )}
              </div>
            )}

            {/* Phase 2: Start Job Processing */}
            {uploadResult?.success && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                <h4>Phase 2: Start Job Processing</h4>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Priority:
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'high' | 'normal' | 'low')}
                      style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
                    >
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Max Retries:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                      style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', width: '100px' }}
                    />
                  </div>
                </div>

                <button
                  onClick={startJobProcessing}
                  disabled={isStarting || !uploadResult?.success || !uploadResult?.job_id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isStarting || !uploadResult?.success ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isStarting || !uploadResult?.success ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {isStarting ? 'Starting...' : 'Start Processing'}
                </button>
              </div>
            )}

            {/* Start Job Results */}
            {startResult && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: startResult.success ? '#d4edda' : '#f8d7da',
                borderRadius: '5px',
                border: `1px solid ${startResult.success ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                <h4>Job Processing Result</h4>
                {startResult.success ? (
                  <div>
                    <p style={{ color: '#155724', fontWeight: 'bold' }}>🚀 {startResult.message}</p>
                    <p><strong>Job ID:</strong> {startResult.job_id}</p>
                    <p><strong>Scheduler Job ID:</strong> {startResult.scheduler_job_id}</p>
                    {startResult.details && (
                      <div>
                        <p><strong>Total files:</strong> {startResult.details.total_files}</p>
                        <p><strong>Priority:</strong> {startResult.details.priority}</p>
                        <p><strong>Max retries:</strong> {startResult.details.max_retries}</p>
                        <p><strong>Status:</strong> {startResult.details.status}</p>
                        <p><strong>Started at:</strong> {new Date(startResult.details.started_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#721c24', fontWeight: 'bold' }}>❌ {startResult.error}</p>
                )}
              </div>
            )}

            {/* Reset Button */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={resetUploadDemo}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Reset Demo
              </button>
            </div>

            {/* API Information */}
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>API Endpoints Used</h4>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li><strong>Phase 1:</strong> <code>POST /api/v1/jobs/upload/files</code></li>
                <li><strong>Phase 2:</strong> <code>POST /api/v1/jobs/start/{'{job_id}'}</code></li>
              </ul>
              <p><strong>Required Headers:</strong></p>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li><code>X-Client-ID</code> - Client identifier (required)</li>
                <li><code>X-Agent-ID</code> - Agent identifier (required)</li>
                <li><code>Authorization</code> - Bearer JWT token (optional)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DivvyChatServiceDemo;
