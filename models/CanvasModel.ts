import { VirtualCanvas, ScreenshotSettings, AspectRatioOption, BackgroundPreset } from '../types';

/**
 * Creates a virtual canvas model from the application settings
 * This model uses relative coordinates and dimensions (0-1 range)
 * that can be rendered at any physical size while preserving proportions
 */
export function createCanvasModel(
  settings: ScreenshotSettings,
  backgroundPresets: BackgroundPreset[],
  imageDimensions: { width: number; height: number } | null,
  aspectRatioOptions: AspectRatioOption[],
  containerSize: { width: number, height: number }
): VirtualCanvas {
  // Find the selected aspect ratio
  const aspectOption = aspectRatioOptions.find(opt => opt.value === settings.aspectRatio);
  const aspectRatioValue = {
    width: aspectOption?.width || 16,
    height: aspectOption?.height || 9
  };
  
  // Normalize aspect ratio for calculations
  const aspectRatio = aspectRatioValue.width / aspectRatioValue.height;
  
  // Find background preset
  const backgroundPreset = backgroundPresets.find(p => p.id === settings.backgroundPreset);
  
  // Normalize settings to 0-1 range for the virtual canvas
  // This allows us to render at any physical size later
  
  // For padding and inset, calculate relative to the smaller canvas dimension
  // This ensures consistent spacing regardless of aspect ratio
  const maxPaddingPct = 0.4; // Don't allow padding to exceed 40% of canvas dimension
  const maxInsetPct = 0.2;   // Don't allow inset to exceed 20% of canvas dimension
  
  // Normalize settings to 0-1 range (percentages)
  const normalizedPadding = Math.min(settings.padding / 100, maxPaddingPct);
  const normalizedInset = Math.min(settings.inset / 100, maxInsetPct);
  const normalizedBorderRadius = settings.borderRadius / 100;
  const normalizedShadow = settings.shadow / 100;
  
  // Create the virtual canvas model
  const model: VirtualCanvas = {
    aspectRatio: settings.aspectRatio,
    aspectRatioValue,
    background: {
      type: 'gradient',
      value: '', // CSS value will be computed during rendering
      className: backgroundPreset?.className || 'bg-gradient-to-br from-blue-500 to-purple-600',
      effects: {
        noise: 0.1 // 10% opacity for noise effect
      }
    },
    content: {
      padding: normalizedPadding,
      image: imageDimensions ? {
        naturalWidth: imageDimensions.width,
        naturalHeight: imageDimensions.height,
        position: { x: 0.5, y: 0.5 }, // centered
        scale: 1, // Will be calculated below
        effects: {
          shadow: {
            offsetX: normalizedShadow * 0.5,
            offsetY: normalizedShadow * 1.5,
            blur: normalizedShadow * 2.5,
            color: 'rgba(0,0,0,0.35)'
          },
          borderRadius: normalizedBorderRadius,
          inset: {
            size: normalizedInset,
            color: settings.insetColor
          }
        }
      } : null
    }
  };
  
  // Calculate the image scale if we have both image dimensions and a container
  if (imageDimensions && containerSize.width > 0 && containerSize.height > 0) {
    // First, calculate the available space after padding and inset in the virtual space
    const availableWidth = 1 - (model.content.padding * 2) - 
      (model.content.image?.effects.inset?.size || 0) * 2;
    const availableHeight = 1 - (model.content.padding * 2) - 
      (model.content.image?.effects.inset?.size || 0) * 2;
    
    // Determine available space aspect ratio
    const availableSpaceRatio = availableWidth / availableHeight * aspectRatio;
    
    // Calculate image aspect ratio
    const imageRatio = imageDimensions.width / imageDimensions.height;
    
    // Scale calculation depends on which dimension is more constraining
    if (model.content.image) {
      if (imageRatio > availableSpaceRatio) {
        // Image is relatively wider, constrain by width
        model.content.image.scale = availableWidth;
      } else {
        // Image is relatively taller, constrain by height
        model.content.image.scale = availableHeight * (imageRatio / aspectRatio);
      }
      
      // Apply safety factor to ensure the image fits completely
      model.content.image.scale *= 0.95;
    }
  }
  
  return model;
}

