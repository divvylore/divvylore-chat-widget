/**
 * Chat History Component for Multi-Session Management
 *
 * This component provides a UI for viewing, switching between, and managing
 * multiple chat sessions with search, filtering, and session actions.
 */
import React from 'react';
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
declare const ChatHistory: React.FC<ChatHistoryProps>;
export default ChatHistory;
