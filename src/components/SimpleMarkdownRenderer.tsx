import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import './markdown-styles.css';

interface SimpleMarkdownRendererProps {
  content: string;
  isUserMessage: boolean;
}

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, isUserMessage }) => {
  // Ensure content is a string
  const safeContent = typeof content === 'string' ? content : String(content);
  
  // For user messages, just display the raw text exactly as entered
  if (isUserMessage) {
    return (
      <div style={{ textAlign: 'left' }}>
        {safeContent.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < safeContent.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    );
  }

  // For bot messages, use react-markdown with proper plugins
  return (
    <div className="markdown-content" style={{ textAlign: 'left' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom components for better styling
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-list">{children}</ol>,
          li: ({ children }) => <li className="markdown-list-item">{children}</li>,
          p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
          h1: ({ children }) => <h1 className="markdown-heading">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-heading">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-heading">{children}</h3>,
          code: ({ children, className }) => (
            <code className={className ? `${className} markdown-code` : 'markdown-code'}>
              {children}
            </code>
          ),
          pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
              {children}
            </a>
          ),
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};
export default SimpleMarkdownRenderer;
