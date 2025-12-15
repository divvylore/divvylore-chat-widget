// Common styles for the DivvyloreChatWidget components

export const themeDefaults = {
  background: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  primaryColor: '#744da9',
  primaryLight: '#f9f5ff',
  borderColor: '#e1e4ea',
  userMessageBg: '#f9f5ff',
  userMessageText: '#333333',
  botMessageBg: '#ffffff',
  botMessageText: '#333333',
  hoverColor: '#63419a',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const containerStyles = {
  position: 'fixed',
  bottom: '28px',
  right: '28px',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 9999,
  border: '1px solid #e1e4ea',
  transition: 'width 0.3s ease',
  maxWidth: '92vw', /* Prevent overflow on smaller screens */
};

export const headerStyles = {
  padding: '12px 16px',
  borderBottom: '1px solid #e1e4ea',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const messageListStyles = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  background: '#ffffff',
  scrollbarWidth: 'thin',
  scrollbarColor: '#ddd #fff',
};

export const inputContainerStyles = {
  padding: '16px',
  borderTop: '1px solid #e8e8e8',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  background: '#ffffff',
};

export const textareaStyles = {
  width: '100%',
  border: '1px solid #e1e4ea',
  borderRadius: '24px',
  padding: '8px 18px',
  fontSize: '14px',
  outline: 'none',
  transition: 'height 0.18s ease-out, border-color 0.15s ease-out',
  resize: 'none',
  overflow: 'hidden',
  overflowX: 'hidden',
  overflowY: 'hidden',
  height: '36px',
  minHeight: '36px',
  maxHeight: '116px',
  lineHeight: '20px',
  wordWrap: 'break-word',
  boxSizing: 'border-box',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  marginBottom: '0',
  scrollbarWidth: 'thin',
  scrollbarColor: '#ddd #fff',
  WebkitOverflowScrolling: 'touch',
};

export const sendButtonStyles = {
  flexShrink: 0,
  alignSelf: 'center',
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
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transform: 'translateY(0)',
  transition: 'all 0.2s ease',
};

export const actionButtonStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const messageBubbleStyles = {
  padding: '12px 16px',
  wordBreak: 'break-word',
  position: 'relative',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  lineHeight: '1.5',
  maxWidth: '90%',
  minWidth: '0',
  display: 'inline-block',
};

export const dialogStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(2px)',
};

export const helperTextStyles = {
  fontSize: '11px',
  color: '#888',
  padding: '0 4px',
  marginTop: '6px',
  marginLeft: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

export const animationKeyframes = `
@keyframes inputTyping {
  0%, 100% {
    border-color: #e1e4ea;
  }
  50% {
    border-color: #744da9;
  }
}

@keyframes messageAppear {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dialogAppear {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes widgetSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  margin: 0 1px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% { 
    transform: scale(0.6);
  }
  40% { 
    transform: scale(1);
  }
}

.message-appear {
  animation: messageAppear 0.3s ease-out;
}

.dialog-appear {
  animation: dialogAppear 0.25s ease-out;
}

.widget-slide-in {
  animation: widgetSlideIn 0.3s ease-out;
}
`;

export default {
  themeDefaults,
  containerStyles,
  headerStyles,
  messageListStyles,
  inputContainerStyles,
  textareaStyles,
  sendButtonStyles,
  actionButtonStyles,
  messageBubbleStyles,
  dialogStyles,
  helperTextStyles,
  animationKeyframes
};
