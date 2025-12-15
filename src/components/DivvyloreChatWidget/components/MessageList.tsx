import React, { useRef, useEffect, useMemo } from 'react';
import Message from './Message';

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
  // Action handlers for bot messages
  onCopyMessage?: (text: string) => Promise<void>;
  onUpdateReaction?: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
  onRefreshMessage?: (messageId: string) => Promise<void>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  activeBotMessageId,
  showBotAvatar,
  botName,
  botAvatarIcon,
  theme,
  sessionId,
  MessageRenderer,
  onCopyMessage,
  onUpdateReaction,
  onRefreshMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Find the latest bot message for action buttons
  const latestBotMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'bot') {
        return messages[i].id;
      }
    }
    return null;
  }, [messages]);
  
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 0', /* Changed from 16px 5px to 16px 0 to let the MessageBubbleWrapper control horizontal spacing */
        display: 'flex',
        flexDirection: 'column',
        gap: '8px', /* Reduced gap from 16px to 8px for more compact message layout */
        background: '#ffffff',
        scrollbarWidth: 'thin', /* For Firefox */
        scrollbarColor: '#ddd #fff' /* For Firefox */
      }}
    >
      {/* Messages */}
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          activeBotMessageId={activeBotMessageId}
          showBotAvatar={showBotAvatar}
          botName={botName}
          botAvatarIcon={botAvatarIcon}
          theme={theme}
          sessionId={sessionId}
          isLatestBotMessage={message.id === latestBotMessageId}
          MessageRenderer={MessageRenderer}
          onCopyMessage={onCopyMessage}
          onUpdateReaction={onUpdateReaction}
          onRefreshMessage={onRefreshMessage}
        />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <TypingIndicator />
      )}
      
      {/* Reference element for scrolling to bottom */}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div style={{ 
      alignSelf: 'flex-start',
      padding: '10px 14px',
      borderRadius: '16px',
      background: '#f5f5f5'
    }}>
      <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default MessageList;
