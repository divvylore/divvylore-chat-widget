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
const MessageBubbleWrapper: React.FC<MessageBubbleWrapperProps> = ({ 
  children, 
  isUserMessage, 
  preventCollapse = true 
}) => {  // Event handler to prevent propagation
  const handleEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (preventCollapse) {
      try {
        e.stopPropagation();
        // For links inside messages, allow default behavior
        if ((e.target as HTMLElement).tagName !== 'A') {
          e.preventDefault();
        }
      } catch (error) {
        console.error("Error handling event in message bubble:", error);
      }
    }
  };return (
    <div 
      className={`message-bubble-wrapper ${isUserMessage ? 'user-message' : 'bot-message'}`}
      onClick={handleEvent}
      onMouseDown={handleEvent}
      onTouchStart={handleEvent}
      style={{ 
        width: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2px' /* Add a small margin bottom for spacing */
      }}
    >      <div style={{ 
        width: '92%', /* Reduced from 100% to create more consistent margins */
        maxWidth: '92%', /* Ensures consistent width across different screen sizes */
        display: 'flex',
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        padding: isUserMessage ? '0 12px' : '0 0 0 20px', /* Optimized left padding for bot messages and brand icons */
        alignItems: 'center', /* Ensure vertical alignment */
        paddingRight: '12px' /* Consistent right padding */
      }}>
        {children}
      </div>
    </div>
  );
};

export default MessageBubbleWrapper;
