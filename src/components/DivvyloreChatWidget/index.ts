// Export main component
export { default } from './DivvyloreChatWidget';

// Export components
export { default as ChatInput } from './components/ChatInput';
export { default as MessageList } from './components/MessageList';
export { default as Message } from './components/Message';
export { default as Header } from './components/Header';
export { default as EndChatDialog } from './components/EndChatDialog';
export { default as StyleProvider } from './components/StyleProvider';
export { default as MessageBubbleWrapper } from './components/MessageBubbleWrapper';

// Export hooks
export { useChat, useTextareaResize, useUIState } from './hooks';

// Export styles
export { default as styles } from './styles';
export {
  themeDefaults,
  containerStyles,
  headerStyles,
  messageListStyles,
  inputContainerStyles,
  textareaStyles,
  sendButtonStyles,
  actionButtonStyles,
  messageBubbleStyles,
  dialogStyles,
  helperTextStyles,
  animationKeyframes
} from './styles';

// Export types
export type {
  Message as MessageType,
  Theme,
  DivvyloreChatWidgetProps,
  ChatInputProps,
  MessageListProps,
  HeaderProps,
  EndChatDialogProps
} from './types';
