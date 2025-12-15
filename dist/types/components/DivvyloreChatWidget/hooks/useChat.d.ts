import type { Message } from '../types';
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
export declare const useChat: (sendMessageToAPI: (message: string) => Promise<string | void>, options?: UseChatOptions) => {
    messages: Message[];
    input: string;
    isLoading: boolean;
    isTyping: boolean;
    activeBotMessageId: string | null;
    showEndChatDialog: boolean;
    showChatHistory: boolean;
    isServiceInitialized: boolean;
    isServiceInitializing: boolean;
    serviceError: Error | null;
    sessionId: string | null;
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
    handleCopyMessage: (text: string) => Promise<void>;
    handleUpdateReaction: (messageId: string, reaction: "liked" | "disliked" | "", sessionId?: string) => Promise<void>;
    handleRefreshMessage: (messageId: string) => Promise<void>;
    setShowEndChatDialog: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setShowChatHistory: import("react").Dispatch<import("react").SetStateAction<boolean>>;
};
export default useChat;
