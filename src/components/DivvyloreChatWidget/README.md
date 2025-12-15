# DivvyloreChatWidget Component

A modular, customizable chat widget for React applications with clean, modern UI.

## Component Structure

The DivvyloreChatWidget is organized into several reusable components:

```
DivvyloreChatWidget/
├── components/
│   ├── ChatInput.tsx        # Text input and send button
│   ├── EndChatDialog.tsx    # End chat confirmation dialog
│   ├── Header.tsx           # Widget header with controls
│   ├── Message.tsx          # Individual message component
│   └── MessageList.tsx      # Container for messages
├── DivvyloreChatWidget.tsx     # Main component
├── index.ts                 # Barrel exports for sub-components
├── index.tsx                # Default export helper
├── styles.css               # Global CSS styles
├── styles.ts                # Style constants
└── types.ts                 # TypeScript interfaces
```

## Usage

```tsx
import DivvyloreChatWidget from './components/DivvyloreChatWidget';

function App() {
  const handleSendMessage = async (message: string) => {
    // Process the message and return a response
    return `You said: ${message}`;
  };

  return (
    <div className="App">
      <DivvyloreChatWidget 
        sendMessage={handleSendMessage} 
        headerTitle="DivvyChat"
        showBotAvatar={true}
        theme={{
          primaryColor: '#744da9',
          userMessageBg: '#f9f5ff',
        }}
      />
    </div>
  );
}
```

## Props

The DivvyloreChatWidget accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| sendMessage | (message: string) => Promise<string \| void> | Required | Function to process user messages and return responses |
| welcomeMessage | string | "Hello! How can I help you today?" | Initial message shown to the user |
| startCollapsed | boolean | true | Whether the widget starts in collapsed state |
| headerTitle | string | "Chat" | Title shown in the widget header |
| showHeaderIcon | boolean | true | Whether to show the chat icon in the header |
| botName | string | "AI Assistant" | Name of the bot |
| showBotAvatar | boolean | true | Whether to show the bot avatar |
| defaultHeight | string | "580px" | Height of the widget |
| defaultWidth | string | "380px" | Width of the widget in normal mode |
| expandedWidth | string | "650px" | Width of the widget in expanded mode |
| theme | object | {} | Theme customization object |
| onEndChat | () => void | undefined | Callback when chat is ended |
| onNewChat | () => void | undefined | Callback when a new chat is started |
| organizationId | string | undefined | Organization/tenant ID used when connecting to DivvyChatService |
| agentId | string | Required | Agent identifier required for authentication |
| agentKey | string | Required | Agent API key used to authenticate requests |
| enableMultiSession | boolean | false | Enable local multi-session history across chats |
| popularQuestions | string[] | [] | Suggested prompts shown on welcome screen |
| showWelcomeScreen | boolean | true | Display the welcome screen when there are no messages |

## Theme Customization

The widget's appearance can be customized through the `theme` prop:

```tsx
<DivvyloreChatWidget
  theme={{
    background: '#ffffff',
    textPrimary: '#333333',
    textSecondary: '#666666',
    primaryColor: '#744da9',
    primaryLight: '#f9f5ff',
    borderColor: '#e1e4ea',
    userMessageBg: '#f9f5ff',
    userMessageText: '#333333',
    botMessageBg: '#ffffff',
    botMessageText: '#333333',
  }}
/>
```

## Extending Components

Each component can be customized or extended as needed. The multi-session chat history overlay lives at `src/components/ChatHistory/ChatHistory.tsx` and is imported directly by the widget. For example, to create a custom input component:

```tsx
import { ChatInput } from './components/DivvyloreChatWidget';

const CustomChatInput = (props) => {
  // Add custom functionality or styling
  return (
    <div className="custom-input-wrapper">
      <ChatInput {...props} />
    </div>
  );
};
```
