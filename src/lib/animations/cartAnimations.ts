import { motion } from 'framer-motion';

interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl: string;
}

interface CartAnimationsProps {
  flyingItems: FlyingItem[];
  onFlightComplete?: (id: string) => void;
}

export function useFlyingAnimation() {
  const createFlyingItem = (
    startEl: HTMLElement,
    endEl: HTMLElement,
    imageUrl: string
  ): FlyingItem => {
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    
    return {
      id: `flying-${Date.now()}-${Math.random()}`,
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
      endX: endRect.left + endRect.width / 2,
      endY: endRect.top + endRect.height / 2,
      imageUrl
    };
  };

  const getBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 100;
    return { startX, startY, controlX, controlY, endX, endY };
  };

  return { createFlyingItem, getBezierPath };
}

export function FlyingCartItem({ item, onComplete }: { item: FlyingItem; onComplete?: () => void }) {
  const path = {
    startX: item.startX,
    startY: item.startY,
    controlX: (item.startX + item.endX) / 2,
    controlY: Math.min(item.startY, item.endY) - 100,
    endX: item.endX,
    endY: item.endY
  };

  return (
    <motion.div
      initial={{
        left: path.startX,
        top: path.startY,
        scale: 1,
        opacity: 1
      }}
      animate={{
        left: path.endX,
        top: path.endY,
        scale: 0.3,
        opacity: 0.8
      }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.5, 1],
      }}
      onAnimationComplete={onComplete}
      className="fixed w-20 h-20 rounded-xl shadow-2xl pointer-events-none z-[9999]"
      style={{
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
}

export default { useFlyingAnimation, FlyingCartItem };
