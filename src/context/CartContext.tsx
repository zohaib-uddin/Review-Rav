import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Product, CartItem } from '../store/useStore';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number, triggerElement?: HTMLElement) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  animationQueue: AnimationQueueItem[];
  isAnimating: boolean;
}

interface AnimationQueueItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  triggerElement?: HTMLElement;
  timestamp: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animationQueue, setAnimationQueue] = useState<AnimationQueueItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const processingRef = useRef(false);

  // Process animation queue
  useEffect(() => {
    if (animationQueue.length > 0 && !processingRef.current && !isAnimating) {
      processingRef.current = true;
      const nextItem = animationQueue[0];
      
      // Trigger the animation
      triggerFlyAnimation(nextItem);
      
      // Remove from queue after animation starts
      setTimeout(() => {
        setAnimationQueue(prev => prev.slice(1));
        processingRef.current = false;
      }, 100);
    }
  }, [animationQueue, isAnimating]);

  const triggerFlyAnimation = useCallback((item: AnimationQueueItem) => {
    setIsAnimating(true);
    
    const triggerEl = item.triggerElement;
    const cartIcon = document.querySelector('[data-cart-icon]') as HTMLElement;
    
    if (!triggerEl || !cartIcon) {
      // No animation, just add to cart
      addItemToCart(item.product, item.size, item.color, item.quantity);
      setIsAnimating(false);
      return;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Create flying element
    const flyingElement = document.createElement('div');
    flyingElement.className = 'flying-cart-item';
    flyingElement.style.position = 'fixed';
    flyingElement.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
    flyingElement.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
    flyingElement.style.width = '80px';
    flyingElement.style.height = '80px';
    flyingElement.style.backgroundImage = `url(${item.product.image_url || item.product.images?.[0] || item.product.image})`;
    flyingElement.style.backgroundSize = 'cover';
    flyingElement.style.backgroundPosition = 'center';
    flyingElement.style.borderRadius = '12px';
    flyingElement.style.zIndex = '9999';
    flyingElement.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    flyingElement.style.pointerEvents = 'none';
    flyingElement.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(flyingElement);

    // Force reflow
    flyingElement.offsetHeight;

    // Calculate control points for bezier curve
    const startX = triggerRect.left + triggerRect.width / 2;
    const startY = triggerRect.top + triggerRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // Control point for bezier - creates an arc
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 100; // Arc upward

    // Animate using Web Animations API with bezier curve
    const animation = flyingElement.animate([
      { 
        transform: 'translate(-50%, -50%) scale(1)',
        offset: 0,
      },
      { 
        transform: `translate(${controlX - startX}px, ${controlY - startY}px) scale(0.9)`,
        offset: 0.5,
      },
      { 
        transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.3)`,
        offset: 1,
      }
    ], {
      duration: 700,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards'
    });

    // On animation complete
    animation.onfinish = () => {
      // Create particle explosion at cart icon
      createParticleExplosion(endX, endY);
      
      // Remove flying element
      flyingElement.remove();
      
      // Add item to cart
      addItemToCart(item.product, item.size, item.color, item.quantity);
      
      // Open sidebar on first item
      if (cart.length === 0) {
        setIsSidebarOpen(true);
      }
      
      setIsAnimating(false);
    };
  }, [cart.length]);

  const createParticleExplosion = (x: number, y: number) => {
    const particleCount = 12;
    const colors = ['#000000', '#FFD700', '#C0C0C0', '#FFFFFF'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'cart-particle';
      particle.style.position = 'fixed';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${Math.random() * 8 + 4}px`;
      particle.style.height = particle.style.width;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '50%';
      particle.style.zIndex = '9999';
      particle.style.pointerEvents = 'none';
      
      document.body.appendChild(particle);

      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 80 + 60;
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity;

      const animation = particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
        },
        { 
          transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0)`,
          opacity: 0,
        }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });

      animation.onfinish = () => particle.remove();
    }
  };

  const addItemToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.size === size && item.color === color
      );
      
      if (existingIndex >= 0) {
        // Item exists - update quantity with bounce effect handled in UI
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
        return newCart;
      } else {
        // New item - add to cart
        return [...prev, { product, quantity, size, color }];
      }
    });
  };

  const addToCart = useCallback((
    product: Product, 
    size: string, 
    color: string, 
    quantity: number = 1,
    triggerElement?: HTMLElement
  ) => {
    // Add to animation queue
    const queueItem: AnimationQueueItem = {
      product,
      size,
      color,
      quantity,
      triggerElement,
      timestamp: Date.now()
    };
    
    setAnimationQueue(prev => [...prev, queueItem]);
  }, []);

  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  }, []);

  const updateCartQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId && item.size === size
        ? { ...item, quantity }
        : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      animationQueue,
      isAnimating
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
