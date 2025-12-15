# Textarea Auto-resize Behavior Updates

## Fixed Issues

1. **Height Change on Every Keystroke**
   - Previously, the textarea height was recalculated on every character input
   - This caused distracting height changes even when typing on a single line
   - Fixed by only adjusting height when lines are added or removed

2. **Maximum Height Limit**
   - Changed maximum height from arbitrary 150px to exactly 5 lines (116px)
   - Calculation: 5 lines × 20px line height + 16px padding = 116px

3. **Textarea Not Resizing Properly**
   - Fixed issues with the textarea not consistently expanding with content
   - Improved scroll height calculation for accurate line detection
   - Enhanced Shift+Enter handling for better multiline input

## Implementation Details

### Key Changes

1. **Improved Line-Based Height Adjustment**
   - Height now only changes when number of lines changes (from 1 to 2, 2 to 3, etc.)
   - Uses line breaks (`\n`) to detect actual line changes
   - Prevents height adjustments during normal typing on a single line

2. **Enhanced Effect-Based Resize Logic**
   - Completely revamped resize logic for better reliability
   - Temporarily sets height to 0px before measuring scroll height for accuracy
   - Includes scroll height recalculation for proper line measurement

3. **Optimized Input Handler**
   - Added special handling for Shift+Enter to immediately adjust height
   - Uses requestAnimationFrame for smooth visual updates
   - Better handling of visual feedback for multiline input

4. **Robust Reset Function**
   - Completely redesigned resetTextareaHeight function
   - Proper handling of overflow and scroll resets
   - More reliable reset after sending messages

### Technical Implementation

```tsx
// Enhanced textarea reset function
const resetTextareaHeight = () => {
  if (inputRef.current) {
    // First, store the original overflow
    const originalOverflow = inputRef.current.style.overflow;
    
    // Reset height and hide overflow temporarily
    inputRef.current.style.overflow = 'hidden';
    inputRef.current.style.height = '0px'; // Reset to 0 first for accuracy
    
    // Set to single line height (important: do this after resetting to 0)
    const singleLineHeight = '36px';
    inputRef.current.style.height = singleLineHeight;
    
    // Restore original overflow after a small delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.overflow = originalOverflow;
      }
    }, 20);
  }
};

// Improved line tracking and height adjustment
useEffect(() => {
  if (!inputRef.current) return;
  
  // Reset to get accurate scrollHeight
  inputRef.current.style.height = '0px';
  
  // Count line breaks to determine line count
  const lineCount = (input.match(/\n/g) || []).length + 1;
  const singleLineHeight = 36; // Base height for single line in px
  const lineHeight = 20; // Height per line in px
  const padding = 16; // Total padding in px
  const maxLines = 5;
  
  // Calculate new height based on content
  let newHeight;
  if (lineCount <= 1) {
    newHeight = singleLineHeight;
  } else {
    // Multiple lines: calculate based on content and max lines
    const maxHeight = (lineHeight * maxLines) + padding;
    const contentHeight = Math.min(inputRef.current.scrollHeight, maxHeight);
    newHeight = Math.max(contentHeight, singleLineHeight);
  }
  
  // Apply the new height
  inputRef.current.style.height = `${newHeight}px`;
}, [input]);
```

## Testing Instructions

Please test the following scenarios:

1. **Single Line Typing**
   - Type a long message in a single line
   - Verify the height remains constant

2. **Multi-Line Input**
   - Press Shift+Enter to add line breaks
   - Verify height increases only when lines are added
   - Check that it stops expanding after 5 lines

3. **Send and Reset**
   - Type a multi-line message
   - Send it
   - Verify textarea returns to single-line height

4. **Copy-Paste Testing**
   - Copy multi-line text and paste it
   - Verify height adjusts correctly based on line count
   - Check that it doesn't exceed 5 lines in height
