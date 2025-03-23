import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center">
          <div 
            className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 mr-2" 
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {value}
          </span>
        </div>
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded cursor-pointer"
      />
    </div>
  );
};

export default ColorPicker; 