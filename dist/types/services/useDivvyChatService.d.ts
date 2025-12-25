/**
 * Hook for DivvyChatService integration
 *
 * This hook provides a React interface for the DivvyChatService,
 * managing initialization, session state, and chat operations.
 */
import DivvyChatService from './divvyChatService';
interface UseDivvyChatServiceOptions {
    autoInitialize?: boolean;
    onInitialized?: (success: boolean) => void;
    onError?: (error: Error) => void;
    disableCache?: boolean;
}
export declare const useDivvyChatService: (clientId: string, agentId: string, // Required parameter - no default value
options?: UseDivvyChatServiceOptions) => {
    isInitialized: boolean;
    isInitializing: boolean;
    error: Error | null;
    sessionId: string | null;
    clientInfo: any;
    initialize: () => Promise<boolean>;
    sendMessage: (message: string, messageId?: string) => Promise<string>;
    getAgentStatus: () => Promise<any>;
    endChat: () => Promise<boolean>;
    startNewChat: () => Promise<boolean>;
    resetService: () => void;
    service: DivvyChatService | null;
};
export default useDivvyChatService;
