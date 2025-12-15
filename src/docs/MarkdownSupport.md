# Markdown Support in the Chat Widget

The DivvyloreChatWidget supports rendering markdown in bot messages. This allows for rich formatting of responses including:

## Supported Markdown Features

- **Headers**: Using `#` for H1, `##` for H2, etc.
- **Bold text**: Using `**text**`
- **Italic text**: Using `*text*`
- **Lists**: Both ordered (1. 2. 3.) and unordered (- * +)
- **Code blocks**: Using triple backticks with optional language specification
- **Inline code**: Using single backticks
- **Links**: Using `[text](url)`
- **Blockquotes**: Using `>` at the beginning of lines
- **Tables**: Using the GitHub-flavored markdown table syntax
- **Horizontal rules**: Using three or more dashes `---`

## Example Usage

```javascript
// Send a message with markdown formatting
sendMessage(`
# Welcome to our chat!

Here are some key features:
1. **Real-time responses**
2. *Customizable* interface
3. Code syntax highlighting:

\`\`\`javascript
function hello() {
  return "Hello, world!";
}
\`\`\`

Check out [our documentation](https://example.com) for more info.
`);
```

## Implementation Details

The widget uses the following libraries for markdown rendering:
- react-markdown: Main markdown parsing and rendering
- remark-gfm: GitHub Flavored Markdown support
- rehype-highlight: Syntax highlighting for code blocks
- rehype-raw: Support for raw HTML tags

## Styling

Markdown rendering is styled via the `markdown-styles.css` file. You can customize the appearance of markdown elements by modifying this file.

## Troubleshooting

If markdown isn't rendering correctly:

1. Ensure all dependencies are installed:
   ```
   npm install react-markdown rehype-raw remark-gfm rehype-highlight highlight.js
   ```

2. Check that the markdown syntax is valid

3. Verify that the message content is being passed correctly to the MarkdownRenderer component
