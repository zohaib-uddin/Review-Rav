import { motion } from 'framer-motion';

interface CartImpactEffectProps {
  x: number;
  y: number;
  particleCount?: number;
  onComplete?: () => void;
}

export default function CartImpactEffect({ x, y, particleCount = 12, onComplete }: CartImpactEffectProps) {
  const colors = ['#000000', '#FFD700', '#C0C0C0', '#FFFFFF', '#E5E5E5'];
  
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (i / particleCount) * Math.PI * 2,
    velocity: Math.random() * 80 + 60,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 200 + 400
  }));

  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: x, top: y }}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            x: Math.cos(particle.angle) * particle.velocity,
            y: Math.sin(particle.angle) * particle.velocity,
            scale: 0,
            opacity: 0
          }}
          transition={{ 
            duration: particle.duration / 1000,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          onAnimationComplete={() => {
            if (particle.id === particleCount - 1 && onComplete) {
              onComplete();
            }
          }}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2
          }}
        />
      ))}
    </div>
  );
}