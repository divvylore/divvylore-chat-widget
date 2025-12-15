import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  isUserMessage: boolean;
}

// Component for rendering markdown in messages
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUserMessage }) => {
  // Ensure content is a string
  const safeContent = typeof content === 'string' ? content : String(content);
  
  // For user messages, just display the raw text exactly as entered
  if (isUserMessage) {
    return (
      <>
        {safeContent.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < safeContent.split('\n').length - 1 && <br />}
          </span>
        ))}
      </>
    );
  }
  // For bot messages, render with markdown
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }]]}
        skipHtml={false}        components={{
          // Open links in new tab
          a: ({ node, children, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              {...props}
              onClick={(e) => e.stopPropagation()}
              className="markdown-link"
            >
              {children}
            </a>
          ),          // Style code blocks
          code: ({ node, className, children, ...props }: {
            node?: any;
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || '');
            const inline = props.inline;
            
            if (inline) {
              return (
                <code
                  className={className}
                  {...props}
                  style={{
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    fontSize: '85%'
                  }}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <pre style={{ background: '#f6f8fa', borderRadius: '6px', padding: '16px', overflow: 'auto' }}>
                <code className={match ? `language-${match[1]}` : ''} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Ensure proper styling for other elements
          h1: ({ node, children, ...props }) => (
            <h1 {...props} style={{ fontSize: '20px', marginTop: '16px', marginBottom: '8px' }}>{children}</h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 {...props} style={{ fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>{children}</h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 {...props} style={{ fontSize: '16px', marginTop: '16px', marginBottom: '8px' }}>{children}</h3>
          ),
          p: ({ node, children, ...props }) => (
            <p {...props} style={{ marginTop: '0', marginBottom: '16px' }}>{children}</p>
          ),
          ul: ({ node, children, ...props }) => (
            <ul {...props} style={{ paddingLeft: '2em', marginTop: '0', marginBottom: '16px' }}>{children}</ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol {...props} style={{ paddingLeft: '2em', marginTop: '0', marginBottom: '16px' }}>{children}</ol>
          ),
          li: ({ node, children, ...props }) => (
            <li {...props} style={{ marginBottom: '0.25em' }}>{children}</li>
          ),
          blockquote: ({ node, children, ...props }) => (
            <blockquote {...props} style={{ 
              borderLeft: '0.25em solid #dfe2e5',
              padding: '0 1em',
              color: '#6a737d',
              margin: '0 0 16px 0' 
            }}>{children}</blockquote>
          )        }}
      >
        {typeof safeContent === 'string' ? safeContent : String(safeContent)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
