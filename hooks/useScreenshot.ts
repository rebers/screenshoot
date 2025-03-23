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
        // Find the export container
        const backgroundElement = elementRef.current.querySelector('.export-container');
        
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
          style: {
            borderRadius: '0', // Ensure exported image has no rounded corners
          },
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
        // Find the export container
        const backgroundElement = elementRef.current.querySelector('.export-container');
        
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
          style: {
            borderRadius: '0', // Ensure exported image has no rounded corners
          },
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