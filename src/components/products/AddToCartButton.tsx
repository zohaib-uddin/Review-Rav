import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../store/useStore';

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  children?: React.ReactNode;
}

export default function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  quantity = 1,
  className = '',
  variant = 'primary',
  children
}: AddToCartButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { addToCart } = useCart();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const firstColor = product.colors?.[0];
    const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || selectedColor || 'Black';

    // Pass the button element as trigger for flying animation
    addToCart(product, selectedSize, colorName, quantity, buttonRef.current || undefined);
  };

  const baseClasses = 'font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 active:scale-95',
    secondary: 'bg-white text-black border-2 border-black px-6 py-2.5 rounded-full hover:bg-black hover:text-white active:scale-95',
    icon: 'p-3 rounded-full bg-black text-white hover:bg-gray-800 active:scale-95'
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={!selectedSize}
    >
      {children || (
        <>
          <ShoppingBag size={18} />
          Add to Cart
        </>
      )}
    </motion.button>
  );
}
