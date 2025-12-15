# DivvyloreChatWidget – Modern Chat Component

The DivvyloreChatWidget is the official React component for embedding Divvylore chat experiences. It delivers a polished Copilot-inspired UI, integrates directly with DivvyChatService, and now ships without any deprecated adapters or aliases to keep the npm package lean.

## Key Features

- **Professional Chat Interface**: 
  - Clean, modern design with proper text alignment
  - Professional message formatting with avatars and names
  - Welcome screen with popular questions
  - Responsive input with proper sizing

- **Modern Design**:
  - Left-aligned text throughout (no centering issues)
  - Purple user message bubbles with rounded corners
  - Clean bot message bubbles with subtle borders
  - Proper spacing and padding for readability

- **Enhanced User Experience**:
  - Welcome message and popular questions on new chat
  - Typing indicators for bot responses
  - Professional bot name formatting
  - No unnecessary scrollbars on single-line input
  - Smooth animations and transitions

- **Interactive Elements**:
  - Clickable popular questions for quick start
  - Proper focus states and hover effects
  - Professional button styling
  - Markdown rendering for rich content

## Package Structure

This package contains the minimal components needed for the chat widget:

```
src/
  components/
    components/
      DivvyloreChatWidget/   # Main widget implementation
        components/          # Header, chat input, message list, etc.
        hooks/               # Custom hooks (chat, UI state, textarea)
        styles.*             # Theme helpers and CSS
        types.ts             # Public type definitions
    ChatHistory/             # Multi-session history overlay
    SimpleMarkdownRenderer.tsx  # Markdown renderer used by the widget
  embed/
    loader.tsx              # Global loader for the drop-in script build
  examples/
    DivvyChatServiceDemo.tsx # DivvyChatService integration demo
  index.ts                  # Library exports
```

## Demo

The package includes a DivvyChatService integration demo (`DivvyChatServiceDemo`) that showcases the chat widget functionality with backend integration.
        ChatHeader.tsx     # Header with toggle button
        CopilotWelcome.tsx # Welcome screen with prompts
        InputBar.tsx       # Message input area
        MessageBubble.tsx  # Individual message display
        MessageList.tsx    # Message container
        TypingIndicator.tsx # Bot typing animation
    DivvyloreChatWidgetAdapter.tsx # Legacy compatibility adapter
  examples/
    DivvyChatServiceDemo.tsx # DivvyChatService integration demo
```

## Usage

### Using DivvyloreChatWidget

```jsx
import { DivvyloreChatWidget } from 'divvylore-chat';

function App() {
  const handleSendMessage = async (message) => {
    // Process message and return response
    const response = await yourBackendAPI(message);
    return response.text;
  };

  return (
    <DivvyloreChatWidget
      organizationId="your-org-id"
      agentId="support"  // Optional: defaults to "default"
      headerTitle="Support Chat"
      welcomeMessage="Hello! How can I help you today?"
      defaultHeight="580px"
      defaultWidth="380px"
      sendMessage={handleSendMessage}
      showWelcomeScreen={true}
      onEndChat={() => console.log('Chat ended')}
      onNewChat={() => console.log('New chat started')}
    />
  );
}
```

### Multiple Agents Example

```jsx
// Support Agent Widget
<DivvyloreChatWidget
  organizationId="your-org-id"
  agentId="support"
  headerTitle="Support Chat"
  botName="Support Assistant"
/>

// Sales Agent Widget  
<DivvyloreChatWidget
  organizationId="your-org-id"
  agentId="sales"
  headerTitle="Sales Chat"
  botName="Sales Assistant"
/>
```

### Drop-In Script Loader (No Build Step)

If a partner cannot install npm packages, serve the generated loader at `dist/embed/divvylore-chat-loader.js` from any static host/CDN and embed it with two short snippets:

```html
<div id="divvylore-widget"></div>
<script>
  (function (w, d, s, src) {
    if (w.DivvyloreChatLoader) return;
    var el = d.createElement(s);
    el.async = true;
    el.src = src;
    el.onerror = function () {
      console.error('Divvylore widget failed to load');
      d.querySelector('#divvylore-widget').textContent = 'Chat is temporarily unavailable.';
    };
    d.head.appendChild(el);
  })(window, document, 'script', 'https://cdn.example.com/divvylore/divvylore-chat-loader.js');
</script>
<script>
  window.addEventListener('divvylore:ready', function () {
    window.loadDivvyloreChatWidget({
      target: '#divvylore-widget',
      organizationId: 'partner-org',
      agentId: 'support',
      agentKey: 'partner-agent-key',
      enableMultiSession: true
    });
  });
</script>
```

The loader exposes `window.loadDivvyloreChatWidget(config)` and dispatches lifecycle events (`divvylore:ready`, `divvylore:widget-mounted`, `divvylore:widget-destroyed`, `divvylore:widget-error`) so partners can monitor availability without breaking the rest of their site.

See [docs/DROP_IN_EMBED_GUIDE.md](docs/DROP_IN_EMBED_GUIDE.md) for a full hosting and monitoring guide.
```

### Multiple Agents Example

```jsx
// Support Agent Widget
<DivvyloreChatWidget
  organizationId="your-org-id"
  agentId="support"
  headerTitle="Support Chat"
  botName="Support Assistant"
/>

// Sales Agent Widget  
<DivvyloreChatWidget
  organizationId="your-org-id"
  agentId="sales"
  headerTitle="Sales Chat"
  botName="Sales Assistant"
/>
```

## Development

This project uses Vite for development, Rollup for the npm bundle, and a dedicated Vite config for the standalone loader.

```bash
# Install dependencies
npm install

# Start development server for the demo app
npm run dev

# Build npm + drop-in bundles (outputs to dist/)
npm run build

# Optional: rebuild only a specific artifact
npm run build:lib      # CJS/ESM outputs for npm consumers
npm run build:embed    # dist/embed/divvylore-chat-loader.js for static hosting
npm run build:demo     # Generates demo-dist/ for internal QA
```

## Demo

Run the demo locally to see the widget in action:

```bash
npm run dev
```

Visit http://localhost:5174 (or whatever port Vite assigns) to see the demo page.

## Service Architecture

The DivvyChat application is built with a comprehensive service architecture that handles:

- **Chat History Management**: Store and retrieve chat sessions
- **Organization Configuration**: Validate organization IDs and retrieve configurations
- **MCP Server Communication**: Interact with Model Context Protocol servers for AI responses
- **Service Orchestration**: Coordinate between different services

### Key Components

- `ChatService`: Central orchestration service
- `ChatHistoryService`: Chat history management
- `OrganizationService`: Organization validation and configuration
- `MCPService`: Communication with MCP servers
- `ServiceFactory`: Service instantiation and management

### React Integration

The services can be easily integrated with React components using the `useChatService` hook, which provides a clean interface for interacting with the chat functionality.

### Streaming Support

The newest addition to our service architecture is streaming support, which enables:

- Real-time display of AI responses as they're generated
- Improved user experience with faster perceived response times
- More natural conversational flow

For examples on how to use the streaming capabilities, see the `StreamingChatContainer` and `StreamingChatDemoPage` in the examples directory.
