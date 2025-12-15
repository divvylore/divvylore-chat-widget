import React, { ReactNode } from 'react';
interface MessageBubbleWrapperProps {
    children: ReactNode;
    isUserMessage: boolean;
    preventCollapse?: boolean;
}
/**
 * A wrapper component for message bubbles that prevents event propagation
 * to avoid chat window collapse when interacting with message content
 */
declare const MessageBubbleWrapper: React.FC<MessageBubbleWrapperProps>;
export default MessageBubbleWrapper;
