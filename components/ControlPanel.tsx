import React from 'react';
import Slider from './Slider';
import ColorPicker from './ColorPicker';
import BackgroundPresets from './BackgroundPresets';
import { ScreenshotSettings, AspectRatioOption, BackgroundPreset } from '../types';

interface ControlPanelProps {
  settings: ScreenshotSettings;
  aspectRatioOptions: AspectRatioOption[];
  backgroundPresets: BackgroundPreset[];
  onSettingsChange: (settings: Partial<ScreenshotSettings>) => void;
  onExportImage: () => void;
  onCopyToClipboard: () => void;
  canExport: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  aspectRatioOptions,
  backgroundPresets,
  onSettingsChange,
  onExportImage,
  onCopyToClipboard,
  canExport,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Customize</h2>
      
      {/* Layout Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Layout</h3>
        
        <div className="mb-4">
          <Slider
            label="Padding"
            min={0}
            max={100}
            value={settings.padding}
            onChange={(value) => onSettingsChange({ padding: value })}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Aspect Ratio
          </label>
          <div className="flex flex-col space-y-2">
            {aspectRatioOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  settings.aspectRatio === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSettingsChange({ aspectRatio: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Style Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Style</h3>
        
        <div className="mb-4">
          <Slider
            label="Inset"
            min={0}
            max={40}
            value={settings.inset}
            onChange={(value) => onSettingsChange({ inset: value })}
          />
        </div>
        
        {settings.inset > 0 && (
          <div className="mb-4">
            <ColorPicker
              label="Inset Color"
              value={settings.insetColor}
              onChange={(value) => onSettingsChange({ insetColor: value })}
            />
          </div>
        )}
        
        <div className="mb-4">
          <Slider
            label="Rounded Corners"
            min={0}
            max={40}
            value={settings.borderRadius}
            onChange={(value) => onSettingsChange({ borderRadius: value })}
          />
        </div>
        
        <div className="mb-4">
          <Slider
            label="Shadow"
            min={0}
            max={40}
            value={settings.shadow}
            onChange={(value) => onSettingsChange({ shadow: value })}
          />
        </div>
      </div>
      
      {/* Background Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Background</h3>
        <BackgroundPresets
          presets={backgroundPresets}
          selectedPreset={settings.backgroundPreset}
          onChange={(id) => onSettingsChange({ backgroundPreset: id })}
        />
      </div>
      
      {/* Export Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Export</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              canExport
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
            }`}
            onClick={onCopyToClipboard}
            disabled={!canExport}
          >
            Copy to Clipboard
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              canExport
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-blue-300 text-white cursor-not-allowed'
            }`}
            onClick={onExportImage}
            disabled={!canExport}
          >
            Save as PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
