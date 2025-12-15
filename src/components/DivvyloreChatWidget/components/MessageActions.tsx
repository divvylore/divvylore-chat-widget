import React, { useState } from 'react';

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
export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  messageText,
  sessionId,
  onCopy,
  onUpdateReaction,
  onRefresh,
  theme
}) => {
  const [likeState, setLikeState] = useState<'none' | 'liked' | 'disliked'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      setIsProcessing(true);
      await onCopy(messageText);
      setCopySuccess(true);
      
      // Reset copy success indicator after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle like button click
  const handleLike = async () => {
    try {
      setIsProcessing(true);
      
      if (likeState === 'liked') {
        // Toggle off like - clear reaction
        setLikeState('none');
        await onUpdateReaction(messageId, '', sessionId);
      } else {
        // Set like - also clear dislike if it was set
        setLikeState('liked');
        await onUpdateReaction(messageId, 'liked', sessionId);
      }
    } catch (error) {
      console.error('Failed to like message:', error);
      // Revert state on error
      setLikeState(likeState === 'liked' ? 'none' : 'liked');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    try {
      setIsProcessing(true);
      
      if (likeState === 'disliked') {
        // Toggle off dislike - clear reaction
        setLikeState('none');
        await onUpdateReaction(messageId, '', sessionId);
      } else {
        // Set dislike - also clear like if it was set
        setLikeState('disliked');
        await onUpdateReaction(messageId, 'disliked', sessionId);
      }
    } catch (error) {
      console.error('Failed to dislike message:', error);
      // Revert state on error
      setLikeState(likeState === 'disliked' ? 'none' : 'disliked');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle refresh/retry button click
  const handleRefresh = async () => {
    try {
      setIsProcessing(true);
      await onRefresh(messageId);
    } catch (error) {
      console.error('Failed to refresh message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Base button styles
  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    opacity: isProcessing ? 0.6 : 1,
    minWidth: '32px',
    height: '32px'
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    color: theme?.primaryColor || '#744da9',
    backgroundColor: theme?.primaryColor ? `${theme.primaryColor}15` : '#744da915'
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '2px',
        paddingLeft: '4px'
      }}
    >
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        disabled={isProcessing}
        title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
        style={copySuccess ? activeButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (!isProcessing && !copySuccess) {
            Object.assign(e.currentTarget.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (!copySuccess) {
            Object.assign(e.currentTarget.style, buttonStyle);
          }
        }}
      >
        {copySuccess ? (
          // Checkmark icon for successful copy
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        ) : (
          // Copy icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isProcessing}
        title="Like this response"
        style={likeState === 'liked' ? activeButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (!isProcessing && likeState !== 'liked') {
            Object.assign(e.currentTarget.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (likeState !== 'liked') {
            Object.assign(e.currentTarget.style, buttonStyle);
          }
        }}
      >
        {/* Thumbs up icon */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={likeState === 'liked' ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      </button>

      {/* Dislike Button */}
      <button
        onClick={handleDislike}
        disabled={isProcessing}
        title="Dislike this response"
        style={likeState === 'disliked' ? activeButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (!isProcessing && likeState !== 'disliked') {
            Object.assign(e.currentTarget.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (likeState !== 'disliked') {
            Object.assign(e.currentTarget.style, buttonStyle);
          }
        }}
      >
        {/* Thumbs down icon */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={likeState === 'disliked' ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth="2" 
          style={{ transform: 'rotate(180deg)' }}
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      </button>

      {/* Refresh/Retry Button */}
      <button
        onClick={handleRefresh}
        disabled={isProcessing}
        title="Retry this request"
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            Object.assign(e.currentTarget.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, buttonStyle);
        }}
      >
        {/* Refresh icon */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ 
            animation: isProcessing ? 'spin 1s linear infinite' : 'none' 
          }}
        >
          <polyline points="23,4 23,10 17,10"></polyline>
          <polyline points="1,20 1,14 7,14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
      </button>

      {/* CSS for spin animation - inject into head if not present */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default MessageActions;
