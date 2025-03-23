import React, { useRef, useState, useEffect } from 'react';
import { ScreenshotSettings } from '../types';
import ImageUploader from './ImageUploader';

interface CanvasProps {
  settings: ScreenshotSettings;
  backgroundPresets: { id: number; name: string; className: string }[];
  screenshotSrc: string | null;
  onImageUpload: (file: File) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  settings,
  backgroundPresets,
  screenshotSrc,
  onImageUpload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get current background class
  const currentBackground = backgroundPresets.find(
    (preset) => preset.id === settings.backgroundPreset
  )?.className || '';
  
  // Handle image loading to get dimensions
  useEffect(() => {
    if (screenshotSrc) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = screenshotSrc;
    } else {
      setImageDimensions(null);
    }
  }, [screenshotSrc]);
  
  // Monitor container size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ 
          width: rect.width, 
          height: rect.height 
        });
      }
    };
    
    // Initial size
    updateSize();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Find the aspect ratio option
  let aspectWidth = 16;
  let aspectHeight = 9;
  
  // Parse from standard aspect ratios
  if (settings.aspectRatio.includes(':')) {
    [aspectWidth, aspectHeight] = settings.aspectRatio.split(':').map(Number);
  } else {
    // Handle special formats
    switch (settings.aspectRatio) {
      case 'youtube-thumbnail':
        aspectWidth = 1280;
        aspectHeight = 720;
        break;
      case 'instagram-story':
        aspectWidth = 1080;
        aspectHeight = 1920;
        break;
      case 'instagram-square':
        aspectWidth = 1080;
        aspectHeight = 1080;
        break;
      case 'instagram-portrait':
        aspectWidth = 1080;
        aspectHeight = 1350;
        break;
      case 'instagram-landscape':
        aspectWidth = 1080;
        aspectHeight = 566;
        break;
      case 'twitter-post':
        aspectWidth = 1600;
        aspectHeight = 900;
        break;
      case 'youtube-community':
        aspectWidth = 1080;
        aspectHeight = 1080;
        break;
      default:
        // Default to 16:9
        aspectWidth = 16;
        aspectHeight = 9;
    }
  }
  
  // Calculate aspect ratio constraints
  const calculateConstrainedSize = () => {
    const parentWidth = containerSize.width;
    const parentHeight = containerSize.height;
    
    if (parentWidth === 0 || parentHeight === 0) {
      return { width: '100%', height: '100%' };
    }
    
    const targetRatio = aspectWidth / aspectHeight;
    const parentRatio = parentWidth / parentHeight;
    
    // If parent is wider than target ratio, constrain by height
    // If parent is taller than target ratio, constrain by width
    if (parentRatio > targetRatio) {
      // Parent is wider, use height as constraint
      const width = parentHeight * targetRatio;
      return { 
        width: `${width}px`, 
        height: `${parentHeight}px` 
      };
    } else {
      // Parent is taller, use width as constraint
      const height = parentWidth / targetRatio;
      return { 
        width: `${parentWidth}px`, 
        height: `${height}px` 
      };
    }
  };
  
  // Get constrained dimensions
  const aspectConstrainedSize = calculateConstrainedSize();
  
  // Container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    ...aspectConstrainedSize,
    margin: '0 auto', // Center horizontally
  };
  
  // Inner container with content
  const innerContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Calculate effective space after padding
  const effectiveSpaceStyle: React.CSSProperties = {
    padding: `${settings.padding}px`,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Calculate the max allowed dimensions considering padding
  const maxWidth = containerSize.width - (settings.padding * 2);
  const maxHeight = aspectConstrainedSize.height !== '100%' 
    ? parseInt(aspectConstrainedSize.height as string) - (settings.padding * 2)
    : containerSize.height - (settings.padding * 2);
  
  // Calculate image container style to fill available space
  const imageContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
  };

  // Create the image style - using this approach, the image will define its own size
  const imageStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: `${maxWidth - (settings.inset * 2)}px`,
    maxHeight: `${maxHeight - (settings.inset * 2)}px`,
    width: 'auto',
    height: 'auto',
  };
  
  // Determine the style for the screenshot wrapper (the white container with shadow)
  // This will automatically size to its content (the image)
  const screenshotStyle: React.CSSProperties = {
    boxShadow: settings.shadow > 0 
      ? `${settings.shadow * 0.8}px ${settings.shadow * 1.2}px ${settings.shadow * 2}px rgba(0,0,0,0.3)` 
      : 'none',
    borderRadius: `${settings.borderRadius}px`,
    overflow: 'hidden',
    display: 'inline-flex', // This will make it size to content
    backgroundColor: '#fff',
    // No width/height set - will size to the image
  };
  
  if (settings.inset > 0) {
    screenshotStyle.border = `${settings.inset}px solid ${settings.insetColor}`;
    screenshotStyle.boxSizing = 'border-box';
  }
  
  // Style for the placeholder when no image is uploaded
  const placeholderStyle: React.CSSProperties = {
    ...screenshotStyle,
    minHeight: '200px',
    minWidth: '200px',
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-start justify-center"
    >
      <div
        className={`${currentBackground} rounded-2xl overflow-hidden`}
        style={containerStyle}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-noise opacity-10" />
        
        {/* Content that will be exported */}
        <div className="relative z-10" style={innerContainerStyle}>
          <div style={effectiveSpaceStyle}>
            <div style={imageContainerStyle}>
              {screenshotSrc ? (
                <div style={screenshotStyle}>
                  <img 
                    ref={imageRef}
                    src={screenshotSrc} 
                    alt="Uploaded screenshot" 
                    style={imageStyle}
                  />
                </div>
              ) : (
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center"
                  style={placeholderStyle}
                >
                  <ImageUploader onImageUpload={onImageUpload} hasImage={!!screenshotSrc} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas; 