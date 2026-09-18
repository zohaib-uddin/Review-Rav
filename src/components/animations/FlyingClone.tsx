import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FlyingCloneProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  onComplete: () => void;
}

export default function FlyingClone({
  startX,
  startY,
  endX,
  endY,
  imageUrl,
  title,
  size,
  color,
  quantity,
  onComplete,
}: FlyingCloneProps) {
  const [phase, setPhase] = useState<'flight' | 'blast'>('flight');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('blast');
    }, 700); // Flight duration

    return () => clearTimeout(timer);
  }, []);

  const handleBlastComplete = () => {
    onComplete();
  };

  if (phase === 'blast') {
    return <BlastEffect x={endX} y={endY} onComplete={handleBlastComplete} />;
  }

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 1, rotate: 0 }}
      animate={{
        x: endX,
        y: endY,
        scale: 0.6,
        rotate: 15,
      }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        willChange: 'transform',
      }}
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: 0,
        top: 0,
      }}
    >
      <div className="w-[80px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-20 object-cover"
        />
        <div className="p-2">
          <p className="text-[10px] font-medium truncate">{title}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">{size}</span>
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded">{color}</span>
          </div>
          <p className="text-[9px] font-bold mt-1">Qty: {quantity}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface BlastEffectProps {
  x: number;
  y: number;
  onComplete: () => void;
}

function BlastEffect({ x, y, onComplete }: BlastEffectProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={onComplete}
      className="fixed z-[9999] pointer-events-none"
      style={{ left: x, top: y }}
    >
      {/* Particle explosion */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: 1.5,
            opacity: 0,
            x: Math.cos((i / 8) * Math.PI * 2) * 40,
            y: Math.sin((i / 8) * Math.PI * 2) * 40,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          style={{ transformOrigin: 'center' }}
        />
      ))}
      {/* Center glow */}
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute w-8 h-8 bg-amber-300 rounded-full blur-md"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </motion.div>
  );
}
