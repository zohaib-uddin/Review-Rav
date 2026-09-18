import { useState } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - 100);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + 100);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Min</p>
          <p className="text-sm font-bold">Rs. {localValue[0].toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Max</p>
          <p className="text-sm font-bold">Rs. {localValue[1].toLocaleString()}</p>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-gray-200 rounded-full">
        {/* Active Range */}
        <div
          className="absolute h-full bg-black rounded-full transition-all"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        
        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none"
          style={{
            zIndex: localValue[0] === localValue[1] ? 5 : 3,
          }}
        />
        
        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none"
          style={{
            zIndex: 4,
          }}
        />
      </div>

      {/* Input Fields */}
      <div className="flex gap-3">
        <input
          type="number"
          value={localValue[0]}
          onChange={handleMinChange}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          min={min}
          max={localValue[1]}
        />
        <span className="text-gray-400 self-center">-</span>
        <input
          type="number"
          value={localValue[1]}
          onChange={handleMaxChange}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          min={localValue[0]}
          max={max}
        />
      </div>
    </div>
  );
}
