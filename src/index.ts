// Main entry point for the DivvyChat library
// Export all components that should be accessible to consumers

import DivvyloreChatWidget from './components/DivvyloreChatWidget/DivvyloreChatWidget';
export { DivvyloreChatWidget };

// Export types for TypeScript users
export type { 
  DivvyloreChatWidgetProps,
  Message, 
  Theme 
} from './components/DivvyloreChatWidget/types';

// Re-export sub-components for advanced usage
export { 
  ChatInput, 
  MessageList, 
  Header, 
  EndChatDialog 
} from './components/DivvyloreChatWidget/index';

// Export styles
export { themeDefaults } from './components/DivvyloreChatWidget/styles';

// Default export
export default DivvyloreChatWidget;
