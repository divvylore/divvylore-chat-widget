import React, { useEffect } from 'react';

/**
 * This component injects the DivvyloreChatWidget styles into the document head
 * when the component is mounted.
 */
export const StyleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  useEffect(() => {
    // Create style element if it doesn't exist
    let styleElement = document.getElementById('divvychat-styles');
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'divvychat-styles';
      
      // Add all the animation keyframes and styles
      styleElement.textContent = `
        /* Animation keyframes for chat widget components */
        @keyframes inputTyping {
          0%, 100% { border-color: #e1e4ea; }
          50% { border-color: #744da9; }
        }
        
        @keyframes messageAppear {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes dialogAppear {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes widgetSlideIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        /* Typing indicator animation */
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
          0%, 80%, 100% { transform: scale(0.6); }
          40% { transform: scale(1); }
        }
        
        /* Message appearing animation */
        .message-appear {
          animation: messageAppear 0.3s ease-out;
        }
        
        /* Dialog appearing animation */
        .dialog-appear {
          animation: dialogAppear 0.25s ease-out;
        }
        
        /* Widget slide-in animation */
        .widget-slide-in {
          animation: widgetSlideIn 0.3s ease-out;
        }
        
        /* Scrollbar styling for webkit browsers */
        .simple-chat-widget ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .simple-chat-widget ::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }
        
        .simple-chat-widget ::-webkit-scrollbar-track {
          background: #fff;
        }
        
        /* Button hover effects */
        .action-button {
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
          border-radius: 4px;
        }
        
        /* Prevent text selection in buttons */
        .action-button, 
        .chat-button {
          user-select: none;
        }
      `;
      
      document.head.appendChild(styleElement);
    }
    
    // Clean up function to remove styles when component unmounts
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);
  
  return <>{children}</>;
};

export default StyleProvider;
