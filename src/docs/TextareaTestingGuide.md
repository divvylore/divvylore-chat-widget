# Textarea Auto-resize Testing Guide

This guide provides step-by-step instructions to verify that the improved textarea auto-resize functionality is working correctly.

## Testing Environment

The `TextareaEdgeCaseTest.tsx` page is designed specifically for testing all edge cases of the textarea component. It includes:

1. Test instructions
2. Sample content for copy/paste operations
3. Various bot responses that cycle through different formats

## Test Cases

### 1. Single Line Behavior

**Steps:**
1. Open the "Textarea Edge Cases" test page
2. Type a simple message without line breaks
3. Observe the textarea height

**Expected:** 
- Textarea should maintain single line height (36px)
- Height should not fluctuate while typing

### 2. Multi-line Input with Shift+Enter

**Steps:**
1. Click in the textarea
2. Type some text
3. Press Shift+Enter
4. Type more text on the new line
5. Repeat a few times

**Expected:**
- Textarea should expand smoothly when new lines are added
- Maximum height should be capped at 5 lines (116px)
- If more than 5 lines are entered, scrollbar should appear

### 3. Reset Functionality

**Steps:**
1. Enter multiple lines of text using Shift+Enter
2. Send the message by pressing Enter
3. Observe textarea after sending

**Expected:**
- Textarea should immediately reset to single line height
- No flickering or temporary height changes should occur
- Focus should be maintained in the textarea

### 4. Copy-Paste Testing

**Steps:**
1. Copy the multi-line test content from the test page
2. Paste it into the textarea

**Expected:**
- Textarea should immediately adjust to the correct height
- For content with ≤5 lines: show all content without scrollbar
- For content with >5 lines: cap at 5 lines height and show scrollbar

### 5. Word Wrapping

**Steps:**
1. Type or paste very long words without spaces
2. Observe how the textarea handles word wrapping

**Expected:**
- Long words should wrap properly
- Height should adjust based on the wrapped content
- Maximum height should still be enforced

### 6. Rapid Input Testing

**Steps:**
1. Type quickly with occasional Shift+Enter
2. Delete content rapidly
3. Mix typing and deleting operations

**Expected:**
- No visual glitches or height calculation errors
- Smooth height transitions
- Consistent behavior regardless of input speed

### 7. Edge Case: Content Deletion

**Steps:**
1. Add multiple lines of text
2. Delete all content at once (select all + delete)

**Expected:**
- Textarea should immediately return to single line height
- No residual height from previous content

### 8. Edge Case: Focus Handling

**Steps:**
1. Enter multi-line content
2. Send the message
3. Verify textarea focus is retained
4. Click elsewhere, then back on the textarea

**Expected:**
- Focus behavior should be consistent
- Height should remain at single line when refocusing

## Visual Verification Checklist

For each test case, verify:

- [ ] Height transitions are smooth (not jumpy)
- [ ] No flickering occurs during resizing
- [ ] Text remains visible during all operations
- [ ] Scrollbar appears only when needed
- [ ] Reset to single line works consistently
- [ ] Focus behavior is natural and expected

## Browser Compatibility

Test the functionality in:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Responsive Testing

Test the behavior at different viewport widths:

- [ ] Desktop (1200px+)
- [ ] Tablet (768px-1199px)
- [ ] Mobile (320px-767px)

## Report Issues

If any issues are found during testing, document:

1. The specific test case that failed
2. Steps to reproduce
3. Expected vs. actual behavior
4. Browser/environment information
5. Screenshots or screen recordings if possible
