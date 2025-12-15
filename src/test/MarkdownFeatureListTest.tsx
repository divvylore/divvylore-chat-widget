// This script tests the SimpleMarkdownRenderer with the specific example from requirements
import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';

const exampleMarkdown = `
## Features

- Import a HTML file and watch it magically convert to Markdown
- Drag and drop images (requires your Dropbox account be linked)
- Import and save files from GitHub, Dropbox, Google Drive and One Drive
- Drag and drop markdown and HTML files into Dillinger
- Export documents as Markdown, HTML and PDF
`;

describe('SimpleMarkdownRenderer special cases', () => {
  test('renders feature list correctly', () => {
    render(
      <SimpleMarkdownRenderer 
        content={exampleMarkdown} 
        isUserMessage={false} 
      />
    );
    
    // Check for h2 heading
    expect(screen.getByText('Features')).toBeInTheDocument();
    
    // Check for list items
    expect(screen.getByText('Import a HTML file and watch it magically convert to Markdown')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop images (requires your Dropbox account be linked)')).toBeInTheDocument();
    expect(screen.getByText('Import and save files from GitHub, Dropbox, Google Drive and One Drive')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop markdown and HTML files into Dillinger')).toBeInTheDocument();
    expect(screen.getByText('Export documents as Markdown, HTML and PDF')).toBeInTheDocument();
    
    // Expect ul element to be present (contains li elements)
    const ulElements = document.querySelectorAll('ul');
    expect(ulElements.length).toBeGreaterThan(0);
  });
});