/**
 * Converts a virtual canvas model to physical styles for DOM rendering
 * @param model The virtual canvas model with normalized coordinates
 * @param containerSize Physical pixel dimensions of the container
 * @returns CSS styles for all canvas elements
 */
export function computeCanvasStyles(
  model: VirtualCanvas,
  containerSize: { width: number, height: number }
): Record<string, React.CSSProperties> {
  const { width: containerWidth, height: containerHeight } = containerSize;
  
  // Calculate actual canvas dimensions based on aspect ratio and container
  const canvasAspectRatio = model.aspectRatioValue.width / model.aspectRatioValue.height;
  const containerRatio = containerWidth / containerHeight;
  
  let canvasWidth, canvasHeight;
  
  if (containerRatio > canvasAspectRatio) {
    // Container is wider than canvas aspect ratio, constrain by height
    canvasHeight = containerHeight;
    canvasWidth = containerHeight * canvasAspectRatio;
  } else {
    // Container is taller than canvas aspect ratio, constrain by width
    canvasWidth = containerWidth;
    canvasHeight = containerWidth / canvasAspectRatio;
  }
  
  // Base container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    margin: '0 auto', // Center horizontally
  };
  
  // Inner container style
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
  
  // Calculate physical padding in pixels
  const minCanvasDimension = Math.min(canvasWidth, canvasHeight);
  const paddingPx = minCanvasDimension * model.content.padding;
  
  // Padding container style
  const paddingContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${paddingPx}px`,
  };
  
  // Content container style
  const contentContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'visible',
  };
  
  // Default placeholder and empty styles
  const placeholderStyle: React.CSSProperties = {
    width: '200px',
    height: '200px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // If we don't have an image, just return the basic styles
  if (!model.content.image) {
    return {
      container: containerStyle,
      innerContainer: innerContainerStyle,
      paddingContainer: paddingContainerStyle,
      contentContainer: contentContainerStyle,
      placeholder: placeholderStyle,
      shadowWrapper: {},
      insetWrapper: {},
      imageContainer: {},
      image: {},
    };
  }
  
  // With an image, calculate all the detailed styles
  
  // Determine the actual image dimensions after scaling
  const imageScale = model.content.image.scale;
  const imageNaturalWidth = model.content.image.naturalWidth;
  const imageNaturalHeight = model.content.image.naturalHeight;
  
  // Convert the scale to physical pixels based on the canvas size
  const scaleFactor = Math.min(canvasWidth, canvasHeight);
  const scaledImageWidth = imageNaturalWidth * imageScale * scaleFactor;
  const scaledImageHeight = imageNaturalHeight * imageScale * scaleFactor;
  
  // Calculate shadow dimensions
  const shadowOffsetX = model.content.image.effects.shadow?.offsetX || 0;
  const shadowOffsetY = model.content.image.effects.shadow?.offsetY || 0;
  const shadowBlur = model.content.image.effects.shadow?.blur || 0;
  const shadowColor = model.content.image.effects.shadow?.color || 'rgba(0,0,0,0.35)';
  
  const shadowOffsetXPx = shadowOffsetX * scaledImageWidth;
  const shadowOffsetYPx = shadowOffsetY * scaledImageHeight;
  const shadowBlurPx = shadowBlur * Math.min(scaledImageWidth, scaledImageHeight);
  
  // Shadow wrapper style
  const shadowWrapperStyle: React.CSSProperties = {
    boxShadow: `${shadowOffsetXPx}px ${shadowOffsetYPx}px ${shadowBlurPx}px ${shadowColor}`,
    borderRadius: model.content.image.effects.borderRadius 
      ? `${model.content.image.effects.borderRadius * Math.min(scaledImageWidth, scaledImageHeight)}px` 
      : '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Calculate inset dimensions
  const insetSize = model.content.image.effects.inset?.size || 0;
  const insetPx = insetSize * minCanvasDimension;
  
  // Inset wrapper style
  const insetWrapperStyle: React.CSSProperties = {
    backgroundColor: model.content.image.effects.inset?.color || '#FFFFFF',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${insetPx}px`,
  };
  
  // Image container style
  const imageContainerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
  
  // Image style
  const imageStyle: React.CSSProperties = {
    display: 'block',
    width: `${scaledImageWidth}px`,
    height: `${scaledImageHeight}px`,
  };
  
  // Adjust placeholder style with shadow and border radius
  placeholderStyle.borderRadius = shadowWrapperStyle.borderRadius;
  placeholderStyle.boxShadow = shadowWrapperStyle.boxShadow;
  
  return {
    container: containerStyle,
    innerContainer: innerContainerStyle,
    paddingContainer: paddingContainerStyle,
    contentContainer: contentContainerStyle,
    shadowWrapper: shadowWrapperStyle,
    insetWrapper: insetWrapperStyle,
    imageContainer: imageContainerStyle,
    image: imageStyle,
    placeholder: placeholderStyle,
  };
}

