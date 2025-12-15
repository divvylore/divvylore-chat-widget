import React from 'react';
import './markdown-styles.css';
interface SimpleMarkdownRendererProps {
    content: string;
    isUserMessage: boolean;
}
declare const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps>;
export default SimpleMarkdownRenderer;
