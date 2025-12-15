import { useState, useCallback } from 'react';

interface UseUIStateOptions {
  startCollapsed?: boolean;
}

/**
 * Custom hook to manage UI state for the chat widget
 */
export const useUIState = (options: UseUIStateOptions = {}) => {
  const { startCollapsed = true } = options;
  
  // UI state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(startCollapsed);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  return {
    isCollapsed,
    isExpanded,
    setIsCollapsed,
    toggleExpanded
  };
};

export default useUIState;
