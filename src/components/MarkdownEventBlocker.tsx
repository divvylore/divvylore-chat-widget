import React from 'react';

// Create a wrapper component that prevents event propagation for markdown content
export function createMarkdownEventBlocker(WrappedComponent: React.ComponentType<any>) {
  return function MarkdownEventBlocker(props: any) {
    const handleEvent = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      // Only prevent default for events that aren't links
      if (!(e.target as HTMLElement).closest('a')) {
        e.preventDefault();
      }
    };
    
    return (
      <div 
        className="prevent-minimize-wrapper"
        onClick={handleEvent}
        onMouseDown={handleEvent}
        onTouchStart={handleEvent}
        style={{ width: '100%' }}
      >
        <WrappedComponent {...props} />
      </div>
    );
  };
}
