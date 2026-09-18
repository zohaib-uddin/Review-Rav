import { ArrowUpDown } from 'lucide-react';

interface SortOptionsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortOptions({ value, onChange }: SortOptionsProps) {
  const options = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'rating', label: 'Rating' },
  ];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={16} className="text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
