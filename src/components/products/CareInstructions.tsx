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
  // Normalize care instructions whether passed as an array of objects, array of strings, or a plain string
  let instructions: Array<{ icon: string; text: string }> = [];

  if (Array.isArray(careInstructions) && careInstructions.length > 0) {
    instructions = careInstructions.map((item: any) => {
      if (typeof item === 'string') {
        return { icon: 'shirt', text: item };
      }
      return {
        icon: item.icon || 'shirt',
        text: item.text || item.label || String(item),
      };
    });
  } else if (typeof careInstructions === 'string' && careInstructions.trim().length > 0) {
    // Split string by commas, periods, or newlines
    const sentences = careInstructions
      .split(/[.\n;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const iconCycle = ['circle-slash', 'droplet', 'wind', 'shirt'];
    instructions = (sentences.length > 0 ? sentences : [careInstructions.trim()]).map((text, idx) => ({
      icon: iconCycle[idx % iconCycle.length],
      text,
    }));
  }

  if (instructions.length === 0) {
    instructions = [
      { icon: 'circle-slash', text: 'No Iron on Print' },
      { icon: 'droplet', text: 'Hand Wash Only' },
      { icon: 'wind', text: 'Gentle Cycle' },
      { icon: 'shirt', text: 'Dry Inside Out' },
    ];
  }

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
