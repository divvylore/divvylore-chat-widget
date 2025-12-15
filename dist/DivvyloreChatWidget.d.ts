import react from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
interface Theme {
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
interface DivvyloreChatWidgetProps {
    welcomeMessage?: string;
    sendMessage?: (message: string) => Promise<string | void>;
    startCollapsed?: boolean;
    headerTitle?: string;
    chatIcon?: react.ReactNode;
    showHeaderIcon?: boolean;
    botName?: string;
    botAvatarIcon?: react.ReactNode;
    showBotAvatar?: boolean;
    defaultHeight?: string;
    defaultWidth?: string;
    expandedWidth?: string;
    theme?: Theme;
    onEndChat?: () => void;
    onNewChat?: () => void;
    popularQuestions?: string[];
    showWelcomeScreen?: boolean;
    organizationId?: string;
    agentId: string;
    agentKey: string;
    enableMultiSession?: boolean;
}

/**
 * A simple, customizable chat widget component for React applications
 */
declare const DivvyloreChatWidget: react.FC<DivvyloreChatWidgetProps>;

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    isLoading: boolean;
    isTyping: boolean;
    inputRef?: react.RefObject<HTMLTextAreaElement | null>;
}
declare const ChatInput: react.FC<ChatInputProps>;

interface MessageListProps {
    messages: Array<{
        id: string;
        sender: 'user' | 'bot';
        text: string;
    }>;
    isLoading: boolean;
    activeBotMessageId: string | null;
    showBotAvatar: boolean;
    botName: string;
    botAvatarIcon?: react.ReactNode;
    theme: any;
    sessionId?: string;
    MessageRenderer: react.ComponentType<{
        content: string;
        isUserMessage: boolean;
    }>;
    onCopyMessage?: (text: string) => Promise<void>;
    onUpdateReaction?: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
    onRefreshMessage?: (messageId: string) => Promise<void>;
}
declare const MessageList: react.FC<MessageListProps>;

interface HeaderProps {
    headerTitle: string;
    showHeaderIcon: boolean;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isExpanded: boolean;
    toggleExpanded: () => void;
    handleNewChat: () => void;
    handleEndChat: () => void;
    showChatHistory: boolean;
    toggleChatHistory: () => void;
    theme: any;
    clientIcon?: string;
    multiSessionEnabled?: boolean;
}
declare const Header: react.FC<HeaderProps>;

interface EndChatDialogProps {
    onCancel: () => void;
    onConfirm: () => void;
}
declare const EndChatDialog: react.FC<EndChatDialogProps>;

declare const themeDefaults: {
    background: string;
    textPrimary: string;
    textSecondary: string;
    primaryColor: string;
    primaryLight: string;
    borderColor: string;
    userMessageBg: string;
    userMessageText: string;
    botMessageBg: string;
    botMessageText: string;
    hoverColor: string;
    shadowColor: string;
    fontFamily: string;
};

export { ChatInput, DivvyloreChatWidget, EndChatDialog, Header, MessageList, DivvyloreChatWidget as default, themeDefaults };
export type { DivvyloreChatWidgetProps, Message, Theme };
