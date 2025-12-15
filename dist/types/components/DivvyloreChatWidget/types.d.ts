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
    organizationId?: string;
    agentId: string;
    agentKey: string;
    enableMultiSession?: boolean;
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
    clientIcon?: string;
}
export interface EndChatDialogProps {
    onCancel: () => void;
    onConfirm: () => void;
}
