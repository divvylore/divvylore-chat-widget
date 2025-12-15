# DivvyloreChatWidget Refactoring

## Overview

This document describes the refactoring of the DivvyloreChatWidget component into a modular structure. The goal was to improve code readability, maintainability, and reusability by breaking the monolithic component into smaller, focused components.

## Component Structure

### Before

Previously, the DivvyloreChatWidget was a single large component with all functionality contained within it. This made it difficult to maintain, test, and extend.

### After

The new structure organizes the code into the following components:

```
DivvyloreChatWidget/
├── components/
│   ├── ChatInput.tsx          # Handles user input and send functionality
│   ├── ChatHistory.tsx        # Displays conversation history
│   ├── EndChatDialog.tsx      # Dialog for ending current conversation
│   ├── Header.tsx             # Widget header with controls
│   ├── Message.tsx            # Individual message rendering
│   ├── MessageBubbleWrapper.tsx # Wrapper for message bubbles
│   ├── MessageList.tsx        # Container for all messages
│   └── StyleProvider.tsx      # Provides CSS styles
├── hooks/
│   ├── useChat.ts             # Chat state and operations
│   ├── useTextareaResize.ts   # Textarea auto-resize functionality
│   ├── useUIState.ts          # UI state management (collapsed/expanded)
│   └── index.ts               # Exports for hooks
├── utils/
│   └── index.ts               # Utility functions
├── DivvyloreChatWidget.tsx       # Main component that coordinates others
├── index.ts                   # Exports for components, hooks, and types
├── index.tsx                  # Main export with backward compatibility
├── styles.css                 # Global CSS styles
├── styles.ts                  # Style constants and theme
├── types.ts                   # TypeScript interfaces and types
├── styles.ts                  # Style constants and theme
├── types.ts                   # TypeScript interfaces
└── README.md                  # Documentation
```

## Benefits of the New Structure

1. **Separation of Concerns**: Each component has a specific responsibility, making the code more maintainable.

2. **Improved Readability**: Smaller components are easier to understand and navigate.

3. **Reusability**: Components can be reused in other contexts or projects.

4. **Testability**: Individual components can be tested in isolation.

5. **Scalability**: New features can be added by creating new components without affecting existing ones.

6. **Styling Consistency**: Centralized styles in `styles.ts` ensure consistent appearance.

7. **Type Safety**: Strong TypeScript interfaces in `types.ts` provide better type checking.

## Implementation Details

### ChatInput Component

Handles text input, auto-resizing, character counting, and send button logic.

### MessageList Component

Manages the list of messages, scrolling behavior, and welcome message.

### Message Component

Renders individual message bubbles with appropriate styling based on sender.

### Header Component

Contains title, buttons for new chat, end chat, expand/collapse, and minimize.

### ChatHistory Component

Overlay that shows previous conversations.

### EndChatDialog Component

Modal dialog for confirming when a user wants to end the current chat.

### StyleProvider Component

Injects required CSS animations and styles into the document head.

## Custom Hooks

Custom hooks have been created to extract and encapsulate specific functionality:

### useChat Hook

Manages all chat-related state and operations:

```typescript
const {
  messages,
  input,
  setInput,
  isLoading,
  handleSend,
  // ...other values and functions
} = useChat(sendMessageToAPI, options);
```

Benefits:
- Centralizes chat logic
- Makes the main component cleaner and more focused
- Allows reusing chat functionality in other components

### useTextareaResize Hook

Handles auto-resizing of the textarea based on content:

```typescript
const { textareaRef, handleShiftEnter } = useTextareaResize(input, {
  minHeight: 36,
  maxHeight: 116,
  lineHeight: 20
});
```

Benefits:
- Removes complex resize logic from components
- Handles special cases like paste events and shift+enter
- Provides a consistent resizing experience

### useUIState Hook

Manages UI state such as collapsed/expanded:

```typescript
const { isCollapsed, isExpanded, setIsCollapsed, toggleExpanded } = useUIState({
  startCollapsed: true
});
```

Benefits:
- Separates UI state management from other concerns
- Makes state transitions more predictable
- Simplifies component logic

## Usage Example

```tsx
import { DivvyloreChatWidget } from './components/DivvyloreChatWidget';

function App() {
  const handleSendMessage = async (message) => {
    // Process the message
    return "This is a response";
  };

  return (
    <DivvyloreChatWidget
      sendMessage={handleSendMessage}
      headerTitle="Customer Support"
      theme={{
        primaryColor: "#744da9"
      }}
    />
  );
}
```

## Further Improvements

1. **Style Extraction**: Further move inline styles to the styles.ts file.

2. **State Management**: Consider using Context API for state management across components.

3. **Performance Optimization**: Add memo and useCallback hooks to prevent unnecessary re-renders.

4. **Accessibility Improvements**: Enhance keyboard navigation and screen reader support.

5. **Unit Tests**: Create unit tests for each component.
