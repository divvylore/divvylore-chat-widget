import React from 'react';
import DivvyloreChatWidget from './DivvyloreChatWidget/DivvyloreChatWidget';
import type { DivvyloreChatWidgetProps as CoreDivvyloreChatWidgetProps } from './DivvyloreChatWidget/types';

/**
 * Represents a single chat message in the conversation
 */
export interface ChatMessage {
  /** Unique message identifier (usually a timestamp) */
  id: number;
  
  /** Who sent the message */
  sender: "user" | "bot";
  
  /** Message content */
  text: string;
  
  /** Optional URL for the avatar image */
  avatarUrl?: string;
}

/**
 * Props for the legacy DivvyloreChatWidget adapter (maintains original public API)
 */
export interface LegacyDivvyloreChatWidgetProps {
  /** Organization identifier */
  orgId: string;
  
  /** Organization URL */
  orgUrl: string;
  
  /** Unique widget identifier */
  widgetId: string;
  
  /** Agent API key for authentication */
  agentKey: string;
  
  /** Backend integration type */
  backend: "openai" | "mcp";
  
  /** Custom welcome message (empty for no message) */
  welcomeMessage?: string;
  
  /** Popular/suggested questions to show on welcome screen */
  popularQuestions?: string[];
  
  /** Whether to show the welcome screen when no messages */
  showWelcomeScreen?: boolean;
  
  /** Custom styles for the widget container */
  styleProps?: React.CSSProperties;
  
  /** Header configuration */
  headerProps?: {
    /** Whether to hide the minimize/maximize button */
    hideMinimizeButton?: boolean;
    /** Custom title for the chat header */
    title?: string;
    /** Custom icon URL for the chat header */
    iconUrl?: string;
    /** Show the bot name in the header */
    showBotName?: boolean;
  };

  /** Theme configuration */
  themeProps?: {
    /** Primary color for user messages and accents (default: "#0078d4" - Microsoft blue) */
    primaryColor?: string;
    /** Bot avatar URL */
    botAvatarUrl?: string;
    /** User avatar URL or null to use default icon */
    userAvatarUrl?: string | null;
    /** Whether to show the bot name with messages */
    showBotName?: boolean;
    /** Bot name to display (if showBotName is true) */
    botName?: string;
  };
  
  /** 
   * Function to handle sending messages
   * @param message The message text to send
   * @returns A promise that resolves to a bot response message
   */
  sendMessage?: (message: string) => Promise<ChatMessage>;
  
  /** Initial messages to show in the chat */
  initialMessages?: ChatMessage[];
  
  /** Start the widget in collapsed state (as a floating button) */
  startCollapsed?: boolean;
  
  /** Callback when user clicks "New Chat" */
  onNewChat?: () => void;
  
  /** Callback when user clicks "End Chat" */
  onEndChat?: () => void;
  
  /** Callback when user wants to view recent chats */
  onViewRecentChats?: () => void;
  
  /** Callback when user selects a chat from history */
  onSelectChat?: (chatId: string) => void;
  
  /** Chat history items to display */
  chatHistory?: Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp: string | Date;
    isOpen?: boolean;
  }>;
  
  /** Whether to show the recent chats panel */
  showRecentChats?: boolean;
}

/**
 * LegacyDivvyloreChatWidget - Compatibility component that preserves the original
 * DivvyloreChatWidget API surface but delegates rendering to the new DivvyloreChatWidget implementation.
 * 
 * This component serves as a compatibility layer to maintain the existing API while
 * using the improved DivvyloreChatWidget implementation.
 */
export const LegacyDivvyloreChatWidget: React.FC<LegacyDivvyloreChatWidgetProps> = ({
  orgId,
  orgUrl,
  widgetId,
  agentKey,
  backend,
  welcomeMessage = "Hello! How can I help you today?",
  popularQuestions = [],
  showWelcomeScreen = true,
  styleProps = {},
  headerProps = {},
  themeProps = {},
  sendMessage,
  initialMessages = [],
  startCollapsed = true,
  onNewChat,
  onEndChat,
  onViewRecentChats,
  onSelectChat,
  chatHistory = [],
  showRecentChats = false,
}) => {
  // Adapter function to convert the ChatMessage-based sendMessage to string-based
  const adaptedSendMessage = async (message: string): Promise<string> => {
    if (!sendMessage) {
      return "I'm not connected to a backend service.";
    }
    
    try {
      const response = await sendMessage(message);
      return response.text;
    } catch (error) {
      console.error('Error sending message:', error);
      return "Sorry, something went wrong. Please try again.";
    }
  };

  // Convert theme props to DivvyloreChatWidget theme format
  const adaptedTheme: CoreDivvyloreChatWidgetProps['theme'] = {
    primaryColor: themeProps.primaryColor || "#744da9",
    userMessageBg: themeProps.primaryColor || "#744da9",
    userMessageText: "#ffffff",
    botMessageBg: "#ffffff",
    botMessageText: "#222222",
    background: "#f8fafd",
    textPrimary: "#222222",
    textSecondary: "#666666",
    borderColor: "#e1e4ea",
  };

  // Determine header title
  const headerTitle = headerProps.title || "Divvylore Chat";
  
  // Determine bot name
  const botName = themeProps.botName || "Divvylore Assistant";

  return (
    <DivvyloreChatWidget
      welcomeMessage={welcomeMessage}
      popularQuestions={popularQuestions}
      showWelcomeScreen={showWelcomeScreen}
      sendMessage={adaptedSendMessage}
      startCollapsed={startCollapsed}
      headerTitle={headerTitle}
      botName={botName}
      showBotAvatar={true}
      theme={adaptedTheme}
      defaultHeight="600px"
      defaultWidth="420px"
      expandedWidth="650px"
      onNewChat={onNewChat}
      onEndChat={onEndChat}
      organizationId={orgId}
      agentId={widgetId} // Use widgetId as agentId for legacy compatibility
      agentKey={agentKey}
    />
  );
};

export type DivvyloreChatWidgetLegacyProps = LegacyDivvyloreChatWidgetProps;

export default LegacyDivvyloreChatWidget;
