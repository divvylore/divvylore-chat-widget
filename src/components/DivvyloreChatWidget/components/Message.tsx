import React from 'react';
import MessageActions from './MessageActions';

const DefaultBotAvatar: React.FC = () => (
  <div
    style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #744da9 0%, #9b69c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      flexShrink: 0
    }}
  >
    AI
  </div>
);

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
  // Action handlers for bot messages
  onCopyMessage?: (text: string) => Promise<void>;
  onUpdateReaction?: (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string) => Promise<void>;
  onRefreshMessage?: (messageId: string) => Promise<void>;
}

export const Message: React.FC<MessageProps> = ({
  message,
  activeBotMessageId,
  showBotAvatar,
  botName,
  botAvatarIcon,
  theme,
  sessionId,
  isLatestBotMessage = false,
  MessageRenderer,
  onCopyMessage,
  onUpdateReaction,
  onRefreshMessage
}) => {
  const isUserMessage = message.sender === 'user';
  const isBotMessage = message.sender === 'bot';
  
  return (
    <div
      key={message.id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: '16px'
      }}
      className="message-appear"
    >
      {isUserMessage ? (
        // User Message Layout
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '4px',
          paddingRight: '4px'
        }}>
          <div
            style={{
              background: '#744da9',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '18px 18px 4px 18px',
              maxWidth: '90%',
              fontSize: '14px',
              lineHeight: '1.4',
              fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              wordBreak: 'break-word',
              textAlign: 'left'
            }}
          >
            <MessageRenderer 
              content={message.text} 
              isUserMessage={isUserMessage} 
            />
          </div>
        </div>
      ) : (
        // Bot Message Layout
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}>
          {showBotAvatar && (
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {botAvatarIcon || <DefaultBotAvatar />}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {showBotAvatar && (
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#424242',
                marginBottom: '6px',
                fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '0.01em',
                textAlign: 'left'
              }}>
                {botName}
              </div>
            )}
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                color: '#2c3e50',
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                maxWidth: '98%',
                fontSize: '14px',
                lineHeight: '1.4',
                fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                wordBreak: 'break-word',
                textAlign: 'left'
              }}
            >
              <MessageRenderer 
                content={message.text} 
                isUserMessage={isUserMessage} 
              />
            </div>
            
            {/* Action buttons for bot messages - show only on latest bot message */}
            {isBotMessage && isLatestBotMessage && onCopyMessage && onUpdateReaction && onRefreshMessage && (
              <MessageActions
                messageId={message.id}
                messageText={message.text}
                sessionId={sessionId}
                onCopy={onCopyMessage}
                onUpdateReaction={onUpdateReaction}
                onRefresh={onRefreshMessage}
                theme={theme}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
