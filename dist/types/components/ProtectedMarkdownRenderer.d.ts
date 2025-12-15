import React from 'react';
interface ProtectedMarkdownRendererProps {
    content: string;
    isUserMessage: boolean;
}
declare const ProtectedMarkdownRenderer: React.FC<ProtectedMarkdownRendererProps>;
export default ProtectedMarkdownRenderer;
