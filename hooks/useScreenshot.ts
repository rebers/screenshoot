import { useState, useCallback } from 'react';
import { ScreenshotSettings, AspectRatioOption, BackgroundPreset } from '../types';
import { toPng } from 'html-to-image';

// Define aspect ratio options
export const aspectRatioOptions: AspectRatioOption[] = [
  // Standard ratios
  { label: '4:3', value: '4:3', width: 4, height: 3 },
  { label: '3:2', value: '3:2', width: 3, height: 2 },
  { label: '16:9', value: '16:9', width: 16, height: 9 },
  { label: '1:1', value: '1:1', width: 1, height: 1 },
  { label: '9:16', value: '9:16', width: 9, height: 16 },
  { label: '4:5', value: '4:5', width: 4, height: 5 },
  { label: '1.91:1', value: '1.91:1', width: 1.91, height: 1 },
  
  // Social media specific
  { label: 'YouTube Thumbnail', value: 'youtube-thumbnail', width: 1280, height: 720 },
  { label: 'Instagram Story', value: 'instagram-story', width: 1080, height: 1920 },
  { label: 'Instagram Square', value: 'instagram-square', width: 1080, height: 1080 },
  { label: 'Instagram Portrait', value: 'instagram-portrait', width: 1080, height: 1350 },
  { label: 'Instagram Landscape', value: 'instagram-landscape', width: 1080, height: 566 },
  { label: 'Twitter Post', value: 'twitter-post', width: 1600, height: 900 },
  { label: 'YouTube Community', value: 'youtube-community', width: 1080, height: 1080 },
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
  aspectRatio: '16:9',
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
        exactDimensions: !['4:3', '3:2', '16:9', '1:1', '9:16', '4:5', '1.91:1'].includes(aspectRatioValue)
      };
    }
    
    // Default fallback if not found (shouldn't happen)
    if (aspectRatioValue.includes(':')) {
      const [width, height] = aspectRatioValue.split(':').map(Number);
      return { width, height, exactDimensions: false };
    }
    
    return { width: 16, height: 9, exactDimensions: false };
  };

  // Export image to PNG
  const exportImage = useCallback(async (elementRef: React.RefObject<HTMLDivElement>) => {
    if (elementRef.current && screenshotSrc) {
      try {
        // Get the element with the background gradient
        const backgroundElement = elementRef.current.querySelector('div[class*="bg-gradient"]');
        
        if (!backgroundElement) {
          throw new Error('Could not find content element for export');
        }
        
        // Get the aspect ratio dimensions
        const { width: aspectWidth, height: aspectHeight, exactDimensions } = getAspectRatioDimensions(settings.aspectRatio);
        const aspectRatio = aspectWidth / aspectHeight;
        
        // Calculate export dimensions
        let exportWidth, exportHeight;
        
        if (exactDimensions) {
          // For social media posts, use the exact dimensions
          exportWidth = aspectWidth;
          exportHeight = aspectHeight;
        } else {
          // For standard ratios, use a high-quality base size
          const baseExportSize = 1920;
          
          if (aspectRatio >= 1) {
            // Landscape or square
            exportWidth = baseExportSize;
            exportHeight = Math.round(baseExportSize / aspectRatio);
          } else {
            // Portrait
            exportHeight = baseExportSize;
            exportWidth = Math.round(baseExportSize * aspectRatio);
          }
        }
        
        const dataUrl = await toPng(backgroundElement as HTMLElement, { 
          quality: 1,
          width: exportWidth,
          height: exportHeight,
          pixelRatio: 2,
          backgroundColor: 'transparent',
        });
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.download = 'beautified-screenshot.png';
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
        // Get the element with the background gradient
        const backgroundElement = elementRef.current.querySelector('div[class*="bg-gradient"]');
        
        if (!backgroundElement) {
          throw new Error('Could not find content element for export');
        }
        
        // Get the aspect ratio dimensions
        const { width: aspectWidth, height: aspectHeight, exactDimensions } = getAspectRatioDimensions(settings.aspectRatio);
        const aspectRatio = aspectWidth / aspectHeight;
        
        // Calculate export dimensions
        let exportWidth, exportHeight;
        
        if (exactDimensions) {
          // For social media posts, use the exact dimensions
          exportWidth = aspectWidth;
          exportHeight = aspectHeight;
        } else {
          // For standard ratios, use a slightly smaller size for clipboard
          const baseExportSize = 1200;
          
          if (aspectRatio >= 1) {
            // Landscape or square
            exportWidth = baseExportSize;
            exportHeight = Math.round(baseExportSize / aspectRatio);
          } else {
            // Portrait
            exportHeight = baseExportSize;
            exportWidth = Math.round(baseExportSize * aspectRatio);
          }
        }
        
        const dataUrl = await toPng(backgroundElement as HTMLElement, { 
          quality: 1,
          width: exportWidth,
          height: exportHeight,
          pixelRatio: 2,
          backgroundColor: 'transparent',
        });
        
        // Create a blob from data URL
        const blob = await fetch(dataUrl).then(res => res.blob());
        
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }, [screenshotSrc, settings.aspectRatio]);

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