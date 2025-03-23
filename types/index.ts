// Original settings structure (kept for backward compatibility)
export interface ScreenshotSettings {
  padding: number;
  inset: number;
  insetColor: string;
  borderRadius: number;
  shadow: number;
  backgroundPreset: number;
  aspectRatio: string;
}

export interface AspectRatioOption {
  label: string;
  value: string;
  width: number;
  height: number;
}

export interface BackgroundPreset {
  id: number;
  name: string;
  className: string;
}

// New virtual coordinate system types
export interface VirtualCoordinate {
  x: number;  // 0-1 range (percentage of parent width)
  y: number;  // 0-1 range (percentage of parent height)
}

export interface VirtualDimension {
  width: number;  // 0-1 range (percentage of parent width)
  height: number; // 0-1 range (percentage of parent height)
}

export interface VirtualShadow {
  offsetX: number;  // 0-1 range (percentage of element width)
  offsetY: number;  // 0-1 range (percentage of element height)
  blur: number;     // 0-1 range (percentage of element dimension)
  color: string;    // CSS color value
}

// The core model that defines the virtual canvas and all of its elements
export interface VirtualCanvas {
  aspectRatio: string;
  aspectRatioValue: {
    width: number;
    height: number;
  };
  background: {
    type: 'gradient' | 'solid';
    value: string;  // CSS gradient or color
    className: string; // TailwindCSS class name
    effects: {
      noise?: number;  // 0-1 opacity
    };
  };
  content: {
    padding: number;  // 0-1 range (percentage of canvas dimension)
    image: {
      naturalWidth: number;  // Original image width in pixels
      naturalHeight: number; // Original image height in pixels
      position: VirtualCoordinate;
      scale: number;  // Scale factor for the image (derived)
      effects: {
        shadow?: VirtualShadow;
        borderRadius?: number;  // 0-1 range (percentage of element dimension)
        inset?: {
          size: number;  // 0-1 range (percentage of canvas dimension)
          color: string; // CSS color value
        };
      };
    } | null;
  };
}

// For use in style calculation
export interface ComputedStyles {
  container: React.CSSProperties;
  innerContainer: React.CSSProperties;
  paddingContainer: React.CSSProperties;
  contentContainer: React.CSSProperties;
  shadowWrapper: React.CSSProperties;
  insetWrapper: React.CSSProperties;
  imageContainer: React.CSSProperties;
  image: React.CSSProperties;
  placeholder: React.CSSProperties;
}
