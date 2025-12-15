# DivvyChat Services Architecture

This document describes the service architecture for the DivvyChat application, explaining how the various services work together to provide chat functionality.

## Overview

The DivvyChat services architecture follows a modular design pattern for scalability and maintainability. Each service is responsible for a specific aspect of the chat functionality, and they work together to provide a complete solution. The architecture is designed to be easily integrated with React components through custom hooks.

## Service Components

### 1. ChatService

- **Purpose**: Central orchestration service that integrates all other services
- **Key Features**:
  - Chat session management
  - Message sending and receiving
  - Organization validation
  - Integration with MCP server
  - Chat history operations

### 2. ChatHistoryService

- **Purpose**: Manages chat history storage and retrieval
- **Key Features**:
  - Retrieving all chat history
  - Storing new chat sessions
  - Updating existing chat sessions
  - Deleting chat sessions
  - Managing chat open/close status

### 3. OrganizationService

- **Purpose**: Handles organization validation and configuration
- **Key Features**:
  - Validating organization IDs
  - Retrieving organization configuration
  - Caching organization data to reduce API calls
  - Providing popular questions for organizations

### 4. MCPService

- **Purpose**: Communicates with the Model Context Protocol server
- **Key Features**:
  - Initializing communication with MCP server
  - Sending messages to MCP server
  - Processing responses from MCP server
  - Retrieving popular questions from MCP
  - Supporting streaming responses
  - Handling CORS issues with proxy support
  - Configurable endpoint via environment settings

### 5. ServiceFactory

- **Purpose**: Manages service instantiation and configuration
- **Key Features**:
  - Creating service instances
  - Configuring services
  - Providing shared access to services
  - Supporting dependency injection

## Type Definitions

The services use the following core types:

- **ChatMessage**: Represents a single message in a chat
- **ChatHistoryItem**: Represents a chat session in history
- **OrgConfig**: Organization configuration information
- **MCPConfig**: Configuration for the MCP server

## Usage Examples

### 1. Basic Direct Service Usage

```typescript
import { ChatService } from './services';

// Create a chat service instance with organization ID
const chatService = new ChatService('your-org-id');

// Initialize the chat
await chatService.initialize();

// Get the welcome message
const welcomeMessage = chatService.getWelcomeMessage();

// Get popular questions
const popularQuestions = await chatService.getPopularQuestions();

// Send a message and get the response
const response = await chatService.sendMessage('Hello, how can you help me?');

// Display response
console.log(response.text);

// End current chat and save to history
await chatService.endChat();

// Get all chat history
const history = await chatService.getChatHistory();

// Load a chat from history
await chatService.loadChat(history[0].id);

// Delete a chat
await chatService.deleteChat(history[0].id);
```

### 2. Using the ServiceFactory

```typescript
import { serviceFactory } from './services';

// Get service instances from the factory
const historyService = serviceFactory.getChatHistoryService();
const orgService = serviceFactory.getOrganizationService();
const mcpService = serviceFactory.getMCPService('your-org-id');

// Use services as needed
const history = await historyService.getChatHistory();
const orgConfig = await orgService.getOrgConfig('your-org-id');
const response = await mcpService.sendMessage('Hello', 'your-org-id');
```

### 3. React Integration with useChatService Hook

```typescript
import React from 'react';
import { useChatService } from './services';

function ChatComponent() {
  // The hook handles all service interactions and state management
  const {
    messages,
    loading,
    welcomeMessage,
    popularQuestions,
    chatHistory,
    historyOpen,
    sendMessage,
    startNewChat,
    endChat,
    loadChat,
    deleteChat,
    toggleHistory,
  } = useChatService('your-org-id');
  
  // Use the hook's state and methods in your component
  return (
    <div>
      <h1>{welcomeMessage}</h1>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <button onClick={() => sendMessage('Hello')}>Send Hello</button>
      <button onClick={startNewChat}>New Chat</button>
      <button onClick={toggleHistory}>
        {historyOpen ? 'Hide History' : 'Show History'}
      </button>
    </div>
  );
}
```

### 4. Integration with DivvyloreChatWidget

The `ChatContainer` example component demonstrates how to integrate the service layer with DivvyloreChatWidget:

```typescript
import { DivvyloreChatWidget } from '../components/DivvyloreChatWidget';
import { useChatService } from '../services';

const ChatContainer = ({ orgId, orgUrl, widgetId }) => {
  const {
    messages,
    welcomeMessage,
    popularQuestions,
    chatHistory,
    // ...other service data and methods
  } = useChatService(orgId);
  
  return (
    <DivvyloreChatWidget
      orgId={orgId}
      orgUrl={orgUrl}
      widgetId={widgetId}
      welcomeMessage={welcomeMessage}
      initialMessages={messages}
      sendMessage={handleSendMessage}
      // ...other props
    />
  );
};
```

## Data Flow

1. User sends a message via the UI component
2. The React component calls the `sendMessage` function from `useChatService`
3. `useChatService` calls `ChatService.sendMessage()`
4. `ChatService` processes the message and calls `MCPService.sendMessage()`
5. `MCPService` sends the message to the MCP server and gets a response
6. `ChatService` adds the response to the current chat and updates storage via `ChatHistoryService`
7. `useChatService` updates its state with the new messages
8. The React component re-renders with the updated messages

## MCP Server Integration

The services communicate with an MCP (Model Context Protocol) server which handles:

1. Processing user messages with AI models
2. Storing and retrieving organization-specific configurations
3. Providing popular questions based on organization data
4. Maintaining context for conversational AI responses

### MCP Configuration Options

The MCP service can be configured in multiple ways with the following priority order:

1. **Runtime Configuration**
   - Configured via the MCPConfigPanel UI component
   - Settings stored in localStorage for persistence

2. **Environment Variables**
   - `VITE_MCP_ENDPOINT`: The URL of the MCP server
   - `VITE_MCP_API_KEY`: Optional API key for authentication
   - `VITE_MCP_DEFAULT_ORG`: Default organization ID
   - `VITE_MCP_ENABLE_STREAMING`: Enable streaming responses (`true`/`false`)
   - `VITE_DEBUG`: Enable debug mode for additional logging

3. **Default Configuration**
   - Azure MCP endpoint: `https://brahma-ai-consumer-service-mcp-dev-westus3.azurewebsites.net/`
   - Default organization: `test-organization`

## Configuration and Environment

The services can be configured with environment variables:

- `MCP_ENDPOINT`: The URL of the MCP server API
- `MCP_API_KEY`: Optional API key for authentication

## Future Enhancements

- **Real-time Updates**: Add WebSocket support for multi-device synchronization
- **Authentication**: Implement user authentication for personalized chat history
- **Attachments**: Add support for file attachments and rich media in conversations
- **Analytics**: Implement usage analytics and reporting features
- **Offline Support**: Add offline capabilities with IndexedDB storage
- ✅ **Stream Responses**: Added support for streaming responses from the MCP server
- **Enhanced Error Handling**: Improved error handling with retries and CORS proxy support
