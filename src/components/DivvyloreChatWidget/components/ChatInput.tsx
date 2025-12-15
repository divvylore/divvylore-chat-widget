import React from 'react';
import { useTextareaResize } from '../hooks';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  isTyping: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSend,
  isLoading,
  isTyping,
  inputRef
}) => {
  // Use the custom hook for textarea resizing
  const { textareaRef: autoResizeRef, handleShiftEnter } = useTextareaResize(input, {
    minHeight: 36,
    maxHeight: 116,
    lineHeight: 20,
    padding: 16,
    maxLines: 5
  });
  
  // Count the number of characters input
  const characterCount = input.length;
  const isOverCharLimit = characterCount > 3000;
  const isNearCharLimit = characterCount > 3800;
  
  // Handler functions
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Update input state with new value
    setInput(e.target.value);
    
    // Update typing status for animation
    if (!isTyping && e.target.value.length > 0) {
      // setIsTyping(true); // Function not available in props
    } else if (isTyping && e.target.value.length === 0) {
      // setIsTyping(false); // Function not available in props
    }
  }
  
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        // Regular Enter - send the message
        e.preventDefault();
        handleSend();
      } else {
        // Shift+Enter - add new line and resize
        handleShiftEnter(e.currentTarget);
      }
    }
  }
  
  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      background: '#ffffff'
    }}>
      {/* Character counter */}
      {input.length > 0 && (
        <div style={{
          position: 'absolute',
          right: '8px', // Position it inside the textarea container
          top: '-20px', // Position above the textarea
          fontSize: '11px',
          color: isNearCharLimit ? '#f44336' : (isOverCharLimit ? '#ff9800' : '#888'),
          marginBottom: '2px',
          transition: 'all 0.2s ease',
          zIndex: 1 // Ensure it appears above other elements
        }}>
          {input.length} / 4000
        </div>
      )}
      
      <div style={{
        display: 'flex',
        width: '100%',
        position: 'relative',
        alignItems: 'center', // Center-align items vertically
        gap: '8px' // Space between textarea and button
      }}>
        <div style={{
          position: 'relative',
          flex: 1, // Take up available space
          display: 'flex' // Ensure proper flex layout
        }}>          <textarea
            ref={(el) => {
              // Assign to both refs
              if (inputRef) inputRef.current = el;
              autoResizeRef.current = el;
            }}
            className="chat-input-textarea"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            style={{
              width: '100%', // Fill container width
              border: '1px solid #e1e4ea',
              borderRadius: '24px',
              padding: '8px 18px', // Vertical and horizontal padding
              fontSize: '14px',
              outline: 'none',
              transition: 'height 0.18s ease-out, border-color 0.15s ease-out', // Smoother transitions
              animation: isTyping ? 'inputTyping 2s infinite ease-in-out' : 'none',
              resize: 'none', // Prevent user resizing
              overflow: 'hidden', // Always hide scrollbar initially
              overflowX: 'hidden', // Never show horizontal scrollbar
              overflowY: 'hidden', // Hide vertical scrollbar by default
              height: '36px', // Default single line height
              minHeight: '36px', // Ensure minimum height is maintained
              maxHeight: '116px', // 5 lines maximum (5 × 20px + 16px padding)
              lineHeight: '20px', // Line height for text
              wordWrap: 'break-word', // Ensure words wrap properly
              boxSizing: 'border-box', // Include padding in height calculation
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              marginBottom: '0', // Remove any bottom margin
              fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
              paddingRight: '18px',
              textAlign: 'left',
              // Completely hide scrollbars
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE and Edge
            }}
            onInput={(e) => {
              // Only show scrollbar when absolutely necessary (content overflows significantly)
              const target = e.currentTarget;
              const hasOverflow = target.scrollHeight > (target.clientHeight + 5); // Add tolerance
              
              if (hasOverflow && input.includes('\n')) {
                // Only show scrollbar for multiline content that actually overflows
                target.style.overflowY = 'auto';
              } else {
                // Always hide for single line or non-overflowing content
                target.style.overflowY = 'hidden';
              }
            }}
            onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              e.currentTarget.style.border = '1px solid #744da9';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(116, 77, 169, 0.1)';
            }}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              e.currentTarget.style.border = '1px solid #e1e4ea';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
            }}
          />
        </div>
        
        <SendButton 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading} 
        />
      </div>
      
      {/* Helper text */}
      <div style={{
        fontSize: '11px',
        color: '#888',
        padding: '0 4px',
        marginTop: '6px',
        marginLeft: '10px', // Increased left margin for better alignment
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <InfoIcon />
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>
    </div>
  );
};

// SendButton component
const SendButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flexShrink: 0, // Prevent button from shrinking
        alignSelf: 'center', // Align vertically in the middle
        background: '#744da9',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        padding: '0',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: !disabled ? 'pointer' : 'default',
        opacity: !disabled ? 1 : 0.7,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(0)' // Explicit base transform
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#63419a';
          e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#744da9';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3.4 20.4L21 12L3.4 3.6L3 10L17 12L3 14L3.4 20.4Z" fill="white"/>
      </svg>
    </button>
  );
};

// InfoIcon component
const InfoIcon: React.FC = () => {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 17H13V15H11V17ZM11 7H13V13H11V7Z" fill="#888"/>
    </svg>
  );
};

export default ChatInput;