/**
 * Renders a VirtualCanvas model to a canvas element with exact dimensions
 * This is used for export to ensure consistent sizing regardless of UI display
 */
export async function renderToCanvas(
  model: VirtualCanvas,
  screenshotSrc: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a canvas with the exact target dimensions
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      // Clear the canvas with a transparent background
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // Draw background gradient - we'll need to simulate the TailwindCSS gradient
      // For now, let's use a simple blue-to-purple gradient as default
      let backgroundGradient;
      const className = model.background.className;
      
      if (className.includes('from-blue-500') && className.includes('to-purple-600')) {
        backgroundGradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
        backgroundGradient.addColorStop(0, '#3b82f6'); // blue-500
        backgroundGradient.addColorStop(1, '#9333ea'); // purple-600
      } else if (className.includes('from-green-400') && className.includes('to-blue-500')) {
        backgroundGradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
        backgroundGradient.addColorStop(0, '#4ade80'); // green-400
        backgroundGradient.addColorStop(1, '#3b82f6'); // blue-500
      } else if (className.includes('from-orange-400') && className.includes('to-pink-500')) {
        backgroundGradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
        backgroundGradient.addColorStop(0, '#fb923c'); // orange-400
        backgroundGradient.addColorStop(1, '#ec4899'); // pink-500
      } else {
        // Default fallback
        backgroundGradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
        backgroundGradient.addColorStop(0, '#3b82f6'); // blue-500
        backgroundGradient.addColorStop(1, '#9333ea'); // purple-600
      }
      
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // If we have a noise effect, add noise texture
      if (model.background.effects.noise && model.background.effects.noise > 0) {
        // For simplicity, we'll just add a subtle noise pattern
        // A more advanced approach would use a real noise texture
        const noiseOpacity = model.background.effects.noise;
        
        // Add some pixel noise
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Add random noise to each pixel
          const noise = (Math.random() - 0.5) * 25 * noiseOpacity;
          data[i] = Math.min(255, Math.max(0, data[i] + noise)); // R
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
          // Don't modify alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      // If no image, we're done with the background
      if (!model.content.image) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Calculate padding and inset in pixels
        const minDimension = Math.min(targetWidth, targetHeight);
        const paddingPx = minDimension * model.content.padding;
        const insetPx = minDimension * (model.content.image?.effects.inset?.size || 0);
        
        // Calculate content area size after padding
        const contentAreaWidth = targetWidth - (paddingPx * 2);
        const contentAreaHeight = targetHeight - (paddingPx * 2);
        
        // Calculate image scale in pixels
        const imageScale = model.content.image!.scale;
        const naturalWidth = model.content.image!.naturalWidth;
        const naturalHeight = model.content.image!.naturalHeight;
        
        // Scale the image using the virtual model scale
        const scaledWidth = naturalWidth * imageScale * minDimension;
        const scaledHeight = naturalHeight * imageScale * minDimension;
        
        // Calculate positions to center the image
        const centerX = targetWidth / 2;
        const centerY = targetHeight / 2;
        
        // Calculate image position
        const imageX = centerX - (scaledWidth / 2);
        const imageY = centerY - (scaledHeight / 2);
        
        // Shadow settings
        const shadowEffects = model.content.image!.effects.shadow;
        if (shadowEffects) {
          ctx.shadowOffsetX = shadowEffects.offsetX * scaledWidth;
          ctx.shadowOffsetY = shadowEffects.offsetY * scaledHeight;
          ctx.shadowBlur = shadowEffects.blur * Math.min(scaledWidth, scaledHeight);
          ctx.shadowColor = shadowEffects.color;
        }
        
        // Calculate the border radius if present
        const borderRadius = model.content.image!.effects.borderRadius || 0;
        const borderRadiusPx = borderRadius * Math.min(scaledWidth, scaledHeight);
        
        // For inset, we need to draw a border around the image
        if (insetPx > 0) {
          // Save current context state
          ctx.save();
          
          // Clear shadow for drawing the inset background
          ctx.shadowColor = 'rgba(0,0,0,0)';
          
          // Draw inset background (with border radius if specified)
          const insetX = imageX - insetPx;
          const insetY = imageY - insetPx;
          const insetWidth = scaledWidth + (insetPx * 2);
          const insetHeight = scaledHeight + (insetPx * 2);
          
          if (borderRadiusPx > 0) {
            // Draw rounded rectangle for inset
            ctx.beginPath();
            ctx.moveTo(insetX + borderRadiusPx, insetY);
            ctx.lineTo(insetX + insetWidth - borderRadiusPx, insetY);
            ctx.arcTo(insetX + insetWidth, insetY, insetX + insetWidth, insetY + borderRadiusPx, borderRadiusPx);
            ctx.lineTo(insetX + insetWidth, insetY + insetHeight - borderRadiusPx);
            ctx.arcTo(insetX + insetWidth, insetY + insetHeight, insetX + insetWidth - borderRadiusPx, insetY + insetHeight, borderRadiusPx);
            ctx.lineTo(insetX + borderRadiusPx, insetY + insetHeight);
            ctx.arcTo(insetX, insetY + insetHeight, insetX, insetY + insetHeight - borderRadiusPx, borderRadiusPx);
            ctx.lineTo(insetX, insetY + borderRadiusPx);
            ctx.arcTo(insetX, insetY, insetX + borderRadiusPx, insetY, borderRadiusPx);
            ctx.closePath();
            
            // Fill with the inset color
            ctx.fillStyle = model.content.image!.effects.inset?.color || '#FFFFFF';
            ctx.fill();
          } else {
            // Simple rectangle for inset
            ctx.fillStyle = model.content.image!.effects.inset?.color || '#FFFFFF';
            ctx.fillRect(insetX, insetY, insetWidth, insetHeight);
          }
          
          // Restore context for drawing the image with shadow
          ctx.restore();
        }
        
        // Restore shadow settings for the image
        if (shadowEffects) {
          ctx.shadowOffsetX = shadowEffects.offsetX * scaledWidth;
          ctx.shadowOffsetY = shadowEffects.offsetY * scaledHeight;
          ctx.shadowBlur = shadowEffects.blur * Math.min(scaledWidth, scaledHeight);
          ctx.shadowColor = shadowEffects.color;
        }
        
        // Draw the image (with border radius if specified)
        if (borderRadiusPx > 0) {
          // Save context for clipping
          ctx.save();
          
          // Create a clipping region with border radius
          ctx.beginPath();
          ctx.moveTo(imageX + borderRadiusPx, imageY);
          ctx.lineTo(imageX + scaledWidth - borderRadiusPx, imageY);
          ctx.arcTo(imageX + scaledWidth, imageY, imageX + scaledWidth, imageY + borderRadiusPx, borderRadiusPx);
          ctx.lineTo(imageX + scaledWidth, imageY + scaledHeight - borderRadiusPx);
          ctx.arcTo(imageX + scaledWidth, imageY + scaledHeight, imageX + scaledWidth - borderRadiusPx, imageY + scaledHeight, borderRadiusPx);
          ctx.lineTo(imageX + borderRadiusPx, imageY + scaledHeight);
          ctx.arcTo(imageX, imageY + scaledHeight, imageX, imageY + scaledHeight - borderRadiusPx, borderRadiusPx);
          ctx.lineTo(imageX, imageY + borderRadiusPx);
          ctx.arcTo(imageX, imageY, imageX + borderRadiusPx, imageY, borderRadiusPx);
          ctx.closePath();
          ctx.clip();
          
          // Draw the image within the clipping region
          ctx.drawImage(img, imageX, imageY, scaledWidth, scaledHeight);
          
          // Restore context
          ctx.restore();
        } else {
          // Just draw the image directly
          ctx.drawImage(img, imageX, imageY, scaledWidth, scaledHeight);
        }
        
        // Convert to data URL and resolve
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load the image'));
      };
      
      img.src = screenshotSrc;
      
    } catch (error) {
      reject(error);
    }
  });
}
