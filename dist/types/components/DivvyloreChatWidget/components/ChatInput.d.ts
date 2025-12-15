import React from 'react';
interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    isLoading: boolean;
    isTyping: boolean;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export default ChatInput;
