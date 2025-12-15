/**
 * This script verifies the markdown support in the chat widget
 * 
 * We can run this with:
 * node src/test/verify-markdown.js
 */

// Example markdown strings to test
const testMarkdown = `
# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold text** and *italic text*.

- Bullet list item 1
- Bullet list item 2
- **Bold bullet** item

1. Numbered list item 1
2. Numbered list item 2
3. **Bold item** with formatting

\`\`\`javascript
function testCode() {
  return "This is a code block";
}
\`\`\`

> This is a blockquote

[Link text](https://example.com)

For Shopify stores.

3. **No-Code/Low-Code** solutions are also available.
`;

console.log("Testing markdown rendering");
console.log("-------------------------");
console.log("The following markdown should render correctly in the chat widget:");
console.log(testMarkdown);
console.log("-------------------------");
console.log("Check the rendering in your browser to make sure it looks correct.");
console.log("If you see raw markdown tags in the output, there's a problem with the rendering.");
