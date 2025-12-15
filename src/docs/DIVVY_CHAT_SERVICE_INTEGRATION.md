# DivvyChat Service Integration Guide

This guide explains how to integrate the DivvyChat widget with DivvyChatService backend.

## Overview

The DivvyChat widget now supports seamless integration with DivvyChatService, providing:
- Automatic client initialization
- Session management with 2-day expiration
- Multi-tool response handling
- Human-style conversation flow
- Proper cleanup on chat end

## Integration Steps

### Step 1: Basic Setup

To integrate with DivvyChatService, simply provide the `organizationId` prop:

```tsx
import DivvyloreChatWidget from '@your-org/divvy-chat';

function YourApp() {
  return (
    <DivvyloreChatWidget
      organizationId="your-org-id-123"
      headerTitle="Your Support Chat"
      welcomeMessage="Hello! How can I help you today?"
      botName="Your Assistant"
      onEndChat={() => {
        console.log('Chat session ended');
      }}
      onNewChat={() => {
        console.log('New chat session started');
      }}
    />
  );
}
```

### Step 2: Configuration Options

#### Required Props for DivvyChatService Integration

- `organizationId`: The organization ID (Client ID) allocated by DivvyChatService for your partner website

#### Optional Props

- `onEndChat`: Callback when chat session ends
- `onNewChat`: Callback when new chat session starts

#### Configuration

The DivvyChatService URL is configured in the environment configuration (`src/config/environment.ts`):

- **Development**: `http://localhost:5001`
- **Test**: `https://divvy-chat-service-test.azurewebsites.net`  
- **Production**: `https://divvy-chat-service-prod.azurewebsites.net`

You can override the URL using environment variables:
- `VITE_DIVVY_CHAT_SERVICE_URL`
- or by setting `localStorage.setItem('divvy-chat-service-url', 'your-url')`

### Step 3: How It Works

#### Initialization Flow

1. **Client Initialization**: When the widget loads with `organizationId`, it calls the DivvyChatService to get client information
2. **Session Creation**: A new session ID is generated and stored in browser session storage
3. **Session Expiration**: Sessions automatically expire after 2 days

#### Message Flow

1. **User Input**: User types a message in the chat widget
2. **API Call**: Widget calls `/agent/chat` endpoint with `clientId` and `sessionId`
3. **Response Processing**: If multiple tool results are returned, they are displayed in sequence
4. **Human-style Conversation**: Responses are formatted for natural conversation flow

#### Cleanup Flow

1. **End Chat**: When user ends the conversation
2. **Session Cleanup**: API call to cleanup message session on server
3. **Local Cleanup**: Session ID is cleared from browser storage

## API Integration Details

### Endpoints Used

- `GET /client/{clientId}` - Get client information during initialization
- `POST /agent/chat` - Send messages and receive responses
- `DELETE /session/{sessionId}` - Cleanup session when chat ends

### Request Format

All requests to DivvyChatService include:
- `clientId`: Organization ID
- `sessionId`: Current session identifier
- Standard headers for authentication and content type

### Response Handling

The widget handles various response types:
- Single tool responses
- Multiple tool responses (displayed in sequence)
- Error responses (with user-friendly error messages)

## Fallback Behavior

If `organizationId` is not provided, the widget falls back to traditional mode using the `sendMessage` prop:

```tsx
<DivvyloreChatWidget
  sendMessage={async (message: string) => {
    // Your custom message handling logic
    const response = await yourAPI.sendMessage(message);
    return response;
  }}
  // ... other props
/>
```

## Error Handling

The integration includes comprehensive error handling:

- **Connection Errors**: Displayed as user-friendly messages
- **API Errors**: Graceful degradation with retry suggestions
- **Session Errors**: Automatic session recovery when possible

## Session Management

### Session Storage

- Sessions are stored in browser's `sessionStorage`
- Keys are prefixed with `divvy-chat-session-`
- Automatic cleanup on browser close

### Session Expiration

- Server-side: Sessions expire after 2 days of inactivity
- Client-side: Automatic detection and recovery of expired sessions

## Best Practices

### 1. Organization ID Management

```tsx
// Store organization ID in environment variables
const ORGANIZATION_ID = process.env.REACT_APP_DIVVY_CHAT_ORG_ID;

<DivvyloreChatWidget
  organizationId={ORGANIZATION_ID}
  // ... other props
/>
```

### 2. Error Handling

```tsx
<DivvyloreChatWidget
  organizationId="your-org-id"
  onEndChat={() => {
    // Custom cleanup logic
    analytics.track('chat_ended');
  }}
  onNewChat={() => {
    // Custom initialization logic
    analytics.track('chat_started');
  }}
/>
```

### 3. Custom Styling

The widget maintains all existing styling capabilities:

```tsx
<DivvyloreChatWidget
  organizationId="your-org-id"
  theme={{
    primaryColor: '#007bff',
    background: '#ffffff',
    textPrimary: '#333333'
  }}
  // ... other props
/>
```

## Migration from Traditional Mode

### Before (Traditional Mode)

```tsx
<DivvyloreChatWidget
  sendMessage={async (message) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.text();
  }}
/>
```

### After (DivvyChatService Integration)

```tsx
<DivvyloreChatWidget
  organizationId="your-org-id-123"
/>
```

## Troubleshooting

### Common Issues

1. **Widget not initializing**: Check that `organizationId` is valid and service is running
2. **Session not persisting**: Ensure browser allows sessionStorage
3. **API errors**: Verify service URL and network connectivity

### Debug Mode

Enable debug logging by checking browser console for:
- Initialization status
- Session ID management
- API request/response details

## Security Considerations

- Organization IDs should be treated as public identifiers
- All sensitive operations are handled server-side
- Session IDs are automatically generated and managed
- No sensitive data is stored in browser storage

## Support

For issues related to:
- **Widget Integration**: Check this documentation and examples
- **DivvyChatService API**: Refer to the service documentation
- **Authentication**: Contact your DivvyChatService administrator
