# Minimize and Maximize Button Test Guide

This file provides a guide to test the fixed minimize button and the new maximize button feature.

## Testing the Minimize Button

1. Open the chat widget
2. Click the minimize button (horizontal line icon in the top-right corner of the widget)
3. Verify that the chat collapses to its minimized state (small circular chat button)
4. Verify that the maximize button appears above the chat button

## Testing the Maximize Button

1. When the chat is in its minimized state, look for the maximize button above the chat icon
2. Click on the maximize button
3. Verify that the chat expands to its full size
4. Verify that you can continue your conversation

## Testing Interaction with Message Content

1. Open the chat widget
2. Send a message and get a response
3. Click on the response message (where there is text)
4. Verify that the chat stays open (doesn't minimize)
5. Click the minimize button
6. Verify that the chat properly minimizes

## Expected Behavior

- The minimize button should always minimize the chat when clicked
- The maximize button should always maximize the chat when clicked
- Clicking on messages should not interfere with minimize/maximize functionality
- The UI should provide a smooth transition between states

This test ensures that the previous issue of the chat window getting minimized immediately after receiving a reply has been fixed, and that the new maximize button works correctly.
