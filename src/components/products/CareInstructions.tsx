'use client';

import { motion } from 'framer-motion';
import { Droplets, Wind, Scissors, CircleDot } from 'lucide-react';

interface CareInstruction {
  icon: string;
  text: string;
}

interface CareInstructionsProps {
  instructions?: CareInstruction[];
}

const iconMap: Record<string, any> = {
  'wash': Droplets,
  'dry': Wind,
  'iron': Scissors,
  'bleach': CircleDot,
};

export default function CareInstructions({ instructions }: CareInstructionsProps) {
  const defaultInstructions: CareInstruction[] = [
    { icon: 'wash', text: 'Machine Wash Cold' },
    { icon: 'dry', text: 'Tumble Dry Low' },
    { icon: 'iron', text: 'No Iron on Print' },
    { icon: 'bleach', text: 'Do Not Bleach' },
  ];

  const careItems = instructions || defaultInstructions;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold mb-4">Care Instructions</h3>
      <div className="grid grid-cols-2 gap-4">
        {careItems.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Droplets;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <IconComponent size={18} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
