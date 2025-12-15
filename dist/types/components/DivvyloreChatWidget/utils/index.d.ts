/**
 * Utilities for the DivvyloreChatWidget component
 */
/**
 * Generates a unique ID for messages
 */
export declare const generateMessageId: (type: "user" | "bot" | "error") => string;
/**
 * Truncates a string to a specified length
 */
export declare const truncateString: (str: string, maxLength: number) => string;
/**
 * Formats a date to a readable string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Checks if a URL is valid
 */
export declare const isValidUrl: (url: string) => boolean;
/**
 * Debounces a function
 */
export declare const debounce: <F extends (...args: any[]) => any>(func: F, waitFor: number) => ((...args: Parameters<F>) => void);
/**
 * Throttle a function
 */
export declare const throttle: <F extends (...args: any[]) => any>(func: F, waitFor: number) => ((...args: Parameters<F>) => void);
declare const _default: {
    generateMessageId: (type: "user" | "bot" | "error") => string;
    truncateString: (str: string, maxLength: number) => string;
    formatDate: (date: Date) => string;
    isValidUrl: (url: string) => boolean;
    debounce: <F extends (...args: any[]) => any>(func: F, waitFor: number) => ((...args: Parameters<F>) => void);
    throttle: <F extends (...args: any[]) => any>(func: F, waitFor: number) => ((...args: Parameters<F>) => void);
};
export default _default;
