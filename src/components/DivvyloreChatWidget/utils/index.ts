/**
 * Utilities for the DivvyloreChatWidget component
 */

/**
 * Generates a unique ID for messages
 */
export const generateMessageId = (type: 'user' | 'bot' | 'error'): string => {
  return `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Truncates a string to a specified length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    return `Today at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return date.toLocaleDateString() + ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};

/**
 * Checks if a URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Debounces a function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

/**
 * Throttle a function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastExecuted = 0;
  
  return (...args: Parameters<F>): void => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted;
    
    if (timeSinceLastExecution >= waitFor) {
      lastExecuted = now;
      func(...args);
    } else if (timeout === null) {
      timeout = setTimeout(() => {
        timeout = null;
        lastExecuted = Date.now();
        func(...args);
      }, waitFor - timeSinceLastExecution);
    }
  };
};

export default {
  generateMessageId,
  truncateString,
  formatDate,
  isValidUrl,
  debounce,
  throttle
};
