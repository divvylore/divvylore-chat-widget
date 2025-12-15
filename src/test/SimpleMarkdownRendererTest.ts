// Script to test SimpleMarkdownRenderer
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';

// Sample markdown content
const markdownTest = `
# Heading 1
## Heading 2
### Heading 3

**Bold text** is working

*Italic text* is also working

1. First item
2. Second item with **bold**
3. Third item

- Bullet one
- Bullet two
- **Bold bullet**

\`\`\`javascript
function test() {
  return 'code block';
}
\`\`\`

> This is a blockquote

For Shopify stores.

3. **No-Code/Low-Code** solutions are also available.
`;

// Function to run tests
function runTest() {
  // This would be used in a real test environment
  console.log('Would render:');
  console.log(markdownTest);
  console.log('\nExpected output: Properly formatted HTML with bold, lists, etc.');
}

runTest();

// Export this information for usage in the app
export const testMarkdownContent = markdownTest;
