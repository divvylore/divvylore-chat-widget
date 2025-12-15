/**
 * Tutorial panel for the MCP Connection Test page
 * Provides step-by-step guidance for testing MCP connectivity
 */

import React, { useState } from 'react';

interface TutorialPanelProps {
  onDismiss?: () => void;
}

const TutorialPanel: React.FC<TutorialPanelProps> = ({ onDismiss }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss?.();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="tutorial-step">
            <h3>Step 1: Configure MCP Connection</h3>
            <p>
              First, ensure you have the correct MCP endpoint configured in the
              <strong> Configuration Panel</strong>. Click on the panel to expand it.
            </p>
            <ul>
              <li>Enter your MCP endpoint URL</li>
              <li>Set your organization ID</li>
              <li>If your MCP server requires authentication, check "Use Authentication" and enter your API key</li>
            </ul>
            <div className="tutorial-image" style={{ textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '10px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                Configuration Panel Example
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="tutorial-step">
            <h3>Step 2: Test Basic Connectivity</h3>
            <p>
              Use the <strong>Run Connection Test</strong> button to check basic connectivity 
              to the MCP server. This will:
            </p>
            <ul>
              <li>Attempt to connect to your MCP endpoint</li>
              <li>Initialize the MCP service with your organization ID</li>
              <li>Send a test message</li>
              <li>Display the response from the MCP server</li>
            </ul>
            <p>
              If you encounter issues, use the <strong>Run Detailed Diagnostics</strong> button for more 
              information about what's going wrong.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="tutorial-step">
            <h3>Step 3: Validate with Chat</h3>
            <p>
              Once basic connectivity is established, use the chat panels to test interactive
              conversations with the MCP service:
            </p>
            <ul>
              <li><strong>Standard Chat</strong>: Tests regular request/response communication</li>
              <li><strong>Streaming Chat</strong>: Tests real-time streaming responses if your MCP server supports it</li>
            </ul>
            <p>
              Try asking questions that would validate the knowledge and capabilities of your 
              MCP implementation. For example:
            </p>
            <blockquote style={{ 
              backgroundColor: '#f3f3f3',
              padding: '10px',
              borderLeft: '3px solid #744da9' 
            }}>
              "What can you tell me about Divvylore?"
            </blockquote>
          </div>
        );
      case 4:
        return (
          <div className="tutorial-step">
            <h3>Step 4: Next Steps</h3>
            <p>
              After successful testing, you can:
            </p>
            <ul>
              <li>Save your configuration for future use</li>
              <li>Use the chat service in your application components</li>
              <li>Check the <code>docs/MCPIntegrationGuide.md</code> for more integration options</li>
            </ul>
            <p>
              If you encounter any issues, the detailed diagnostics will help you identify and resolve them.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      className="tutorial-panel"
      style={{
        backgroundColor: 'white',
        border: '1px solid #d0d7de',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div 
        className="tutorial-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}
      >
        <h2 style={{ margin: 0 }}>MCP Testing Tutorial</h2>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="tutorial-content" style={{ marginBottom: '20px' }}>
        {renderStep()}
      </div>
      
      <div className="tutorial-progress" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: i + 1 === currentStep ? '#744da9' : '#e1e4e8',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
      
      <div 
        className="tutorial-navigation" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '15px'
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          style={{
            padding: '8px 16px',
            backgroundColor: currentStep === 1 ? '#e1e4e8' : '#f0f4f8',
            color: currentStep === 1 ? '#999' : '#333',
            border: '1px solid #d0d7de',
            borderRadius: '4px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        
        <div style={{ color: '#666' }}>
          Step {currentStep} of {totalSteps}
        </div>
        
        <button
          onClick={handleNext}
          style={{
            padding: '8px 16px',
            backgroundColor: '#744da9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {currentStep === totalSteps ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default TutorialPanel;
