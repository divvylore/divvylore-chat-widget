import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Theme {
  background?: string;
  textPrimary?: string;
  textSecondary?: string;
  userMessageBg?: string;
  userMessageText?: string;
  botMessageBg?: string;
  botMessageText?: string;
  primaryColor?: string;
  borderColor?: string;
  fontFamily?: string;
  [key: string]: string | undefined;
}

export interface DivvyloreChatWidgetProps {
  welcomeMessage?: string;
  sendMessage?: (message: string) => Promise<string | void>;
  startCollapsed?: boolean;
  headerTitle?: string;
  chatIcon?: React.ReactNode;
  showHeaderIcon?: boolean;
  botName?: string;
  botAvatarIcon?: React.ReactNode;
  showBotAvatar?: boolean;
  defaultHeight?: string;
  defaultWidth?: string;
  expandedWidth?: string;
  theme?: Theme;
  onEndChat?: () => void;
  onNewChat?: () => void;
  popularQuestions?: string[];
  showWelcomeScreen?: boolean;
  
  // DivvyChatService integration props
  organizationId?: string;
  agentId: string; // Required parameter - must be explicitly provided by client
  agentKey: string; // Required parameter - agent API key for authentication
  
  // Multi-session management
  enableMultiSession?: boolean; // Enable multi-session chat management with localStorage
  
  // Cache control
  disableCache?: boolean; // When true, always fetch fresh config (useful for playground/testing)
}

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  isTyping: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  theme: Theme;
  showBotAvatar: boolean;
  activeBotMessageId: string | null;
  MessageRenderer: React.ComponentType<{
    content: string;
    isUserMessage: boolean;
  }>;
}

export interface HeaderProps {
  headerTitle: string;
  showHeaderIcon: boolean;
  theme: Theme;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleNewChat: () => void;
  handleEndChat: () => void;
  showChatHistory: boolean;
  toggleChatHistory: () => void;
  clientIcon?: string; // Client-specific icon for customization
}

export interface EndChatDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

// Chat history UI now lives in src/components/ChatHistory/ChatHistory.tsx
