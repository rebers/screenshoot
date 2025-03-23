import React from 'react';
import { AspectRatioOption } from '../types';

interface AspectRatioSelectorProps {
  options: AspectRatioOption[];
  value: string;
  onChange: (value: string) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <div className="mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Aspect Ratio
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${
              value === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector; 