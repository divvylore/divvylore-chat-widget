/**
 * Enhanced useChat Hook with Multi-Session Support
 *
 * This enhanced version of the useChat hook provides comprehensive multi-session
 * chat management with localStorage persistence, session switching, and chat history.
 */
import type { Message } from '../types';
interface UseChatOptions {
    onEndChat?: () => void;
    onNewChat?: () => void;
    organizationId?: string;
    agentId?: string;
    setIsCollapsed?: (collapsed: boolean) => void;
    enableMultiSession?: boolean;
}
/**
 * Enhanced custom hook to manage multi-session chat state and operations
 */
export declare const useEnhancedChat: (sendMessageToAPI: (message: string) => Promise<string | void>, options?: UseChatOptions) => {
    messages: Message[];
    input: string;
    isLoading: boolean;
    isTyping: boolean;
    activeBotMessageId: string | null;
    showEndChatDialog: boolean;
    showChatHistory: boolean;
    currentSessionId: string | null;
    isLoadingSession: boolean;
    sessionError: string | null;
    multiSessionEnabled: string | false | undefined;
    isServiceInitialized: boolean;
    isServiceInitializing: boolean;
    serviceError: Error | null;
    backendSessionId: string | null;
    clientInfo: any;
    setInput: import("react").Dispatch<import("react").SetStateAction<string>>;
    setIsTyping: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    handleSend: () => Promise<void>;
    sendDirectMessage: (messageText: string) => Promise<void>;
    handleNewChat: () => void;
    handleEndChat: () => void;
    handleConfirmEndChat: () => Promise<void>;
    toggleChatHistory: () => void;
    resetChat: () => Promise<void>;
    switchToSession: (sessionId: string) => Promise<boolean>;
    createNewSession: () => Promise<boolean | void>;
    handleCopyMessage: (text: string) => Promise<void>;
    handleUpdateReaction: (messageId: string, reaction: "liked" | "disliked" | "", sessionId?: string) => Promise<void>;
    handleRefreshMessage: (messageId: string) => Promise<void>;
    setShowEndChatDialog: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setShowChatHistory: import("react").Dispatch<import("react").SetStateAction<boolean>>;
};
export default useEnhancedChat;
