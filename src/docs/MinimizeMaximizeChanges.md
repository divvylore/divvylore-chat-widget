# Chat Widget Fixes

This document outlines the changes made to fix issues with the minimize/maximize functionality in the chat widget.

## Changes Made

### 1. Fixed Minimize Button

```tsx
{/* Collapse/Minimize button */}
<button
  onClick={(e) => {
    // Stop propagation to prevent other handlers from capturing this
    e.stopPropagation();
    // Explicitly collapse the chat
    setIsCollapsed(true);
  }}
  title="Minimize chat"
  className="action-button minimize-chat-button"
  style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8H2" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
  </svg>
</button>
```

The key changes:
- Added the `minimize-chat-button` class to the button for better targeting
- Added explicit event stopping with `e.stopPropagation()`
- Modified the onClick handler to ensure it collapses the chat

### 2. Added Maximize Button

```tsx
{/* Maximize button - floats above the main chat button */}
<button
  className="maximize-button widget-fade-in"
  onClick={() => setIsCollapsed(false)}
  style={{
    position: 'absolute',
    top: '-15px',
    right: '50%',
    transform: 'translateX(50%)',
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: 'white',
    border: '1px solid #e1e4ea',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    zIndex: 10000
  }}
  title="Maximize chat"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#744da9">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
</button>
```

### 3. Added CSS for Maximize Button

Added styles to the widget-animations.css file:

```css
/* Maximize button hover effect */
.maximize-button {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.maximize-button:hover {
  transform: translateX(50%) scale(1.1);
  opacity: 1;
  box-shadow: 0 3px 10px rgba(116, 77, 169, 0.25);
}

.maximize-button:active {
  transform: translateX(50%) scale(0.95);
}
```

### 4. Updated Event Handlers in `useUIState`

The old `chatUtils` helpers were removed. The minimize/maximize guards now live alongside the rest of the UI logic in `src/components/DivvyloreChatWidget/hooks/useUIState.ts`, ensuring clicks on the action buttons do not bubble up and collapse the widget unexpectedly.

### 5. Added Special Event Listeners for Minimize/Maximize Buttons

```tsx
// Add special event listener for minimize/maximize buttons
const handleMinimizeMaximize = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('.minimize-chat-button')) {
    setIsCollapsed(true);
    e.stopPropagation();
  } else if (target.closest('.maximize-button')) {
    setIsCollapsed(false);
    e.stopPropagation();
  }
};

document.addEventListener('click', handleMinimizeMaximize, true);

// Clean up
return () => {
  document.removeEventListener('keydown', handleEscKey);
  document.removeEventListener('click', handleMinimizeMaximize, true);
  cleanupInterceptors();
};
```

## Testing

1. Open the chat widget
2. Test the minimize button - it should collapse the chat
3. Test the maximize button - it should expand the chat
4. Test clicking on messages - it should not minimize the chat
5. Test the ESC key - it should minimize the chat if no dialogs are open

## Additional Notes

- The minimize button now has a distinct class to help identify it for event handling
- Both minimize and maximize buttons have improved click handling with stopPropagation
- Added extra event listeners to ensure the buttons work regardless of other event interceptors
