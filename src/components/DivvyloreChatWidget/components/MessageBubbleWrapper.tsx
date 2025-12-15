import React, { type ReactNode } from 'react';

interface MessageBubbleWrapperProps {
  children: ReactNode;
  isUserMessage: boolean;
  preventCollapse?: boolean;
}

/**
 * A wrapper component for message bubbles that prevents event propagation
 * to avoid chat window collapse when interacting with message content
 */
export const MessageBubbleWrapper: React.FC<MessageBubbleWrapperProps> = ({ 
  children, 
  isUserMessage, 
  preventCollapse = true 
}) => {
  // Event handler to prevent propagation
  const handleEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (preventCollapse) {
      try {
        e.stopPropagation();
      } catch (err) {
        console.error("Error stopping event propagation", err);
      }
    }
  };
  
  return (
    <div 
      className={`message-bubble-wrapper ${isUserMessage ? 'user-message' : 'bot-message'}`}
      style={{
        alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        position: 'relative',
      }}
      onClick={handleEvent}
      onMouseDown={handleEvent}
      onTouchStart={handleEvent}
    >
      {children}
    </div>
  );
};

export default MessageBubbleWrapper;
