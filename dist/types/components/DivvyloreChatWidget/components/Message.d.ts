import React from 'react';
interface MessageProps {
    message: {
        id: string;
        sender: 'user' | 'bot';
        text: string;
    };
    activeBotMessageId: string | null;
    showBotAvatar: boolean;
    botName: string;
    botAvatarIcon?: React.ReactNode;
    theme: any;
    sessionId?: string;
    isLatestBotMessage?: boolean;
    MessageRenderer: React.ComponentType<{
        content: string;
        isUserMessage: boolean;
    }>;
    onCopyMessage?: (text: string) => Promise<void>;
    onUpdateReaction?: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
    onRefreshMessage?: (messageId: string) => Promise<void>;
}
export declare const Message: React.FC<MessageProps>;
export default Message;
