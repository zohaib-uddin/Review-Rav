import { useState, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  totalSlides: number;
  interval?: number;
  paused?: boolean;
}

/**
 * Custom hook for auto-scroll carousel functionality
 * - 4-second interval (configurable)
 * - Infinite loop logic
 * - Pause on hover support
 */
export function useAutoScroll({ 
  totalSlides, 
  interval = 4000, 
  paused = false 
}: UseAutoScrollOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (paused || totalSlides <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        // Infinite scroll: when we reach the end, go back to start
        if (nextIndex >= totalSlides) {
          return 0;
        }
        return nextIndex;
      });
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [totalSlides, interval, paused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return {
    currentIndex,
    goToSlide,
    nextSlide,
    prevSlide,
  };
}