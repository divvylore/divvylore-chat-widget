import { useState, useCallback } from 'react';
import type { Message } from '../types';
import { useDivvyChatService } from '../../../services/useDivvyChatService';
import { logger } from '../../../utils/logger';
import { generateUniqueMessageId } from '../../../utils/messageId';

interface UseChatOptions {
  onEndChat?: () => void;
  onNewChat?: () => void;
  organizationId?: string;
  agentId?: string;
  setIsCollapsed?: (collapsed: boolean) => void;
}

/**
 * Custom hook to manage chat state and operations
 */
export const useChat = (
  sendMessageToAPI: (message: string) => Promise<string | void>,
  options?: UseChatOptions
) => {
  // Chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeBotMessageId, setActiveBotMessageId] = useState<string | null>(null);
  
  // UI state
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEndChatDialog, setShowEndChatDialog] = useState<boolean>(false);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(false);

  // Initialize DivvyChatService if organizationId and agentId are provided
  const divvyChatService = useDivvyChatService(
    options?.organizationId || '',
    options?.agentId || '', // No fallback to 'default' - agentId must be provided
    {
      autoInitialize: !!(options?.organizationId && options?.agentId), // Only initialize if both are provided and non-empty
      onError: (error) => {
        logger.error('DivvyChatService error:', error);
        const errorMessage: Message = {
          id: generateUniqueMessageId(),
          text: "Sorry, I encountered an error connecting to the chat service. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  );

  // Choose which send function to use based on organizationId
  const actualSendFunction = useCallback(async (message: string, messageId?: string): Promise<string> => {
    if (options?.organizationId && divvyChatService.isInitialized) {
      return await divvyChatService.sendMessage(message, messageId);
    } else {
      const response = await sendMessageToAPI(message);
      return typeof response === 'string' ? response : String(response) || '';
    }
  }, [options?.organizationId, divvyChatService.isInitialized, divvyChatService.sendMessage, sendMessageToAPI]);
  
  // Handle sending a message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    // Generate message ID first (will be used for both frontend and backend)
    const messageId = generateUniqueMessageId();
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateUniqueMessageId(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message using appropriate service with pre-generated message ID
      const response = await actualSendFunction(userMessage.text, messageId);
      
      // Add bot response to chat using the same message ID
      if (response) {
        const botMessage: Message = {
          id: messageId, // Use the same ID that was sent to backend
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setActiveBotMessageId(botMessage.id);
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueMessageId(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, actualSendFunction]);

  // Handle sending a direct message (e.g., from popular questions)
  const sendDirectMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    
    // Generate message ID first (will be used for both frontend and backend)
    const messageId = generateUniqueMessageId();
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateUniqueMessageId(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Send message using appropriate service with pre-generated message ID
      const response = await actualSendFunction(messageText.trim(), messageId);
      
      // Add bot response to chat using the same message ID
      if (response) {
        const botMessage: Message = {
          id: messageId, // Use the same ID that was sent to backend
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setActiveBotMessageId(botMessage.id);
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: generateUniqueMessageId(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, actualSendFunction]);
  
  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    if (messages.length > 0) {
      setShowEndChatDialog(true);
    } else {
      // No messages, just reset the state
      resetChat();
    }
    
    // Close chat history if it's open
    if (showChatHistory) {
      setShowChatHistory(false);
    }
  }, [messages.length, showChatHistory]);
  
  // Reset chat state for new conversation
  const resetChat = useCallback(async () => {
    setMessages([]);
    setInput('');
    setActiveBotMessageId(null);
    
    // If using DivvyChatService, start a new chat session
    if (options?.organizationId && divvyChatService.service) {
      try {
        logger.service('Starting new chat session...');
        const success = await divvyChatService.startNewChat();
        if (success) {
          logger.service('New chat session started successfully');
        } else {
          logger.error('Failed to start new chat session');
        }
      } catch (error) {
        logger.error('Error starting new chat session:', error);
      }
    }
    
    if (options?.onNewChat) {
      options.onNewChat();
    }
  }, [options, divvyChatService.startNewChat, divvyChatService.service]);
  
  // Handle ending the current chat
  const handleEndChat = useCallback(() => {
    setShowEndChatDialog(true);
  }, []);
  
  // Handle confirming end chat
  const handleConfirmEndChat = useCallback(async () => {
    // End chat session in DivvyChatService if using it
    if (options?.organizationId && divvyChatService.isInitialized) {
      try {
        logger.service('Ending current chat session...');
        await divvyChatService.endChat();
        logger.service('Chat session ended successfully');
      } catch (error) {
        logger.error('Error ending chat session:', error);
      }
    }
    
    // Save chat if needed
    if (options?.onEndChat) {
      options.onEndChat();
    }
    
    await resetChat();
    setShowEndChatDialog(false);
    
    // Collapse the chat widget after ending the chat
    if (options?.setIsCollapsed) {
      options.setIsCollapsed(true);
    }
  }, [options, resetChat, divvyChatService.isInitialized, divvyChatService.endChat]);
  
  // Toggle chat history
  const toggleChatHistory = useCallback(() => {
    setShowChatHistory(prev => !prev);
  }, []);

  // Message action handlers
  const handleCopyMessage = useCallback(async (text: string): Promise<void> => {
    if (options?.organizationId && divvyChatService.service) {
      await divvyChatService.service.copyToClipboard(text);
    } else {
      // Fallback for non-service mode
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
      } catch (error) {
        logger.error('Failed to copy message:', error);
        throw new Error('Failed to copy to clipboard');
      }
    }
  }, [options?.organizationId, divvyChatService.service]);

  const handleUpdateReaction = useCallback(async (messageId: string, reaction: 'liked' | 'disliked' | '', sessionId?: string): Promise<void> => {
    if (options?.organizationId && divvyChatService.service) {
      await divvyChatService.service.updateMessageReaction(messageId, reaction, sessionId);
    } else {
      logger.warn('Reaction functionality requires DivvyChatService initialization');
    }
  }, [options?.organizationId, divvyChatService.service]);

  const handleRefreshMessage = useCallback(async (messageId: string): Promise<void> => {
    // Find the message to refresh and the previous user message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      logger.warn('Message not found for refresh');
      return;
    }

    // Find the most recent user message before this bot message
    let userMessageToResend: string = '';
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        userMessageToResend = messages[i].text;
        break;
      }
    }

    if (!userMessageToResend) {
      logger.warn('No user message found to resend');
      return;
    }

    // Remove the bot message(s) after the user message and resend
    const userMessageIndex = messages.findIndex((msg, index) => 
      index < messageIndex && msg.sender === 'user' && msg.text === userMessageToResend
    );
    
    if (userMessageIndex !== -1) {
      // Remove messages after the user message
      setMessages(prev => prev.slice(0, userMessageIndex + 1));
      
      // Set the input to the user message and trigger send
      setInput(userMessageToResend);
      
      // Use a small delay to ensure state is updated, then send
      setTimeout(() => {
        setInput(''); // Clear input after setting
        // Trigger the send manually by calling sendDirectMessage
        sendDirectMessage(userMessageToResend);
      }, 10);
    }
  }, [messages, setInput, sendDirectMessage]);
  
  return {
    // State
    messages,
    input,
    isLoading,
    isTyping,
    activeBotMessageId,
    showEndChatDialog,
    showChatHistory,
    
    // Service state
    isServiceInitialized: divvyChatService.isInitialized,
    isServiceInitializing: divvyChatService.isInitializing,
    serviceError: divvyChatService.error,
    sessionId: divvyChatService.sessionId,
    clientInfo: divvyChatService.clientInfo,
    
    // Setters
    setInput,
    setIsTyping,
    
    // Actions
    handleSend,
    sendDirectMessage,
    handleNewChat,
    handleEndChat,
    handleConfirmEndChat,
    toggleChatHistory,
    resetChat,
    
    // Message actions
    handleCopyMessage,
    handleUpdateReaction,
    handleRefreshMessage,
    
    // Dialog actions
    setShowEndChatDialog,
    setShowChatHistory
  };
};

export default useChat;
