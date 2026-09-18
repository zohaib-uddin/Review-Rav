interface ColorSwatchesProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorMap: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Red': '#EF4444',
  'Blue': '#3B82F6',
  'Green': '#10B981',
  'Yellow': '#F59E0B',
  'Purple': '#8B5CF6',
  'Pink': '#EC4899',
  'Orange': '#F97316',
  'Grey': '#6B7280',
  'Gray': '#6B7280',
  'Navy': '#1E3A8A',
  'Brown': '#92400E',
  'Beige': '#D4C5B9',
  'Charcoal': '#374151',
  'Smoky Black': '#1C1C1C',
  'Faded Teal': '#5EEAD4',
  'Dusty Mocha': '#A8A29E',
  'Olive': '#65A30D',
  'Dark Navy': '#1E3A8A',
  'Dark Grey': '#4B5563',
  'Light Blue': '#93C5FD',
  'Mustard': '#CA8A04',
};

export default function ColorSwatches({ colors, selectedColor, onColorChange }: ColorSwatchesProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map(color => {
        const hex = colorMap[color] || '#CCCCCC';
        const isSelected = selectedColor === color;
        
        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`relative w-10 h-10 rounded-full transition-all ${
              isSelected ? 'ring-2 ring-black ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400'
            }`}
            style={{ backgroundColor: hex }}
            title={color}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke={hex === '#FFFFFF' || hex === '#F59E0B' ? '#000000' : '#FFFFFF'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
