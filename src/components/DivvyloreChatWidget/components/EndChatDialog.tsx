import React from 'react';

interface EndChatDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const EndChatDialog: React.FC<EndChatDialogProps> = ({ onCancel, onConfirm }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div
        className="dialog-appear"
        style={{
          width: '85%',
          maxWidth: '320px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <div style={{ 
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#555"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>End current chat?</span>
        </div>
        
        <p style={{ 
          margin: '0 0 24px 0', 
          fontSize: '14px', 
          color: '#555',
          lineHeight: '1.5',
          paddingLeft: '52px'
        }}>
          This will save the current chat to your history and start a new conversation.
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '20px'
        }}>
          <button 
            onClick={onCancel}
            style={{ 
              border: '1px solid #e1e4ea', 
              background: 'white', 
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm}
            style={{ 
              background: '#744da9', 
              color: 'white', 
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndChatDialog;
