import { useRef, useEffect, useCallback } from 'react';

interface UseTextareaResizeOptions {
  minHeight?: number;
  maxHeight?: number;
  lineHeight?: number;
  padding?: number;
  maxLines?: number;
}

/**
 * Custom hook to manage textarea auto-resizing
 */
export const useTextareaResize = (
  value: string,
  options: UseTextareaResizeOptions = {}
) => {
  const {
    minHeight = 36,
    maxHeight = 116,
    lineHeight = 20,
    padding = 16,
    maxLines = 5
  } = options;
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevLineCountRef = useRef<number>(1);
  const prevInputLengthRef = useRef<number>(0);
  const resizeAnimationFrame = useRef<number | null>(null);
  
  // Handle resize when value changes
  useEffect(() => {
    if (!textareaRef.current) return;
    
    // const textarea = textareaRef.current;
    const prevValue = prevInputLengthRef.current ? value.substring(0, prevInputLengthRef.current) : '';
    const newValue = value;
    
    // Get current and previous line counts
    const prevLineCount = prevLineCountRef.current || 1;
    const currentLineCount = (newValue.match(/\n/g) || []).length + 1;
    
    // Enhanced paste detection with more indicators for better accuracy
    const isPasteOperation = 
      // Significant length change indicates paste
      newValue.length > prevValue.length + 5 ||
      // Or sudden addition of multiple lines
      (currentLineCount > prevLineCount + 1) ||
      // Or content containing newlines suddenly appeared
      (newValue.includes('\n') && !prevValue.includes('\n')) ||
      // Or content with word boundaries that wasn't there before
      (newValue.split(' ').length > (prevValue || '').split(' ').length + 3) ||
      // Or if the length change is too large to be from normal typing
      (Math.abs(newValue.length - prevValue.length) > 20);
    
    // Determine if immediate resize is needed
    const shouldImmediatelyResize = 
      isPasteOperation || 
      currentLineCount !== prevLineCount ||
      Math.abs(newValue.length - prevValue.length) > 10 ||
      // Also resize immediately if input is empty (important for cleanup)
      newValue === '' ||
      // Or if last character is a line break (Shift+Enter was likely pressed)
      newValue.endsWith('\n');
      
    if (shouldImmediatelyResize) {
      // Cancel any pending animation frame to prevent conflicts
      if (resizeAnimationFrame.current) {
        cancelAnimationFrame(resizeAnimationFrame.current);
      }
      
      // Schedule height adjustment with animation frame for smooth rendering
      resizeAnimationFrame.current = requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        
        // Store scroll position for restoration if needed
        const scrollTop = textareaRef.current.scrollTop;
        
        // Reset height temporarily for accurate scrollHeight calculation
        textareaRef.current.style.height = '0px';
        
        // Force reflow to ensure the height reset is applied before measuring
        // const forceReflow = textareaRef.current.scrollHeight;
        
        // Calculate the scroll height with full content consideration
        const contentScrollHeight = textareaRef.current.scrollHeight;
        
        // Enhanced height calculation logic
        let newHeight;
        if (newValue === '') {
          // Empty content - always single line
          newHeight = minHeight;
        } else if (currentLineCount <= 1 && !newValue.includes('\n') && contentScrollHeight <= minHeight + padding) {
          // Single line content that fits in one line
          newHeight = minHeight;
        } else {
          // Multi-line or wrapped content - constrained between min and max
          newHeight = Math.min(contentScrollHeight, maxHeight);
          newHeight = Math.max(newHeight, minHeight);
        }
        
        // Apply the calculated height
        textareaRef.current.style.height = `${newHeight}px`;
        
        // Restore scroll position for content that exceeds max height
        if (newHeight === maxHeight && contentScrollHeight > maxHeight) {
          textareaRef.current.scrollTop = scrollTop;
        } else {
          // Start from top for content that fits
          textareaRef.current.scrollTop = 0;
        }
        
        // Update overflow state based on content height
        // Show scrollbar only when content exceeds max height
        if (contentScrollHeight > maxHeight) {
          textareaRef.current.style.overflow = 'auto';
        } else {
          textareaRef.current.style.overflow = 'hidden';
        }
        
        // Update our references
        prevLineCountRef.current = currentLineCount;
        prevInputLengthRef.current = newValue.length;
        
        // Clear the animation frame reference
        resizeAnimationFrame.current = null;
      });
    }
  }, [value, minHeight, maxHeight, lineHeight, padding, maxLines]);
  
  // Helper function for Shift+Enter case
  const handleShiftEnter = useCallback((textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    
    const originalBg = textarea.style.background;
    textarea.style.background = 'rgba(116, 77, 169, 0.04)';
    
    // Cancel any pending animation frame to prevent conflicts
    if (resizeAnimationFrame.current) {
      cancelAnimationFrame(resizeAnimationFrame.current);
    }
    
    // Force recalculation of height after new line is added
    resizeAnimationFrame.current = requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      
      // Calculate line count, including the new line being added
      const currentLines = (textarea.value.match(/\n/g) || []).length;
      const lineCount = currentLines + 2;
      
      // Store scroll position
      // const scrollTop = textarea.scrollTop;
      
      // Reset height to get accurate scrollHeight
      textarea.style.height = '0px';
      
      // Force browser to apply the reset before measuring
      // const forceReflow = textarea.scrollHeight;
      
      // Pre-estimate content height with the new line that will be added
      // Get current cursor position
      const cursorPos = textarea.selectionStart;
      const valueWithNewLine = 
        textarea.value.substring(0, cursorPos) + 
        '\n' + 
        textarea.value.substring(cursorPos);
      
      // Store current value
      const originalValue = textarea.value;
      
      // Temporarily set the value with new line to measure accurate height
      textarea.value = valueWithNewLine;
      
      // Get accurate height measurement with the new line
      const contentScrollHeight = textarea.scrollHeight;
      
      // Restore original value
      textarea.value = originalValue;
      
      // Calculate new height after the new line will be added
      let newHeight;
      if (lineCount <= maxLines) {
        // Content fits within max lines
        newHeight = Math.min(contentScrollHeight, maxHeight);
        newHeight = Math.max(newHeight, minHeight);
      } else {
        // Content will exceed max lines, use max height
        newHeight = maxHeight;
      }
      
      // Apply the calculated height
      textarea.style.height = `${newHeight}px`;
      
      // Update overflow state based on content height
      if (contentScrollHeight > maxHeight) {
        textarea.style.overflow = 'auto';
      } else {
        textarea.style.overflow = 'hidden';
      }
      
      // Update our tracking references for the next render
      prevLineCountRef.current = lineCount;
      
      // Restore or update scroll position as needed
      if (newHeight === maxHeight && contentScrollHeight > maxHeight) {
        // If we're at max height, adjust scroll position to show cursor
        // const approxLineHeight = lineHeight;
        const newScrollTop = Math.max(0, 
          Math.floor(cursorPos / textarea.value.length * contentScrollHeight) - maxHeight / 2);
        textarea.scrollTop = newScrollTop;
      }
      
      // Clear the animation frame reference
      resizeAnimationFrame.current = null;
    });
    
    // Restore background with a slight delay for visual feedback
    setTimeout(() => {
      if (textarea) {
        textarea.style.background = originalBg;
      }
    }, 150);
  }, [maxHeight, minHeight, maxLines, lineHeight]);
  
  return {
    textareaRef,
    prevLineCountRef,
    prevInputLengthRef,
    resizeAnimationFrame,
    handleShiftEnter
  };
};

export default useTextareaResize;
