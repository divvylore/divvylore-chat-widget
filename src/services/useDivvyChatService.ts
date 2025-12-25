/**
 * Hook for DivvyChatService integration
 * 
 * This hook provides a React interface for the DivvyChatService,
 * managing initialization, session state, and chat operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import DivvyChatService, { DivvyChatServiceManager } from './divvyChatService';
import { domainAuthService } from './domainAuthService';
import { envConfig } from '../config/environment';
import { logger, updateLoggerConfig } from '../utils/logger';

interface UseDivvyChatServiceOptions {
  autoInitialize?: boolean;
  onInitialized?: (success: boolean) => void;
  onError?: (error: Error) => void;
  disableCache?: boolean; // When true, always fetch fresh config (useful for playground/testing)
}

export const useDivvyChatService = (
  clientId: string,
  agentId: string, // Required parameter - no default value
  options: UseDivvyChatServiceOptions = {}
) => {
  const {
    autoInitialize = true,
    onInitialized,
    onError,
    disableCache = false
  } = options;

  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  
  // Track domain auth state to trigger re-initialization when auth completes
  const [domainAuthReady, setDomainAuthReady] = useState(false);

  // Service instance ref
  const serviceRef = useRef<DivvyChatService | null>(null);
  
  // Flag to prevent multiple initialization attempts
  const initializationAttemptedRef = useRef(false);
  
  // Listen for domain auth state changes
  useEffect(() => {
    const handleAuthStateChange = (authState: { isAuthenticated: boolean; isInitializing: boolean; hasAuthError: boolean }) => {
      logger.service('useDivvyChatService: Auth state changed:', authState);
      if (authState.isAuthenticated && !authState.isInitializing && !authState.hasAuthError) {
        setDomainAuthReady(true);
      }
    };
    
    // Check initial state
    const initialState = domainAuthService.getAuthState();
    if (initialState.isAuthenticated && !initialState.isInitializing && !initialState.hasAuthError) {
      setDomainAuthReady(true);
    }
    
    domainAuthService.addAuthStateListener(handleAuthStateChange);
    
    return () => {
      domainAuthService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  // Initialize service
  const initialize = useCallback(async () => {
    if (!clientId || !agentId || isInitializing) {
      logger.service('Skipping initialization: missing clientId or agentId');
      return false;
    }

    // Prevent multiple initialization attempts
    if (initializationAttemptedRef.current && serviceRef.current?.isInitialized()) {
      return true;
    }

    logger.service('Initializing DivvyChatService:', {
      clientId,
      agentId,
      baseUrl: envConfig.divvyChatServiceUrl,
      isInitializing,
      alreadyAttempted: initializationAttemptedRef.current,
      disableCache
    });

    setIsInitializing(true);
    setError(null);
    initializationAttemptedRef.current = true;

    try {
      // Use singleton pattern to get service instance
      // When disableCache is true, a fresh instance is created
      if (!serviceRef.current || disableCache) {
        serviceRef.current = DivvyChatServiceManager.getInstance(clientId, agentId, envConfig.divvyChatServiceUrl, disableCache);
      }
      
      // Initialize the service
      const success = await serviceRef.current.initialize();
      
      logger.service('DivvyChatService initialization result:', success);
      
      if (success) {
        setIsInitialized(true);
        setSessionId(serviceRef.current.getCurrentSessionId());
        const clientInfo = serviceRef.current.getClientInfo();
        setClientInfo(clientInfo);
        
        // Update logger configuration based on client config
        if (clientInfo?.logging) {
          updateLoggerConfig(clientInfo.logging);
          logger.config('Logger configuration updated from client config:', clientInfo.logging);
        }
        
        logger.service('DivvyChatService initialized successfully:', {
          sessionId: serviceRef.current.getCurrentSessionId(),
          clientInfo: clientInfo
        });
        
        if (onInitialized) {
          onInitialized(true);
        }
      } else {
        throw new Error('Failed to initialize DivvyChatService');
      }

      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('DivvyChatService initialization error:', error);
      setError(error);
      setIsInitialized(false);
      
      if (onError) {
        onError(error);
      }
      
      if (onInitialized) {
        onInitialized(false);
      }
      
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [clientId, agentId, isInitializing, onInitialized, onError]); // Added agentId to dependency array

  // Send message function
  const sendMessage = useCallback(async (message: string, messageId?: string): Promise<string> => {
    if (!serviceRef.current) {
      throw new Error('Service instance not available');
    }

    try {
      // Let the service handle its own initialization if needed
      const response = await serviceRef.current.sendMessage(message, messageId);
      
      // Update initialization state if service auto-initialized
      if (!isInitialized && serviceRef.current.isInitialized()) {
        setIsInitialized(true);
        if (onInitialized) {
          onInitialized(true);
        }
      }
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [isInitialized, onError]);

  // Get agent status
  const getAgentStatus = useCallback(async () => {
    if (!serviceRef.current || !isInitialized) {
      return null;
    }

    try {
      return await serviceRef.current.getAgentStatus();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  }, [isInitialized, onError]);

  // End chat session
  const endChat = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current) {
      return true;
    }

    try {
      const success = await serviceRef.current.endChat();
      
      if (success) {
        setSessionId(null);
        setIsInitialized(false);
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      return false;
    }
  }, [onError]);

  // Start new chat
  const startNewChat = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current) {
      return false;
    }

    try {
      const success = await serviceRef.current.startNewChat();
      
      if (success) {
        setSessionId(serviceRef.current.getCurrentSessionId());
        // Re-initialize the service state since endChat() sets it to false
        setIsInitialized(true);
        setError(null);
        
        logger.service('New chat started successfully:', {
          sessionId: serviceRef.current.getCurrentSessionId(),
          isInitialized: true
        });
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      return false;
    }
  }, [onError]);

  // Reset service (for testing/debugging)
  const resetService = useCallback(() => {
    initializationAttemptedRef.current = false;
    setIsInitialized(false);
    setIsInitializing(false);
    setError(null);
    setSessionId(null);
    setClientInfo(null);
    
    if (serviceRef.current) {
      serviceRef.current.resetInitialization();
    }
  }, []);

  // Auto-initialize on mount - waits for domain auth to be ready
  useEffect(() => {
    if (!autoInitialize || !clientId || !agentId || isInitialized || isInitializing || initializationAttemptedRef.current) {
      return;
    }
    
    // Wait for domain auth to be ready before initializing
    if (!domainAuthReady) {
      logger.service('useDivvyChatService: Waiting for domain auth to be ready...');
      return;
    }
    
    logger.service('useDivvyChatService: Domain auth ready, initializing service...');
    initialize();
  }, [autoInitialize, clientId, agentId, isInitialized, isInitializing, initialize, domainAuthReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset initialization flag on unmount
      initializationAttemptedRef.current = false;
      // Cleanup service instance
      serviceRef.current = null;
    };
  }, []);

  return {
    // State
    isInitialized,
    isInitializing,
    error,
    sessionId,
    clientInfo,
    
    // Methods
    initialize,
    sendMessage,
    getAgentStatus,
    endChat,
    startNewChat,
    resetService,
    
    // Service instance (for advanced usage)
    service: serviceRef.current,
  };
};

export default useDivvyChatService;
