/**
 * Enhanced useChat Hook with Multi-Session Support
 * 
 * This enhanced version of the useChat hook provides comprehensive multi-session
 * chat management with localStorage persistence, session switching, and chat history.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { useDivvyChatService } from '../../../services/useDivvyChatService';
import { SessionStorageService, type ChatSession } from '../../../services/sessionStorageService';
import { logger } from '../../../utils/logger';
import { generateUniqueMessageId } from '../../../utils/messageId';

interface UseChatOptions {
  onEndChat?: () => void;
  onNewChat?: () => void;
  organizationId?: string;
  agentId?: string;
  setIsCollapsed?: (collapsed: boolean) => void;
  enableMultiSession?: boolean; // Enable multi-session management
  disableCache?: boolean; // When true, always fetch fresh config (useful for playground/testing)
}

interface ChatTranscriptAPI {
  getSessionTranscript: (clientId: string, sessionId: string) => Promise<Message[]>;
}

/**
 * Enhanced custom hook to manage multi-session chat state and operations
 */
export const useEnhancedChat = (
  sendMessageToAPI: (message: string) => Promise<string | void>,
  options?: UseChatOptions
) => {
  // Current session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeBotMessageId, setActiveBotMessageId] = useState<string | null>(null);
  
  // UI state
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEndChatDialog, setShowEndChatDialog] = useState<boolean>(false);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(false);

  // Session management state
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Multi-session enabled flag
  const multiSessionEnabled = options?.enableMultiSession && options?.organizationId && options?.agentId;

  // Ref to track if we've initialized the session
  const sessionInitialized = useRef(false);

  // Initialize DivvyChatService if organizationId and agentId are provided
  const divvyChatService = useDivvyChatService(
    options?.organizationId || '',
    options?.agentId || '',
    {
      autoInitialize: !!(options?.organizationId && options?.agentId),
      disableCache: options?.disableCache || false,
      onError: (error) => {
        logger.error('DivvyChatService error:', error);
        const errorMessage: Message = {
          id: generateUniqueMessageId(),
          text: "Sorry, I encountered an error connecting to the chat service. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        };
        addMessageToCurrentSession(errorMessage);
      }
    }
  );

  // Initialize session on mount
  useEffect(() => {
    if (multiSessionEnabled && !sessionInitialized.current) {
      initializeSession();
      sessionInitialized.current = true;
    }
  }, [multiSessionEnabled]);

  // Initialize or load existing session
  const initializeSession = useCallback(async () => {
    if (!multiSessionEnabled) return;

    setIsLoadingSession(true);
    setSessionError(null);

    try {
      // Get active session or create new one
      let session = SessionStorageService.getActiveSession(
        options!.organizationId!,
        options!.agentId!
      );

      if (!session) {
        // No active session, create a new one
        session = SessionStorageService.createSession(
          options!.organizationId!,
          options!.agentId!
        );
        logger.service('Created new session:', session.sessionId);
      } else {
        logger.service('Loaded active session:', session.sessionId);
      }

      setCurrentSessionId(session.sessionId);
      setMessages(session.messages);

      // If using DivvyChatService, sync with backend session
      if (divvyChatService.isInitialized && session.sessionId) {
        // The backend sessionId might be different from our frontend sessionId
        // We track both separately
      }

    } catch (error) {
      logger.error('Error initializing session:', error);
      setSessionError('Failed to load chat session');
    } finally {
      setIsLoadingSession(false);
    }
  }, [multiSessionEnabled, options, divvyChatService.isInitialized]);

  // Add message to current session and persist
  const addMessageToCurrentSession = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      
      // Persist to session storage if multi-session is enabled
      if (multiSessionEnabled && currentSessionId) {
        SessionStorageService.updateSessionMessages(currentSessionId, newMessages);
      }
      
      return newMessages;
    });
  }, [multiSessionEnabled, currentSessionId]);

  // Update all messages for current session
  const updateCurrentSessionMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    
    // Persist to session storage if multi-session is enabled
    if (multiSessionEnabled && currentSessionId) {
      SessionStorageService.updateSessionMessages(currentSessionId, newMessages);
    }
  }, [multiSessionEnabled, currentSessionId]);

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
    
    addMessageToCurrentSession(userMessage);
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
        
        addMessageToCurrentSession(botMessage);
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
      
      addMessageToCurrentSession(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, actualSendFunction, addMessageToCurrentSession]);

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
    
    addMessageToCurrentSession(userMessage);
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
        
        addMessageToCurrentSession(botMessage);
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
      
      addMessageToCurrentSession(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, actualSendFunction, addMessageToCurrentSession]);

  // Switch to a different session
  const switchToSession = useCallback(async (sessionId: string) => {
    if (!multiSessionEnabled) return false;

    setIsLoadingSession(true);
    setSessionError(null);

    try {
      const session = SessionStorageService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Mark this session as active
      SessionStorageService.setActiveSession(sessionId);

      // Update UI state
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setActiveBotMessageId(null);
      setInput('');

      // If using DivvyChatService, we may need to start a new backend session
      // The backend and frontend session IDs are tracked separately
      if (divvyChatService.isInitialized) {
        // You could implement backend session switching here if needed
        // For now, each frontend session switch creates a new backend session
      }

      logger.service('Switched to session:', sessionId);
      return true;
    } catch (error) {
      logger.error('Error switching session:', error);
      setSessionError('Failed to switch to session');
      return false;
    } finally {
      setIsLoadingSession(false);
    }
  }, [multiSessionEnabled, divvyChatService.isInitialized]);

  // Create a new session
  const createNewSession = useCallback(async () => {
    if (!multiSessionEnabled) {
      // Fallback to regular new chat behavior
      return resetChat();
    }

    setIsLoadingSession(true);
    setSessionError(null);

    try {
      // End current session if active
      if (currentSessionId) {
        SessionStorageService.endSession(currentSessionId);
      }

      // Create new session
      const newSession = SessionStorageService.createSession(
        options!.organizationId!,
        options!.agentId!
      );

      // Update UI state
      setCurrentSessionId(newSession.sessionId);
      setMessages([]);
      setActiveBotMessageId(null);
      setInput('');

      // If using DivvyChatService, start a new chat session
      if (divvyChatService.service) {
        try {
          logger.service('Starting new backend chat session...');
          const success = await divvyChatService.startNewChat();
          if (success) {
            logger.service('New backend chat session started successfully');
          } else {
            logger.error('Failed to start new backend chat session');
          }
        } catch (error) {
          logger.error('Error starting new backend chat session:', error);
        }
      }

      if (options?.onNewChat) {
        options.onNewChat();
      }

      logger.service('Created new session:', newSession.sessionId);
      return true;
    } catch (error) {
      logger.error('Error creating new session:', error);
      setSessionError('Failed to create new session');
      return false;
    } finally {
      setIsLoadingSession(false);
    }
  }, [multiSessionEnabled, currentSessionId, options, divvyChatService.service, divvyChatService.startNewChat]);

  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    if (multiSessionEnabled) {
      if (messages.length > 0) {
        setShowEndChatDialog(true);
      } else {
        createNewSession();
      }
    } else {
      // Fallback to original behavior
      if (messages.length > 0) {
        setShowEndChatDialog(true);
      } else {
        resetChat();
      }
    }
    
    // Close chat history if it's open
    if (showChatHistory) {
      setShowChatHistory(false);
    }
  }, [multiSessionEnabled, messages.length, showChatHistory, createNewSession]);

  // Reset chat state for new conversation (original behavior)
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

    // End current session if multi-session is enabled
    if (multiSessionEnabled && currentSessionId) {
      SessionStorageService.endSession(currentSessionId);
    }

    // Save chat if needed
    if (options?.onEndChat) {
      options.onEndChat();
    }

    if (multiSessionEnabled) {
      await createNewSession();
    } else {
      await resetChat();
    }
    
    setShowEndChatDialog(false);
    
    // Collapse the chat widget after ending the chat
    if (options?.setIsCollapsed) {
      options.setIsCollapsed(true);
    }
  }, [options, divvyChatService.isInitialized, divvyChatService.endChat, multiSessionEnabled, currentSessionId, createNewSession, resetChat]);

  // Toggle chat history
  const toggleChatHistory = useCallback(() => {
    setShowChatHistory(prev => !prev);
  }, []);

  // Message action handlers (existing functionality)
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
      const newMessages = messages.slice(0, userMessageIndex + 1);
      updateCurrentSessionMessages(newMessages);
      
      // Set the input to the user message and trigger send
      setInput(userMessageToResend);
      
      // Use a small delay to ensure state is updated, then send
      setTimeout(() => {
        setInput(''); // Clear input after setting
        // Trigger the send manually by calling sendDirectMessage
        sendDirectMessage(userMessageToResend);
      }, 10);
    }
  }, [messages, setInput, sendDirectMessage, updateCurrentSessionMessages]);

  return {
    // State
    messages,
    input,
    isLoading,
    isTyping,
    activeBotMessageId,
    showEndChatDialog,
    showChatHistory,
    
    // Multi-session state
    currentSessionId,
    isLoadingSession,
    sessionError,
    multiSessionEnabled,
    
    // Service state
    isServiceInitialized: divvyChatService.isInitialized,
    isServiceInitializing: divvyChatService.isInitializing,
    serviceError: divvyChatService.error,
    backendSessionId: divvyChatService.sessionId, // Backend session ID (different from frontend)
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
    
    // Multi-session actions
    switchToSession,
    createNewSession,
    
    // Message actions
    handleCopyMessage,
    handleUpdateReaction,
    handleRefreshMessage,
    
    // Dialog actions
    setShowEndChatDialog,
    setShowChatHistory
  };
};

export default useEnhancedChat;
