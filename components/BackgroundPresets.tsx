import React from 'react';

interface BackgroundPresetProps {
  id: number;
  name: string;
  className: string;
}

interface BackgroundPresetsProps {
  presets: BackgroundPresetProps[];
  selectedPreset: number;
  onChange: (id: number) => void;
}

const BackgroundPresets: React.FC<BackgroundPresetsProps> = ({ 
  presets, 
  selectedPreset, 
  onChange 
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onChange(preset.id)}
          className={`
            relative h-14 rounded-lg overflow-hidden transition-all
            ${selectedPreset === preset.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:opacity-90'}
          `}
        >
          <div className={`absolute inset-0 ${preset.className}`}>
            <div className="absolute inset-0 bg-noise opacity-10" />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
            {preset.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BackgroundPresets; 