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