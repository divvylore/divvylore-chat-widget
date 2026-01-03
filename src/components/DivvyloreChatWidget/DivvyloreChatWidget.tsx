import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ChatInput } from './components/ChatInput';
import { MessageList } from './components/MessageList';
import { Header } from './components/Header';
import { EndChatDialog } from './components/EndChatDialog';
import WelcomeScreen from './components/WelcomeScreen';
import StyleProvider from './components/StyleProvider';
import SimpleMarkdownRenderer from '../SimpleMarkdownRenderer';
import { themeDefaults } from './styles';
import type { DivvyloreChatWidgetProps, Theme } from './types';
import { useChat, useUIState, useEnhancedChat } from './hooks';
import ChatHistoryComponent from '../ChatHistory/ChatHistory';
import { envConfig } from '../../config/environment';
import { EndpointBuilder } from '../../config/endpoints';
import { logger, updateLoggerConfig, setWaitingForClientConfig } from '../../utils/logger';
import { domainAuthService, type AuthState } from '../../services/domainAuthService';
import { setupSessionCleanup } from '../../services/sessionStorageService';

/**
 * A simple, customizable chat widget component for React applications
 */
const DivvyloreChatWidget: React.FC<DivvyloreChatWidgetProps> = ({
  welcomeMessage = "Hello! How can I help you today?",
  sendMessage,
  startCollapsed = true,
  headerTitle = "Chat",
  chatIcon,
  showHeaderIcon = true,
  botName = "AI Assistant",
  botAvatarIcon,
  showBotAvatar = true,
  defaultHeight = "580px",
  defaultWidth = "380px",
  expandedWidth = "650px",
  theme: customTheme = {},
  onEndChat,
  onNewChat,
  popularQuestions = [],
  showWelcomeScreen = true,
  organizationId,
  agentId, // Required parameter - no default value
  agentKey, // Required parameter - agent API key for authentication
  enableMultiSession = false, // Enable multi-session chat management
  disableCache = false // When true, always fetch fresh config (useful for playground/testing)
}) => {
  // Debug: Log component mount with authentication parameters
  console.log('[DivvyloreChatWidget] Component mounted with params:', {
    organizationId: organizationId || '(not provided)',
    agentId: agentId || '(not provided)',
    agentKey: agentKey ? '(provided)' : '(not provided)',
    enableMultiSession,
    disableCache
  });
  
  // Initialize session cleanup on mount
  useEffect(() => {
    if (enableMultiSession) {
      setupSessionCleanup();
    }
  }, [enableMultiSession]);
  // Combine default theme with custom theme
  const theme: Theme = { ...themeDefaults, ...customTheme };
  
  // Direct config state for immediate loading
  const [directClientConfig, setDirectClientConfig] = useState<any>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Authentication state management
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isInitializing: false,
    hasAuthError: false,
    authErrorType: null,
    errorMessage: null
  });
  const [widgetVisible, setWidgetVisible] = useState(true);
  
  // Load config and initialize domain authentication
  useEffect(() => {
    console.log('[DivvyloreChatWidget] Auth useEffect triggered');
    
    const initializeAuth = async () => {
      // Validate required authentication parameters
      if (!organizationId) {
        console.error('[DivvyloreChatWidget] MISSING organizationId - authentication cannot proceed');
        logger.error('DivvyloreChatWidget: organizationId is required for authentication');
        setWidgetVisible(false);
        setConfigLoaded(true);
        return;
      }
      
      if (!agentId) {
        console.error('[DivvyloreChatWidget] MISSING agentId - authentication cannot proceed');
        logger.error('DivvyloreChatWidget: agentId is required for authentication');
        setWidgetVisible(false);
        setConfigLoaded(true);
        return;
      }
      
      if (!agentKey) {
        console.error('[DivvyloreChatWidget] MISSING agentKey - authentication cannot proceed');
        logger.error('DivvyloreChatWidget: agentKey is required for authentication');
        setWidgetVisible(false);
        setConfigLoaded(true);
        return;
      }
      
      console.log('[DivvyloreChatWidget] All auth params present, starting authentication...');
      
      // Immediately disable verbose logging until we load client configuration
      setWaitingForClientConfig(true);
      
      try {
        console.log('[DivvyloreChatWidget] Calling domainAuthService.initialize with:', {
          organizationId,
          agentId,
          agentKeyProvided: !!agentKey,
          serviceUrl: envConfig.divvyChatServiceUrl
        });
        
        // Initialize domain authentication and wait for result
        await domainAuthService.initialize(organizationId, agentId, agentKey, envConfig.divvyChatServiceUrl);
        
        console.log('[DivvyloreChatWidget] Domain authentication completed');
        
        // Check if widget should be visible after authentication
        const shouldBeVisible = domainAuthService.shouldWidgetBeVisible();
        setWidgetVisible(shouldBeVisible);
        
        if (!shouldBeVisible) {
          console.error('[DivvyloreChatWidget] Widget disabled due to authentication failure');
          logger.error('Widget disabled due to authentication failure');
          setConfigLoaded(true);
          return;
        }
        
        console.log('[DivvyloreChatWidget] Authentication successful, widget visible');
        logger.config('Domain authentication initialized successfully');
        
      } catch (error) {
        console.error('[DivvyloreChatWidget] Authentication failed:', error);
        // Enable default logging on error
        updateLoggerConfig();
        logger.error('Failed to initialize domain authentication:', error);
        
        // Check if widget should be visible after error handling
        const shouldBeVisible = domainAuthService.shouldWidgetBeVisible();
        setWidgetVisible(shouldBeVisible);
        
        setConfigLoaded(true); // Set to true anyway to show fallback or hide widget
      }
    };
    
    initializeAuth();
  }, [organizationId, agentId, agentKey]);

  // Listen to authentication state changes
  useEffect(() => {
    if (organizationId) {
      const handleAuthStateChange = (newAuthState: AuthState) => {
        setAuthState(newAuthState);
        const shouldBeVisible = domainAuthService.shouldWidgetBeVisible();
        setWidgetVisible(shouldBeVisible);
        
        if (!shouldBeVisible) {
          logger.warn('Widget hidden due to authentication failure:', newAuthState);
        }
      };
      
      // Add listener for auth state changes
      domainAuthService.addAuthStateListener(handleAuthStateChange);
      
      // Get initial auth state
      const initialAuthState = domainAuthService.getAuthState();
      setAuthState(initialAuthState);
      
      return () => {
        domainAuthService.removeAuthStateListener(handleAuthStateChange);
      };
    }
  }, [organizationId]);
  
  // Check if widget should be visible for auth/config errors
  const shouldShowWidget = !organizationId || widgetVisible;
  
  const {
    isCollapsed,
    isExpanded,
    setIsCollapsed,
    toggleExpanded
  } = useUIState({ startCollapsed });

  // Use enhanced chat hook with multi-session support
  const {
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    activeBotMessageId,
    showEndChatDialog,
    showChatHistory,
    currentSessionId,
    isLoadingSession,
    sessionError,
    multiSessionEnabled,
    clientInfo,
    isServiceInitialized,
    isServiceInitializing,
    backendSessionId,
    handleSend,
    sendDirectMessage,
    handleNewChat,
    handleEndChat,
    handleConfirmEndChat,
    toggleChatHistory,
    switchToSession,
    createNewSession,
    setShowEndChatDialog,
    // Message action handlers
    handleCopyMessage,
    handleUpdateReaction,
    handleRefreshMessage
  } = useEnhancedChat(sendMessage || (async () => ""), { 
    onEndChat, 
    onNewChat, 
    organizationId,
    agentId,
    setIsCollapsed,
    enableMultiSession,
    disableCache
  });

  // Update config when DivvyChatService loads configuration  
  useEffect(() => {
    if (isServiceInitialized && clientInfo) {
      // Update logger configuration when service provides client config
      if (clientInfo.logging) {
        updateLoggerConfig(clientInfo.logging);
      } else {
        // No logging config provided, use defaults
        updateLoggerConfig();
      }
      
      logger.config('Client configuration loaded from DivvyChatService:', clientInfo);
      setDirectClientConfig(clientInfo);
      setConfigLoaded(true);
    }
  }, [isServiceInitialized, clientInfo]);

  // Use configuration from DivvyChatService if available, otherwise use props
  const effectiveBotName = clientInfo?.bot_name || botName;
  
  // Convert bot_icon string (URL or base64) to React element
  const effectiveBotIcon = useMemo(() => {
    const iconSrc = clientInfo?.bot_icon;
    if (iconSrc && typeof iconSrc === 'string') {
      // Icon is a URL or base64 string - render as img
      return (
        <img 
          src={iconSrc} 
          alt="Bot Avatar"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Hide broken image and let default avatar show
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    // Fall back to prop-provided icon (React element) or undefined
    return botAvatarIcon;
  }, [clientInfo?.bot_icon, botAvatarIcon]);
  
  const effectiveHeaderTitle = clientInfo?.client_chat_title || clientInfo?.chat_header || headerTitle;
  
  // Client icon - keep as string (URL/base64) for components that render it themselves
  // Components will handle the conversion to img element as needed
  const effectiveClientIcon = useMemo(() => {
    const iconSrc = clientInfo?.client_icon;
    if (iconSrc && typeof iconSrc === 'string') {
      return iconSrc;
    }
    return undefined;
  }, [clientInfo?.client_icon]);
  
  // Client icon as React element for direct rendering (e.g., in start button)
  const effectiveClientIconElement = useMemo(() => {
    const iconSrc = clientInfo?.client_icon;
    if (iconSrc && typeof iconSrc === 'string') {
      return (
        <img 
          src={iconSrc} 
          alt="Client Icon"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    return null;
  }, [clientInfo?.client_icon]);
  const effectiveStartButtonText = directClientConfig?.start_button_text || clientInfo?.start_button_text;
  
  // Handle both nested and flat start_button_config structures for backward compatibility
  const effectiveStartButtonConfig = useMemo(() => {
    // First try direct config, then service config
    const config = directClientConfig || clientInfo;
    if (!config) return null;
    
    // Check if we have a nested start_button_config object
    if (config.start_button_config && typeof config.start_button_config === 'object') {
      return config.start_button_config;
    }
    
    // Handle flat structure from API (start_button_config_text_position, etc.)
    const flatConfig: any = {};
    
    // Map flat properties to nested structure
    if (config.start_button_config_text_position !== undefined) {
      flatConfig.text_position = config.start_button_config_text_position;
    }
    if (config.start_button_config_text_font_size !== undefined) {
      flatConfig.font_size = config.start_button_config_text_font_size;
    }
    if (config.start_button_config_text_font_weight !== undefined) {
      flatConfig.font_weight = config.start_button_config_text_font_weight;
    }
    if (config.start_button_config_text_font_color !== undefined) {
      flatConfig.text_color = config.start_button_config_text_font_color;
    }
    if (config.start_button_config_text_font_family !== undefined) {
      flatConfig.font_family = config.start_button_config_text_font_family;
    }
    
    // Return the flat config if it has any properties, otherwise null
    return Object.keys(flatConfig).length > 0 ? flatConfig : null;
  }, [directClientConfig, clientInfo]);
  
  // Use direct config first, then service config, then props
  const effectivePopularQuestions = useMemo(() => {
    if (directClientConfig?.popular_questions && Array.isArray(directClientConfig.popular_questions)) {
      return directClientConfig.popular_questions;
    }
    if (clientInfo?.popular_questions && Array.isArray(clientInfo.popular_questions)) {
      return clientInfo.popular_questions;
    }
    return popularQuestions;
  }, [directClientConfig?.popular_questions, clientInfo?.popular_questions, popularQuestions]);
  
  // Merge widget styles if available from clientInfo
  const effectiveTheme: Theme = clientInfo?.widget_style ? {
    ...theme,
    background: clientInfo.widget_style.background_color || theme.background,
    primaryColor: clientInfo.widget_style.primary_color || theme.primaryColor,
    textPrimary: clientInfo.widget_style.text_color || theme.textPrimary,
    botMessageBg: clientInfo.widget_style.background_color || theme.botMessageBg,
    userMessageBg: clientInfo.widget_style.secondary_color || theme.userMessageBg,
  } : theme;
    // Refs
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<SVGSVGElement | null>(null);
  
  // State for random animations
  const [currentButtonAnimation, setCurrentButtonAnimation] = useState<string>('');
  const [currentIconAnimation, setCurrentIconAnimation] = useState<string>('');
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  
  // Random animation system for attention-grabbing
  useEffect(() => {
    // Animation options
    const buttonAnimations = [
      'chat-button-heartbeat',
      'chat-button-glow', 
      'chat-button-bounce',
      'chat-button-scale-pulse',
      'chat-button-shimmer',
      'chat-button-combo-1',
      'chat-button-combo-2',
      'chat-button-combo-3'
    ];
    
    const iconAnimations = [
      'chat-icon-swing',
      'chat-icon-wobble'
    ];
    
    let animationTimeout: ReturnType<typeof setTimeout>;
    let clearButtonTimeout: ReturnType<typeof setTimeout>;
    let clearIconTimeout: ReturnType<typeof setTimeout>;
    
    if (isCollapsed && !isUserInteracting) {
      // Start random animations when widget is collapsed and user is not interacting
      const scheduleRandomAnimation = () => {
        // Much longer random interval between 30 seconds to 2+ minutes (30-150 seconds)
        const randomInterval = Math.random() * 120000 + 30000; // 30-150 seconds
        const intervalMinutes = (randomInterval / 60000).toFixed(1);
        logger.animation(`Next animation scheduled in ${intervalMinutes} minutes`);
        
        animationTimeout = setTimeout(() => {
          // Only apply animation if user is not interacting
          if (!isUserInteracting) {
            // Randomly choose button animation
            const randomButtonAnim = buttonAnimations[Math.floor(Math.random() * buttonAnimations.length)];
            logger.animation('Applying button animation:', randomButtonAnim);
            setCurrentButtonAnimation(randomButtonAnim);
            
            // Reduce icon animation chance to 15% to be very subtle
            if (Math.random() < 0.15) {
              const randomIconAnim = iconAnimations[Math.floor(Math.random() * iconAnimations.length)];
              logger.animation('Applying icon animation:', randomIconAnim);
              setCurrentIconAnimation(randomIconAnim);
              
              // Clear icon animation after it completes
              clearIconTimeout = setTimeout(() => {
                logger.animation('Clearing icon animation');
                setCurrentIconAnimation('');
              }, 1500);
            }
            
            // Clear button animation after longer duration (8 seconds)
            clearButtonTimeout = setTimeout(() => {
              logger.animation('Clearing button animation');
              setCurrentButtonAnimation('');
            }, 8000);
            
            // Schedule next animation
            scheduleRandomAnimation();
          }
        }, randomInterval);
      };
      
      // Start the animation cycle with much longer initial delay  
      const initialDelay = Math.random() * 30000 + 30000; // 30-60 seconds initial delay
      const initialDelayMinutes = (initialDelay / 60000).toFixed(1);
      logger.animation(`Animation system starting - first animation in ${initialDelayMinutes} minutes`);
      setTimeout(scheduleRandomAnimation, initialDelay);
    }
    
    // Cleanup function
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
      if (clearButtonTimeout) clearTimeout(clearButtonTimeout);
      if (clearIconTimeout) clearTimeout(clearIconTimeout);
    };
  }, [isCollapsed, isUserInteracting]);
  
  // Focus the input when the widget is opened
  useEffect(() => {
    if (!isCollapsed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCollapsed]);
  
  // Clear animations immediately when user starts interacting
  useEffect(() => {
    if (isUserInteracting) {
      logger.animation('User interaction detected - clearing all animations');
      setCurrentButtonAnimation('');
      setCurrentIconAnimation('');
    }
  }, [isUserInteracting]);
  
  // Render collapsed chat button
  if (isCollapsed) {
    // Don't render if we're waiting for config to load (prevents flickering)
    if (organizationId && !configLoaded) {
      return null;
    }

    // Don't render if widget should not be visible due to auth/config errors
    if (!shouldShowWidget) {
      logger.debug('Chat button hidden due to authentication or config failure');
      return null;
    }

    return (
      <StyleProvider>
        <div
          ref={buttonRef}
          onClick={() => {
            setIsUserInteracting(true);
            setCurrentButtonAnimation('');
            setCurrentIconAnimation('');
            logger.ui('User clicked button - opening widget and stopping animations');
            setIsCollapsed(false);
          }}
          className={`chat-button chat-button-enhanced chat-button-smooth ${isUserInteracting ? '' : currentButtonAnimation}`}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            // Dynamic width based on content with responsive behavior
            width: effectiveStartButtonText ? 'auto' : '60px',
            minWidth: effectiveStartButtonText ? '120px' : '60px',
            maxWidth: effectiveStartButtonText ? '200px' : '60px',
            height: '60px',
            borderRadius: '30px',
            backgroundColor: effectiveTheme.primaryColor || '#744da9',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            // Dynamic justification based on text position
            justifyContent: effectiveStartButtonText 
              ? (effectiveStartButtonConfig?.text_position === 'left' ? 'flex-end' : 'flex-start')
              : 'center',
            cursor: 'pointer',
            zIndex: 9999,
            transition: currentButtonAnimation ? 'none' : 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            animation: currentButtonAnimation ? undefined : 'widgetSlideIn 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
            transform: 'scale(1)',
            opacity: 1,
            paddingLeft: effectiveStartButtonText ? '8px' : '0',
            paddingRight: effectiveStartButtonText ? '16px' : '0',
            gap: effectiveStartButtonText ? '12px' : '0'
          } as React.CSSProperties & { '--primary-color'?: string }}
          onMouseOver={(e) => {
            setIsUserInteracting(true);
            // Clear any ongoing animations immediately
            setCurrentButtonAnimation('');
            setCurrentIconAnimation('');
            logger.ui('User hovering - stopping animations');
            
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(116, 77, 169, 0.25)';
            e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
          }}
          onMouseOut={(e) => {
            // Add a small delay before resuming animations
            setTimeout(() => {
              setIsUserInteracting(false);
              logger.ui('User stopped hovering - resuming animations after delay');
            }, 500);
            
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
          }}
          onMouseDown={(e) => {
            setIsUserInteracting(true);
            // Clear any ongoing animations immediately
            setCurrentButtonAnimation('');
            setCurrentIconAnimation('');
            logger.ui('User clicking - stopping animations');
            
            e.currentTarget.style.transform = 'scale(0.97)';
            e.currentTarget.style.transition = 'all 0.1s ease-in-out';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.transition = 'all 0.1s ease-in-out';
          }}
        >
          {/* Icon Container - Always present, circular when text is shown */}
          <div
            style={{
              width: effectiveStartButtonText ? '44px' : '60px',
              height: effectiveStartButtonText ? '44px' : '60px',
              borderRadius: '50%',
              backgroundColor: effectiveStartButtonText ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              order: (effectiveStartButtonConfig?.text_position === 'left') ? 2 : 1
            }}
          >
            {effectiveClientIconElement ? (
              // Use client icon if available
              <span style={{
                fontSize: effectiveStartButtonText ? '20px' : '28px',
                transition: 'transform 0.3s ease-in-out'
              }}>
                {effectiveClientIconElement}
              </span>
            ) : chatIcon ? chatIcon : (
              // Default avatar when no client icon is provided
              <div
                style={{
                  width: effectiveStartButtonText ? '32px' : '40px',
                  height: effectiveStartButtonText ? '32px' : '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg 
                  ref={iconRef}
                  className={isUserInteracting ? '' : currentIconAnimation}
                  width={effectiveStartButtonText ? "18" : "24"} 
                  height={effectiveStartButtonText ? "18" : "24"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transition: 'transform 0.3s ease-in-out'
                  }}
                >
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill={effectiveTheme.primaryColor || '#744da9'}/>
                </svg>
              </div>
            )}
          </div>
          
          {/* Text Container - Single element with CSS order-based positioning */}
          {effectiveStartButtonText && (
            <span
              style={{
                color: effectiveStartButtonConfig?.text_color || 'white',
                fontSize: effectiveStartButtonConfig?.font_size || '15px',
                fontWeight: effectiveStartButtonConfig?.font_weight || '600',
                fontFamily: effectiveStartButtonConfig?.font_family || effectiveTheme.fontFamily || 'system-ui, -apple-system, sans-serif',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: '120px',
                order: (effectiveStartButtonConfig?.text_position === 'left') ? 1 : 2
              }}
            >
              {effectiveStartButtonText}
            </span>
          )}
        </div>
      </StyleProvider>
    );
  }
  
  // Don't render expanded widget if it should not be visible due to auth/config errors
  if (!shouldShowWidget) {
    logger.debug('Chat widget hidden due to authentication or config failure');
    return null;
  }
  
  // Render expanded chat widget
  return (
    <StyleProvider>
      <div
        className="simple-chat-widget widget-expand"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: isExpanded ? expandedWidth : defaultWidth,
          height: `min(${defaultHeight}, calc(100vh - 56px))`,
          maxHeight: 'calc(100vh - 56px)',
          borderRadius: '8px',
          backgroundColor: theme.background,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          border: '1px solid #e1e4ea',
          transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
          maxWidth: '92vw',
          transform: 'scale(1)',
          opacity: 1,
          animation: 'widgetExpandSmooth 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards'
        }}
        onClick={(e) => {
          if (e.target && (e.target as HTMLElement).closest('.simple-chat-widget')) {
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          if (e.target && (e.target as HTMLElement).closest('.simple-chat-widget')) {
            e.stopPropagation();
          }
        }}
      >
        {/* Chat History View - Overlay */}
        {showChatHistory && multiSessionEnabled && organizationId && agentId && (
          <ChatHistoryComponent 
            clientId={organizationId}
            agentId={agentId}
            theme={effectiveTheme}
            onSessionSelect={switchToSession}
            onNewChat={createNewSession}
            onClose={toggleChatHistory}
            currentSessionId={currentSessionId || undefined}
          />
        )}
        
        {/* End Chat Dialog - Overlay */}
        {showEndChatDialog && (
          <EndChatDialog
            onCancel={() => setShowEndChatDialog(false)}
            onConfirm={handleConfirmEndChat}
          />
        )}
        
        {/* Header */}
        <Header
          headerTitle={effectiveHeaderTitle}
          showHeaderIcon={showHeaderIcon}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
          handleNewChat={handleNewChat}
          handleEndChat={handleEndChat}
          showChatHistory={showChatHistory}
          toggleChatHistory={toggleChatHistory}
          theme={effectiveTheme}
          clientIcon={effectiveClientIcon}
          multiSessionEnabled={!!multiSessionEnabled}
        />
        
        {/* Privacy Notice Banner */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e1e4ea',
            fontSize: '11px',
            color: '#666666',
            textAlign: 'center',
            lineHeight: '1.4',
            flexShrink: 0
          }}
        >
          This chat is recorded using a cloud service and is subject to the terms of our{' '}
          <a
            href="https://divvylore.com/agent/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1a73e8',
              textDecoration: 'none'
            }}
          >
            Privacy Notice
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginLeft: '2px',
                verticalAlign: 'middle',
                display: 'inline-block'
              }}
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                stroke="#1a73e8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
        
        {/* Messages container or Welcome Screen */}
        {messages.length === 0 && showWelcomeScreen ? (
          // If organizationId is provided, wait for service initialization before showing welcome screen
          organizationId && !isServiceInitialized ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              {isServiceInitializing ? 'Loading configuration...' : 'Connecting to service...'}
            </div>
          ) : (
            <WelcomeScreen
              welcomeMessage={welcomeMessage}
              popularQuestions={effectivePopularQuestions}
              onQuestionClick={(question) => {
                logger.ui('Question clicked:', question);
                setInput(question);
                // Focus the input after setting the question
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              botName={effectiveBotName}
              botAvatarIcon={effectiveBotIcon}
              showBotAvatar={showBotAvatar}
              theme={effectiveTheme}
            />
          )
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            activeBotMessageId={activeBotMessageId}
            showBotAvatar={showBotAvatar}
            botName={effectiveBotName}
            botAvatarIcon={effectiveBotIcon}
            theme={effectiveTheme}
            sessionId={backendSessionId || undefined}
            MessageRenderer={SimpleMarkdownRenderer}
            onCopyMessage={handleCopyMessage}
            onUpdateReaction={handleUpdateReaction}
            onRefreshMessage={handleRefreshMessage}
          />
        )}
        
        {/* Input bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
          isTyping={isTyping}
          inputRef={inputRef}
        />
      </div>
    </StyleProvider>
  );
};

export default DivvyloreChatWidget;
