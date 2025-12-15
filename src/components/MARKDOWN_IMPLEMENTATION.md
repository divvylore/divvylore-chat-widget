# Adding Markdown Support to DivvyChat

This guide explains how to fully implement Markdown rendering in the chat widget.

## Required Packages

The chat widget is set up with placeholder Markdown rendering which needs to be replaced with full implementation. You'll need to install the following packages:

```bash
npm install react-markdown rehype-raw remark-gfm rehype-highlight highlight.js --save
```

## Implementation Steps

1. Install the packages listed above
2. Replace the placeholder MarkdownRenderer implementation in `src/components/MarkdownRenderer.tsx` with the full implementation (commented at the bottom of the file)
3. Import the highlight.js CSS in your main application

## Features

The implemented Markdown support includes:

- Headers (# Heading 1, ## Heading 2, etc.)
- Bold and italic text (**bold**, *italic*)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Tables
- Links
- Images
- Horizontal rules

## Testing

To test the Markdown renderer, the DivvyChatServiceDemo component provides responses with Markdown formatting. Try asking questions that contain keywords like:
- "code" or "React component" to get code examples
- "list" or "features" to get formatted lists and tables

## Customization

You can customize the Markdown styling by modifying:
- The CSS in `src/components/markdown-styles.css`
- The component rendering options in the MarkdownRenderer component

## Examples

Here are example messages you can try:

1. "Show me a React component example"
2. "List the key features of a good API"
3. "What are the best practices for React?"
4. "Can you create a comparison table for databases?"
