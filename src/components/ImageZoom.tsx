import { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => {
        setIsZoomed(false);
        setPosition({ x: 50, y: 50 });
      }}
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{
          scale: isZoomed ? 2 : 1,
          x: isZoomed ? `${50 - position.x}%` : '0%',
          y: isZoomed ? `${50 - position.y}%` : '0%',
        }}
        transition={{ duration: 0.2 }}
      />
      
      {isZoomed && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      )}
    </div>
  );
}
