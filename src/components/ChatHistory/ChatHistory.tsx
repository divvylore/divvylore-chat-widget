/**
 * Chat History Component for Multi-Session Management
 * 
 * This component provides a UI for viewing, switching between, and managing
 * multiple chat sessions with search, filtering, and session actions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SessionStorageService, type SessionSummary } from '../../services/sessionStorageService';
import { logger } from '../../utils/logger';
import type { Theme } from '../DivvyloreChatWidget/types';

interface ChatHistoryProps {
  clientId: string;
  agentId: string;
  theme: Theme;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  currentSessionId?: string;
}

interface ChatHistoryState {
  sessions: SessionSummary[];
  loading: boolean;
  searchTerm: string;
  selectedSessionIds: Set<string>;
  showDeleteConfirm: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  clientId,
  agentId,
  theme,
  onSessionSelect,
  onNewChat,
  onClose,
  currentSessionId
}) => {
  const [state, setState] = useState<ChatHistoryState>({
    sessions: [],
    loading: true,
    searchTerm: '',
    selectedSessionIds: new Set(),
    showDeleteConfirm: false
  });

  // State for responsive design
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 480;
  });

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 480);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Load sessions on mount and when clientId/agentId changes
  const loadSessions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const sessions = SessionStorageService.getSessionsForClientAgent(clientId, agentId);
      setState(prev => ({ 
        ...prev, 
        sessions, 
        loading: false 
      }));
      
      logger.service(`Loaded ${sessions.length} sessions for ${clientId}_${agentId}`);
    } catch (error) {
      logger.error('Error loading sessions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [clientId, agentId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filter sessions based on search term
  const filteredSessions = state.sessions.filter(session =>
    session.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    session.preview.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  // Handle session selection
  const handleSessionSelect = useCallback((sessionId: string) => {
    onSessionSelect(sessionId);
    onClose();
  }, [onSessionSelect, onClose]);

  // Handle session deletion
  const handleDeleteSessions = useCallback((sessionIds: string[]) => {
    setState(prev => ({ 
      ...prev, 
      showDeleteConfirm: false, 
      selectedSessionIds: new Set() 
    }));

    let deletedCount = 0;
    sessionIds.forEach(sessionId => {
      if (SessionStorageService.deleteSession(sessionId)) {
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      loadSessions(); // Refresh the list
      logger.service(`Deleted ${deletedCount} sessions`);
    }
  }, [loadSessions]);

  // Handle select all/none
  const handleSelectAll = useCallback(() => {
    const allSelected = state.selectedSessionIds.size === filteredSessions.length;
    if (allSelected) {
      setState(prev => ({ ...prev, selectedSessionIds: new Set() }));
    } else {
      setState(prev => ({ 
        ...prev, 
        selectedSessionIds: new Set(filteredSessions.map(s => s.sessionId)) 
      }));
    }
  }, [state.selectedSessionIds.size, filteredSessions]);

  // Handle individual session selection for deletion
  const handleSessionCheckbox = useCallback((sessionId: string, checked: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedSessionIds);
      if (checked) {
        newSelected.add(sessionId);
      } else {
        newSelected.delete(sessionId);
      }
      return { ...prev, selectedSessionIds: newSelected };
    });
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Create hover handlers for buttons
  const getButtonHoverHandlers = (baseStyle: any, hoverColor?: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hoverColor) {
        e.currentTarget.style.backgroundColor = hoverColor;
      } else {
        e.currentTarget.style.opacity = '0.8';
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = baseStyle.backgroundColor;
      e.currentTarget.style.opacity = '1';
    }
  });

  // Check if screen is small (mobile-like)
  // (This is now handled by state above)

  const styles = {
    container: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.background,
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column' as const,
      zIndex: 1000,
    },
    header: {
      padding: '16px',
      borderBottom: `1px solid ${theme.borderColor}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.headerBackground,
    },
    title: {
      margin: 0,
      color: theme.textPrimary,
      fontSize: '16px',
      fontWeight: 600,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: theme.textSecondary,
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      borderRadius: '4px',
    },
    searchContainer: {
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.borderColor}`,
      display: 'flex',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      padding: '8px 12px',
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '6px',
      fontSize: '14px',
      color: theme.textPrimary,
      backgroundColor: theme.inputBackground,
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    actionsBar: {
      padding: '8px 16px',
      borderBottom: `1px solid ${theme.borderColor}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    actionButton: {
      padding: '6px 12px',
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '4px',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    newChatButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    },
    sessionsList: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '8px',
    },
    sessionItem: {
      padding: '12px',
      margin: '4px 0',
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      backgroundColor: theme.background,
      transition: 'all 0.2s ease',
    },
    sessionItemActive: {
      backgroundColor: `${theme.primaryColor}10`,
      borderColor: theme.primaryColor,
    },
    sessionItemHover: {
      backgroundColor: theme.hoverBackground || `${theme.textSecondary}05`,
    },
    sessionCheckbox: {
      marginTop: '2px',
      cursor: 'pointer',
    },
    sessionContent: {
      flex: 1,
      minWidth: 0,
    },
    sessionTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      fontWeight: 500,
      color: theme.textPrimary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    sessionPreview: {
      margin: '0 0 4px 0',
      fontSize: '12px',
      color: theme.textSecondary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    sessionMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '11px',
      color: theme.textSecondary,
    },
    messageBadge: {
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      borderRadius: '10px',
      padding: '2px 6px',
      fontSize: '10px',
      fontWeight: 500,
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center' as const,
      color: theme.textSecondary,
    },
    loadingState: {
      padding: '40px 20px',
      textAlign: 'center' as const,
      color: theme.textSecondary,
    },
    deleteConfirm: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: isSmallScreen ? '12px' : '16px',
      boxSizing: 'border-box' as const,
    },
    deleteDialog: {
      backgroundColor: theme.background,
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '8px',
      padding: isSmallScreen ? '16px' : '20px',
      maxWidth: isSmallScreen ? '320px' : '420px',
      width: '100%',
      minWidth: '280px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxSizing: 'border-box' as const,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
    deleteTitle: {
      margin: '0 0 12px 0',
      color: theme.textPrimary,
      fontSize: '16px',
      fontWeight: 600,
      wordWrap: 'break-word' as const,
    },
    deleteMessage: {
      margin: '0 0 20px 0',
      color: theme.textSecondary,
      fontSize: '14px',
      lineHeight: 1.5,
      wordWrap: 'break-word' as const,
    },
    deleteButtons: {
      display: 'flex',
      gap: '8px',
      justifyContent: isSmallScreen ? 'stretch' : 'flex-end',
      flexDirection: isSmallScreen ? ('column' as const) : ('row' as const),
      flexWrap: 'wrap' as const,
    },
    cancelButton: {
      padding: '10px 16px',
      border: `1px solid ${theme.borderColor}`,
      borderRadius: '4px',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: 500,
      minWidth: isSmallScreen ? 'auto' : '80px',
      width: isSmallScreen ? '100%' : 'auto',
      boxSizing: 'border-box' as const,
    },
    confirmButton: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#dc3545', // Keep red for destructive action
      color: '#ffffff',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      fontSize: '14px',
      minWidth: isSmallScreen ? 'auto' : '80px',
      width: isSmallScreen ? '100%' : 'auto',
      boxSizing: 'border-box' as const,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Chat History</h3>
        <button 
          style={styles.closeButton} 
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search conversations..."
          style={styles.searchInput}
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
      </div>

      {/* Actions Bar */}
      <div style={styles.actionsBar}>
        <div>
          {filteredSessions.length > 0 && (
            <>
              <button 
                style={styles.actionButton}
                onClick={handleSelectAll}
                {...getButtonHoverHandlers(styles.actionButton)}
              >
                {state.selectedSessionIds.size === filteredSessions.length ? 'Select None' : 'Select All'}
              </button>
              {state.selectedSessionIds.size > 0 && (
                <button 
                  style={{ ...styles.actionButton, marginLeft: '8px', color: '#dc3545' }}
                  onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: true }))}
                  {...getButtonHoverHandlers({ ...styles.actionButton, color: '#dc3545' })}
                >
                  Delete Selected ({state.selectedSessionIds.size})
                </button>
              )}
            </>
          )}
        </div>
        <button 
          style={styles.newChatButton}
          onClick={() => {
            onNewChat();
            onClose();
          }}
          {...getButtonHoverHandlers(styles.newChatButton, `${theme.primaryColor}dd`)}
        >
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div style={styles.sessionsList}>
        {state.loading ? (
          <div style={styles.loadingState}>
            Loading chat history...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={styles.emptyState}>
            {state.searchTerm ? 'No conversations match your search.' : 'No chat history yet.'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = state.selectedSessionIds.has(session.sessionId);
            const isActive = session.sessionId === currentSessionId;
            
            return (
              <div
                key={session.sessionId}
                style={{
                  ...styles.sessionItem,
                  ...(isActive ? styles.sessionItemActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = styles.sessionItemHover.backgroundColor!;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = styles.sessionItem.backgroundColor!;
                  }
                }}
              >
                <input
                  type="checkbox"
                  style={styles.sessionCheckbox}
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSessionCheckbox(session.sessionId, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div 
                  style={styles.sessionContent}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <h4 style={styles.sessionTitle}>
                    {session.title}
                    {session.isActive && <span style={{ color: theme.primaryColor, marginLeft: '8px' }}>●</span>}
                  </h4>
                  <p style={styles.sessionPreview}>{session.preview}</p>
                  <div style={styles.sessionMeta}>
                    <span>{formatTimestamp(session.lastActivity)}</span>
                    <span style={styles.messageBadge}>{session.messageCount}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {state.showDeleteConfirm && (
        <div style={styles.deleteConfirm}>
          <div style={styles.deleteDialog}>
            <h4 style={styles.deleteTitle}>Delete Conversations</h4>
            <p style={styles.deleteMessage}>
              Are you sure you want to delete {state.selectedSessionIds.size} conversation(s)? 
              This action cannot be undone.
            </p>
            <div style={styles.deleteButtons}>
              <button 
                style={styles.cancelButton}
                onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: false }))}
                {...getButtonHoverHandlers(styles.cancelButton)}
              >
                Cancel
              </button>
              <button 
                style={styles.confirmButton}
                onClick={() => handleDeleteSessions(Array.from(state.selectedSessionIds))}
                {...getButtonHoverHandlers(styles.confirmButton, '#c82333')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
