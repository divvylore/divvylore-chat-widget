import React from 'react';
import { logger } from '../../../utils/logger';

interface WelcomeScreenProps {
  welcomeMessage: string;
  popularQuestions: string[];
  onQuestionClick: (question: string) => void;
  botName: string;
  botAvatarIcon?: React.ReactNode;
  showBotAvatar: boolean;
  theme: any;
}

const DefaultBotAvatar: React.FC = () => (
  <div
    style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #744da9 0%, #9b69c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      flexShrink: 0
    }}
  >
    AI
  </div>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  welcomeMessage,
  popularQuestions,
  onQuestionClick,
  botName,
  botAvatarIcon,
  showBotAvatar
}) => {
  // Debug logging to see what we're receiving
  React.useEffect(() => {
    logger.ui('WelcomeScreen received:', {
      popularQuestions,
      popularQuestionsLength: popularQuestions?.length || 0,
      hasPopularQuestions: !!popularQuestions && popularQuestions.length > 0,
      welcomeMessage,
      botName
    });
  }, [popularQuestions, welcomeMessage, botName]);
  
  // Only show welcome message if no popular questions are available
  const showWelcomeMessage = !popularQuestions || popularQuestions.length === 0;
  
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        backgroundColor: '#ffffff',
        overflowY: 'auto'
      }}
    >
      {/* Welcome Message - only show if no popular questions */}
      {showWelcomeMessage && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '8px'
          }}>
            {showBotAvatar && (
              botAvatarIcon || <DefaultBotAvatar />
            )}
            <div style={{ flex: 1 }}>
              {showBotAvatar && (
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '4px',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                  textAlign: 'left'
                }}>
                  {botName}
                </div>
              )}
              <div
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#2c3e50',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  textAlign: 'left'
                }}
              >
                {welcomeMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Questions */}
      {popularQuestions && popularQuestions.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '12px',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'left'
          }}>
            Popular questions:
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {popularQuestions.slice(0, 5).map((question, index) => (
              <button
                key={index}
                onClick={() => onQuestionClick(question)}
                style={{
                  background: 'transparent',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: '#495057',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#744da9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(116, 77, 169, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#744da9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(116, 77, 169, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
