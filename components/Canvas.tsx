import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ScreenshotSettings, BackgroundPreset } from '../types';
import ImageUploader from './ImageUploader';

interface CanvasProps {
  settings: ScreenshotSettings;
  backgroundPresets: BackgroundPreset[];
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
  // We don't actually need the image ref since we're not manipulating the image directly
  // It was originally used with the HTML img element but isn't needed for Next.js Image
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [contentScale, setContentScale] = useState(1);
  
  // Get current background class
  const currentBackground = backgroundPresets.find(
    (preset) => preset.id === settings.backgroundPreset
  )?.className || '';
  
  // Handle image loading to get dimensions
  useEffect(() => {
    if (screenshotSrc) {
      // Use the HTMLImageElement constructor instead of Image to avoid naming conflict with next/image
      const img = new window.Image();
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
    
    // Store reference to current element to avoid closure issues
    const currentContainer = containerRef.current;
    
    const updateSize = () => {
      if (currentContainer) {
        const rect = currentContainer.getBoundingClientRect();
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
    resizeObserver.observe(currentContainer);
    
    return () => {
      resizeObserver.unobserve(currentContainer);
    };
  }, []);

  // Calculate optimal content scale when dimensions or settings change
  useEffect(() => {
    if (!imageDimensions || !containerSize.width || !containerSize.height) {
      return;
    }

    // Calculate the scale factor for the content based on available space
    const calculateScaleFactor = () => {
      // Calculate the canvas size (which has a fixed aspect ratio)
      const { width: aspectWidth, height: aspectHeight } = getAspectRatio(settings.aspectRatio);
      const canvasAspectRatio = aspectWidth / aspectHeight;
      
      // Get the physical dimensions of the canvas based on the container
      const parentWidth = containerSize.width;
      const parentHeight = containerSize.height;
      const parentRatio = parentWidth / parentHeight;
      
      let canvasWidth, canvasHeight;
      if (parentRatio > canvasAspectRatio) {
        // Container is wider than canvas aspect ratio
        canvasHeight = parentHeight;
        canvasWidth = parentHeight * canvasAspectRatio;
      } else {
        // Container is taller than canvas aspect ratio
        canvasWidth = parentWidth;
        canvasHeight = parentWidth / canvasAspectRatio;
      }
      
      // Calculate available space after padding and inset
      const availableWidth = canvasWidth - (settings.padding * 2) - (settings.inset * 2);
      const availableHeight = canvasHeight - (settings.padding * 2) - (settings.inset * 2);
      
      // Safety check for non-positive dimensions
      if (availableWidth <= 0 || availableHeight <= 0) {
        return 0.01; // Small non-zero value
      }
      
      // Calculate image and available space aspect ratios
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const availableSpaceRatio = availableWidth / availableHeight;
      
      // Determine which dimension is the constraint
      let scale;
      if (imageAspectRatio > availableSpaceRatio) {
        // Image is relatively wider than available space, width is the constraint
        scale = availableWidth / imageDimensions.width;
      } else {
        // Image is relatively taller than available space, height is the constraint
        scale = availableHeight / imageDimensions.height;
      }
      
      // Apply a small safety factor
      return scale * 0.95;
    };
    
    setContentScale(calculateScaleFactor());
  }, [imageDimensions, containerSize, settings.padding, settings.inset, settings.aspectRatio]);
  
  // Get aspect ratio from the settings
  const getAspectRatio = (aspectRatioSetting: string) => {
    let aspectWidth = 16;
    let aspectHeight = 9;
    
    // Parse from standard aspect ratios
    if (aspectRatioSetting.includes(':')) {
      [aspectWidth, aspectHeight] = aspectRatioSetting.split(':').map(Number);
    } else {
      // Handle special formats
      switch (aspectRatioSetting) {
        case 'instagram-story':
          aspectWidth = 9;
          aspectHeight = 16;
          break;
        case 'instagram-square':
        case 'youtube-community':
          aspectWidth = 1;
          aspectHeight = 1;
          break;
        case 'instagram-portrait':
          aspectWidth = 4;
          aspectHeight = 5;
          break;
        case 'youtube-thumbnail':
        case 'twitter-post':
          aspectWidth = 16;
          aspectHeight = 9;
          break;
        default:
          // Default to 16:9
          aspectWidth = 16;
          aspectHeight = 9;
      }
    }
    
    return { width: aspectWidth, height: aspectHeight };
  };
  
  const { width: aspectWidth, height: aspectHeight } = getAspectRatio(settings.aspectRatio);
  
  // Calculate aspect ratio constraints for the canvas
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
  
  // Get constrained dimensions for the canvas
  const aspectConstrainedSize = calculateConstrainedSize();
  
  // Calculate styles based on aspect ratios and dimensions
  
  // Canvas container style - maintains the canvas aspect ratio
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
    boxSizing: 'border-box',
  };
  
  // Padding container - creates space between canvas edge and content
  const paddingContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${settings.padding}px`,
  };
  
  // Content container - holds the shadow and image
  const contentContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'visible',
  };
  
  // Shadow wrapper - applies shadow and border radius
  const shadowWrapperStyle: React.CSSProperties = {
    boxShadow: settings.shadow > 0 
      ? `${settings.shadow * 0.5}px ${settings.shadow * 1.5}px ${settings.shadow * 2.5}px rgba(0,0,0,0.35)` 
      : 'none',
    borderRadius: settings.borderRadius > 0 ? `${settings.borderRadius}px` : '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Inset wrapper - handles the inset border/padding around the image
  const insetWrapperStyle: React.CSSProperties = {
    backgroundColor: settings.insetColor,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${settings.inset}px`,
  };
  
  // Image container styles
  const imageContainerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
  
  // Calculate dimensions for scaled image
  const scaledImageWidth = imageDimensions ? imageDimensions.width * contentScale : 0;
  const scaledImageHeight = imageDimensions ? imageDimensions.height * contentScale : 0;
  
  // Image style
  const imageStyle: React.CSSProperties = {
    display: 'block',
    width: scaledImageWidth > 0 ? `${scaledImageWidth}px` : 'auto',
    height: scaledImageHeight > 0 ? `${scaledImageHeight}px` : 'auto',
  };
  
  // Style for the placeholder when no image is uploaded
  const placeholderStyle: React.CSSProperties = {
    minWidth: '300px',
    minHeight: '200px',
    width: '100%',
    height: '100%',
    maxWidth: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: settings.borderRadius > 0 ? `${settings.borderRadius}px` : '0',
    boxShadow: settings.shadow > 0 
      ? `${settings.shadow * 0.5}px ${settings.shadow * 1.5}px ${settings.shadow * 2.5}px rgba(0,0,0,0.35)` 
      : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        className={`${currentBackground} overflow-hidden export-container`}
        style={containerStyle}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-noise opacity-10" />
        
        {/* Content that will be exported */}
        <div className="relative z-10" style={innerContainerStyle}>
          <div style={paddingContainerStyle}>
            {screenshotSrc && imageDimensions ? (
              <div style={contentContainerStyle}>
                <div className="shadow-wrapper" style={shadowWrapperStyle}>
                  <div style={insetWrapperStyle}>
                    <div style={imageContainerStyle}>
                      <Image 
                        src={screenshotSrc}
                        alt="Uploaded screenshot"
                        style={imageStyle}
                        width={scaledImageWidth > 0 ? scaledImageWidth : undefined}
                        height={scaledImageHeight > 0 ? scaledImageHeight : undefined}
                        unoptimized // Using unoptimized for base64 images
                      />
                    </div>
                  </div>
                </div>
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
  );
};

export default Canvas;
