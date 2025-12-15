import React from 'react';
interface MessageActionsProps {
    messageId: string;
    messageText: string;
    sessionId?: string;
    onCopy: (text: string) => Promise<void>;
    onUpdateReaction: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
    onRefresh: (messageId: string) => Promise<void>;
    theme?: any;
}
/**
 * Action buttons component for agent/bot messages
 * Provides Copy, Like, Dislike, and Refresh/Retry functionality
 */
export declare const MessageActions: React.FC<MessageActionsProps>;
export default MessageActions;
