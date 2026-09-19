import { Droplet, Wind, CircleSlash, Shirt } from 'lucide-react';

interface CareInstructionsProps {
  careInstructions?: Array<{ icon: string; text: string }> | null;
}

const defaultCareIcons: Record<string, any> = {
  'no-iron': CircleSlash,
  'hand-wash': Droplet,
  'gentle-cycle': Wind,
  'dry-flat': Shirt,
};

export default function CareInstructions({ careInstructions }: CareInstructionsProps) {
  // Default care instructions if none provided
  const instructions = careInstructions || [
    { icon: 'circle-slash', text: 'No Iron on Print' },
    { icon: 'droplet', text: 'Hand Wash Only' },
    { icon: 'wind', text: 'Gentle Cycle' },
    { icon: 'shirt', text: 'Dry Inside Out' },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold mb-4">Care Instructions</h3>
      <div className="grid grid-cols-2 gap-4">
        {instructions.map((item, idx) => {
          const IconComponent = defaultCareIcons[item.icon] || Shirt;
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 transition-colors"
            >
              <IconComponent size={28} className="text-purple-600 mb-2" />
              <span className="text-xs font-medium text-center text-gray-700">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
