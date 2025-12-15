# Input Box and Bot Icon Margin Improvements

## Responsive Input Box

The input box has been enhanced to start as a single line and automatically adjust its height based on content when multi-line input is needed. This provides a cleaner interface by default while still supporting longer messages when necessary.

### Key Changes:

1. Changed from a fixed-height `<input>` element to an auto-resizing `<textarea>`
2. Starts as a single line for a clean, minimalist interface
3. Auto-expands only when line breaks are added (Shift+Enter)
4. Auto-adjusts height as the user adds more content
5. Resets back to single line after sending a message
6. Caps at a maximum height of 150px, after which scrolling is enabled
7. Maintains all existing styling and behavior

## Bot Icon Margin Improvements

The bot icon and message layout has been improved to provide consistent spacing and better support for brand icons.

### Key Changes:

1. Added left margin (16px) to the bot message container
2. Increased bot icon size slightly (24px × 24px)
3. Added additional right margin (8px) to the bot icon 
4. Adjusted message bubble alignment to work with the new icon spacing
5. Updated MessageBubbleWrapper to properly handle the new margins

## Testing

A new demo page has been created to test these improvements:

1. "Responsive Input Demo" - shows how the input box adjusts to different content lengths
2. Demonstrates the proper spacing for bot icons and messages

## Benefits

- **Clean Interface**: Default single-line input maintains a clean, minimalist design
- **Adaptive UX**: Input box adapts to user needs, expanding only when multiple lines are needed
- **Better UX**: Users can now see more of their message when typing longer content
- **Reduced Visual Noise**: Returns to single-line state after sending, maintaining a consistent interface
- **Brand Consistency**: Added space provides better support for different brand icons
- **Visual Hierarchy**: Improved spacing creates a clearer visual distinction between user and bot messages
- **Mobile Support**: Responsive input works well on both desktop and mobile devices
