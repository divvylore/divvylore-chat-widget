import React from 'react';
import 'highlight.js/styles/github.css';
interface MarkdownRendererProps {
    content: string;
    isUserMessage: boolean;
}
declare const MarkdownRenderer: React.FC<MarkdownRendererProps>;
export default MarkdownRenderer;
