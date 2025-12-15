import React from 'react';
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
    botAvatarIcon?: React.ReactNode;
    theme: any;
    sessionId?: string;
    MessageRenderer: React.ComponentType<{
        content: string;
        isUserMessage: boolean;
    }>;
    onCopyMessage?: (text: string) => Promise<void>;
    onUpdateReaction?: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
    onRefreshMessage?: (messageId: string) => Promise<void>;
}
export declare const MessageList: React.FC<MessageListProps>;
export default MessageList;
