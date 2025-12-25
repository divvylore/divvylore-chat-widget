import React from 'react';

interface HeaderProps {
  headerTitle: string;
  showHeaderIcon: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleNewChat: () => void;
  handleEndChat: () => void;
  showChatHistory: boolean;
  toggleChatHistory: () => void;
  theme: any;
  clientIcon?: string | React.ReactNode; // Client-specific icon for customization (URL string or React element)
  multiSessionEnabled?: boolean; // Whether to show multi-session features
}

export const Header: React.FC<HeaderProps> = ({
  headerTitle,
  showHeaderIcon,
  setIsCollapsed,
  isExpanded,
  toggleExpanded,
  handleNewChat,
  handleEndChat,
  toggleChatHistory,
  theme,
  clientIcon,
  multiSessionEnabled = false
}) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e1e4ea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.background
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showHeaderIcon && (
          clientIcon ? (
            // Use client icon if available - handle both string (URL) and React element
            typeof clientIcon === 'string' ? (
              <img 
                src={clientIcon} 
                alt="Logo"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span style={{
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {clientIcon}
              </span>
            )
          ) : (
            <ChatIcon />
          )
        )}
        <span style={{ fontWeight: 600, fontSize: '16px', color: theme.textPrimary }}>
          {headerTitle}
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '4px' }}>
        <ActionButton
          onClick={handleNewChat}
          title="New chat"
        >
          <NewChatIcon />
        </ActionButton>
        
        {multiSessionEnabled && (
          <ActionButton
            onClick={toggleChatHistory}
            title="Chat history"
          >
            <HistoryIcon />
            {/* Badge could go here if there are chat history items */}
          </ActionButton>
        )}
        
        <ActionButton
          onClick={handleEndChat}
          title="End chat"
        >
          <EndChatIcon />
        </ActionButton>
        
        <ActionButton
          onClick={toggleExpanded}
          title={isExpanded ? "Shrink chat" : "Expand chat"}
          className="resize-chat-button"
        >
          {isExpanded ? <ShrinkIcon /> : <ExpandIcon />}
        </ActionButton>
        
        <ActionButton
          onClick={() => setIsCollapsed(true)}
          title="Minimize chat"
          className="minimize-chat-button"
        >
          <MinimizeIcon />
        </ActionButton>
      </div>
    </div>
  );
};

// Action Button Component
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, title, children, className }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      title={title}
      className={`action-button ${className || ''}`}
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
      {children}
    </button>
  );
};

// Icon Components
const ChatIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="#744da9" strokeWidth="2" fill="none"/>
  </svg>
);

const NewChatIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#666"/>
  </svg>
);

const HistoryIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3C8.03 3 4 7.03 4 12H1L5 16L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.25 15.52L17.02 14.24L13.5 12.15V8H12Z" fill="#666"/>
  </svg>
);

const EndChatIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#666"/>
  </svg>
);

const ExpandIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="#666"/>
  </svg>
);

const ShrinkIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="#666"/>
  </svg>
);

const MinimizeIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8H2" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default Header;
