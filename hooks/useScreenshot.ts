import { useState, useCallback } from 'react';
import { ScreenshotSettings, AspectRatioOption, BackgroundPreset } from '../types';
import { toPng } from 'html-to-image';

// Define aspect ratio options
export const aspectRatioOptions: AspectRatioOption[] = [
  // Social media specific formats
  { label: 'X/Twitter Post (16:9)', value: 'twitter-post', width: 1600, height: 900 },
  { label: 'Instagram Story (9:16)', value: 'instagram-story', width: 1080, height: 1920 },
  { label: 'YouTube Thumbnail (16:9)', value: 'youtube-thumbnail', width: 1280, height: 720 },
  { label: 'Instagram Post (4:5)', value: 'instagram-portrait', width: 1080, height: 1350 },
  { label: 'YouTube Community Post (1:1)', value: 'youtube-community', width: 1080, height: 1080 },
];

// Define background presets
export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 1,
    name: 'Blue Gradient',
    className: 'bg-gradient-to-br from-blue-500 to-purple-600',
  },
  {
    id: 2,
    name: 'Green Gradient',
    className: 'bg-gradient-to-br from-green-400 to-blue-500',
  },
  {
    id: 3,
    name: 'Orange Gradient',
    className: 'bg-gradient-to-br from-orange-400 to-pink-500',
  },
];

// Default settings
const defaultSettings: ScreenshotSettings = {
  padding: 40,
  inset: 0,
  insetColor: '#FFFFFF',
  borderRadius: 8,
  shadow: 15,
  backgroundPreset: 1,
  aspectRatio: 'twitter-post',
};

export const useScreenshot = () => {
  // State for screenshot and settings
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [settings, setSettings] = useState<ScreenshotSettings>(defaultSettings);

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setScreenshotSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ScreenshotSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Get aspect ratio dimensions from the selected option
  const getAspectRatioDimensions = (aspectRatioValue: string) => {
    // Find the matching aspect ratio option
    const aspectOption = aspectRatioOptions.find(option => option.value === aspectRatioValue);
    
    if (aspectOption) {
      return { 
        width: aspectOption.width, 
        height: aspectOption.height,
        exactDimensions: true
      };
    }
    
    // Default fallback if not found (shouldn't happen)
    return { width: 16, height: 9, exactDimensions: false };
  };

  // Export image to PNG
  const exportImage = useCallback(async (elementRef: React.RefObject<HTMLDivElement>) => {
    if (elementRef.current && screenshotSrc) {
      try {
        // Find the export container (canvas with background)
        const exportContainer = elementRef.current.querySelector('.export-container');
        
        if (!exportContainer) {
          throw new Error('Could not find export container for export');
        }
        
        // Get the exact dimensions from the selected aspect ratio preset
        const { width: aspectWidth, height: aspectHeight } = getAspectRatioDimensions(settings.aspectRatio);
        
        // Capture the container at its natural dimensions first
        const containerDataUrl = await toPng(exportContainer as HTMLElement, {
          pixelRatio: 2,
          quality: 1
        });
        
        // Create a canvas with the exact dimensions from the aspect ratio
        const canvas = document.createElement('canvas');
        canvas.width = aspectWidth;
        canvas.height = aspectHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not create canvas context');
        }
        
        // Create a temporary image and load the captured screenshot
        const tempImage = new Image();
        
        // Wait for the image to load before drawing it to the canvas
        await new Promise<void>((resolve) => {
          tempImage.onload = () => {
            // Fill the entire canvas with the image
            // This ensures the image takes up the whole canvas space
            ctx.drawImage(tempImage, 0, 0, aspectWidth, aspectHeight);
            resolve();
          };
          tempImage.src = containerDataUrl;
        });
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.download = 'screenshoot.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting image:', error);
      }
    }
  }, [screenshotSrc, settings.aspectRatio]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (elementRef: React.RefObject<HTMLDivElement>) => {
    if (elementRef.current && screenshotSrc) {
      try {
        // Find the export container (canvas with background)
        const exportContainer = elementRef.current.querySelector('.export-container');
        
        if (!exportContainer) {
          throw new Error('Could not find export container for clipboard');
        }
        
        // Get the exact dimensions from the selected aspect ratio preset
        const { width: aspectWidth, height: aspectHeight } = getAspectRatioDimensions(settings.aspectRatio);
        
        // Capture the container at its natural dimensions first
        const containerDataUrl = await toPng(exportContainer as HTMLElement, {
          pixelRatio: 2,
          quality: 1
        });
        
        // Create a canvas with the exact dimensions from the aspect ratio
        const canvas = document.createElement('canvas');
        canvas.width = aspectWidth;
        canvas.height = aspectHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not create canvas context');
        }
        
        // Create a temporary image and load the captured screenshot
        const tempImage = new Image();
        
        // Wait for the image to load before drawing it to the canvas
        await new Promise<void>((resolve) => {
          tempImage.onload = () => {
            // Fill the entire canvas with the image
            // This ensures the image takes up the whole canvas space
            ctx.drawImage(tempImage, 0, 0, aspectWidth, aspectHeight);
            resolve();
          };
          tempImage.src = containerDataUrl;
        });
        
        try {
          // Primary method: Use the newer clipboard API directly with the canvas
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob from canvas'));
            }, 'image/png', 1.0);
          });
          
          // Try to use the modern Clipboard API first
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          
          // Show success via a temporary DOM element
          showCopySuccess();
          
          return; // Exit if the above succeeds
        } catch (e) {
          console.log('Modern clipboard API failed, trying fallback...', e);
          // Continue to fallback method if the above fails
        }
        
        // Fallback method: Create a temporary element and use execCommand
        try {
          // Create a temporary textarea for the clipboard operation
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          
          const div = document.createElement('div');
          div.contentEditable = 'true';
          div.style.position = 'absolute';
          div.style.left = '-99999px';
          
          // Append to DOM
          document.body.appendChild(div);
          div.appendChild(img);
          
          // Select the image
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(div);
          
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          // Execute copy command
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand copy failed');
          }
          
          // Clean up
          document.body.removeChild(div);
          
          // Show success message
          showCopySuccess();
        } catch (fallbackError) {
          console.error('Clipboard fallback failed:', fallbackError);
          showCopyError();
        }
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        showCopyError();
      }
    }
  }, [screenshotSrc, settings.aspectRatio]);
  
  // Helper functions for clipboard feedback
  const showCopySuccess = () => {
    const notification = document.createElement('div');
    notification.textContent = 'Copied to clipboard!';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #10B981;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
  };
  
  const showCopyError = () => {
    const notification = document.createElement('div');
    notification.textContent = 'Could not copy to clipboard. Try using the Save button instead.';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #EF4444;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  return {
    screenshotSrc,
    settings,
    handleImageUpload,
    updateSettings,
    exportImage,
    copyToClipboard,
    aspectRatioOptions,
    backgroundPresets,
  };
};
