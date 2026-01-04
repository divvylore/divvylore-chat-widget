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

// Media item type for gallery
interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

// External link icon component
const ExternalLinkIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      marginLeft: '4px',
      verticalAlign: 'middle',
      display: 'inline-block',
      flexShrink: 0
    }}
  >
    <path
      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Play icon for video thumbnails
const PlayIcon: React.FC = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    }}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Helper to detect if URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('image') ||
         lowerUrl.includes('/img/') ||
         lowerUrl.includes('/images/');
};

// Helper to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         videoHosts.some(host => lowerUrl.includes(host));
};

// Helper to get YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get YouTube thumbnail (high quality)
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Extract media items from markdown content
const extractMediaFromContent = (content: string): { cleanContent: string; mediaItems: MediaItem[] } => {
  const mediaItems: MediaItem[] = [];
  let cleanContent = content;
  
  // Extract markdown images: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    mediaItems.push({
      type: 'image',
      src: match[2],
      alt: match[1] || undefined
    });
  }
  // Remove image markdown from content
  cleanContent = cleanContent.replace(imageRegex, '');
  
  // Extract video links (YouTube, Vimeo, etc.) that are standalone
  const videoLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^)]*(?:youtube\.com|youtu\.be|vimeo\.com)[^)]*)\)/g;
  while ((match = videoLinkRegex.exec(content)) !== null) {
    if (!mediaItems.some(m => m.src === match[2])) {
      mediaItems.push({
        type: 'video',
        src: match[2],
        alt: match[1] || undefined
      });
      // Remove this video link from content - it will be in gallery
      cleanContent = cleanContent.replace(match[0], '');
    }
  }
  
  // Remove Media: section header if present
  cleanContent = cleanContent.replace(/\n*Media:\s*\n*/gi, '\n');
  
  // Clean up extra whitespace and empty lines
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim();
  
  return { cleanContent, mediaItems };
};

// Professional Media Gallery Component
const MediaGallery: React.FC<{ items: MediaItem[] }> = ({ items }) => {
  if (items.length === 0) return null;
  
  // Separate images and videos
  const images = items.filter(item => item.type === 'image');
  const videos = items.filter(item => item.type === 'video');

  // Don't render if no media
  if (images.length === 0 && videos.length === 0) return null;

  return (
    <div className="media-gallery-container">
      {/* Images Grid */}
      {images.length > 0 && (
        <div className={`media-gallery-grid media-grid-${Math.min(images.length, 4)}`}>
          {images.slice(0, 4).map((item, index) => (
            <ImageGalleryItem 
              key={`img-${index}`} 
              item={item}
              showOverlay={index === 3 && images.length > 4}
              remainingCount={images.length - 4}
            />
          ))}
        </div>
      )}
      
      {/* Videos as cards */}
      {videos.length > 0 && (
        <div className="media-gallery-videos">
          {videos.map((item, index) => (
            <VideoGalleryCard key={`vid-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

// Image item in gallery grid
const ImageGalleryItem: React.FC<{ 
  item: MediaItem; 
  showOverlay?: boolean;
  remainingCount?: number;
}> = ({ item, showOverlay, remainingCount }) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Don't render anything if image fails to load
  if (hasError) {
    return null;
  }

  return (
    <div className="media-gallery-item">
      {isLoading && (
        <div className="media-loading">
          <div className="loading-spinner" />
        </div>
      )}
      <a href={item.src} target="_blank" rel="noopener noreferrer">
        <img 
          src={item.src} 
          alt={item.alt || 'Image'}
          className="media-gallery-img"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </a>
      {showOverlay && remainingCount && remainingCount > 0 && (
        <div className="media-overlay">
          <span>+{remainingCount}</span>
        </div>
      )}
    </div>
  );
};

// Professional Video Card Component
const VideoGalleryCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const youtubeId = getYouTubeVideoId(item.src);
  const [imgError, setImgError] = React.useState(false);
  
  const thumbnailUrl = youtubeId ? getYouTubeThumbnail(youtubeId) : null;
  const videoTitle = item.alt || 'Watch video';

  return (
    <a 
      href={item.src} 
      target="_blank" 
      rel="noopener noreferrer"
      className="video-card"
    >
      <div className="video-card-thumbnail">
        {thumbnailUrl && !imgError ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={videoTitle}
              onError={() => setImgError(true)}
            />
            <div className="video-card-play">
              <PlayIcon />
            </div>
          </>
        ) : (
          <div className="video-card-placeholder">
            <PlayIcon />
          </div>
        )}
      </div>
      <div className="video-card-info">
        <span className="video-card-title">{videoTitle}</span>
        <span className="video-card-domain">
          {youtubeId ? 'youtube.com' : (() => {
            try {
              return new URL(item.src).hostname;
            } catch {
              return 'video';
            }
          })()}
        </span>
      </div>
    </a>
  );
};

// Enhanced Link Card Component
const LinkCard: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  // Extract text content from children
  const getText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getText).join('');
    if (React.isValidElement(node) && node.props.children) {
      return getText(node.props.children);
    }
    return '';
  };

  const linkText = getText(children);
  const displayText = linkText || href;

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="markdown-link-enhanced"
    >
      <span className="link-text">{displayText}</span>
      <ExternalLinkIcon />
    </a>
  );
};

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

  // Extract media items for gallery rendering
  const { cleanContent, mediaItems } = extractMediaFromContent(safeContent);

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
          // Enhanced link handling with external link icon
          a: ({ children, href }) => {
            if (!href) return <span>{children}</span>;
            
            // Skip rendering media links inline - they go to gallery
            // But keep regular links
            if (!isImageUrl(href) && !isVideoUrl(href)) {
              return <LinkCard href={href}>{children}</LinkCard>;
            }
            
            // For image/video links that weren't extracted, still show as link
            return <LinkCard href={href}>{children}</LinkCard>;
          },
          // Skip inline image rendering - images go to gallery
          img: () => null,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
      
      {/* Media Gallery at the end - Twitter style */}
      {mediaItems.length > 0 && (
        <MediaGallery items={mediaItems} />
      )}
    </div>
  );
};
export default SimpleMarkdownRenderer;
