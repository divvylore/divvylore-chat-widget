import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import SimpleMarkdownRenderer from './SimpleMarkdownRenderer';

// This component attempts to use the ReactMarkdown-based renderer first,
// and falls back to the SimpleMarkdownRenderer if there's any issue
interface ProtectedMarkdownRendererProps {
  content: string;
  isUserMessage: boolean;
}

const ProtectedMarkdownRenderer: React.FC<ProtectedMarkdownRendererProps> = ({ content, isUserMessage }) => {
  // Ensure content is a string
  const safeContent = typeof content === 'string' ? content : String(content);
  
  try {
    // Try using the React Markdown renderer first
    return <MarkdownRenderer content={safeContent} isUserMessage={isUserMessage} />;
  } catch (error) {
    console.warn("React Markdown renderer failed, falling back to SimpleMarkdownRenderer", error);
    // If that fails, fall back to our custom SimpleMarkdownRenderer
    return <SimpleMarkdownRenderer content={safeContent} isUserMessage={isUserMessage} />;
  }
};

export default ProtectedMarkdownRenderer;
