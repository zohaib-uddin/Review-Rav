import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Product, CartItem, useStore } from '../store/useStore';

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
  const cart = useStore(state => state.cart);
  const storeAddToCart = useStore(state => state.addToCart);
  const storeRemoveFromCart = useStore(state => state.removeFromCart);
  const storeUpdateCartQuantity = useStore(state => state.updateCartQuantity);
  const storeClearCart = useStore(state => state.clearCart);

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
    
    // Add item to store immediately
    for (let i = 0; i < item.quantity; i++) {
      storeAddToCart(item.product, item.size, item.color);
    }

    if (!triggerEl || !cartIcon) {
      setIsSidebarOpen(true);
      setIsAnimating(false);
      return;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Create flying element with image, title, and price
    const flyingElement = document.createElement('div');
    flyingElement.className = 'flying-cart-item';
    flyingElement.style.position = 'fixed';
    flyingElement.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
    flyingElement.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
    flyingElement.style.display = 'flex';
    flyingElement.style.alignItems = 'center';
    flyingElement.style.gap = '8px';
    flyingElement.style.padding = '6px 12px 6px 6px';
    flyingElement.style.backgroundColor = '#ffffff';
    flyingElement.style.borderRadius = '9999px';
    flyingElement.style.border = '1px solid rgba(0,0,0,0.1)';
    flyingElement.style.zIndex = '99999';
    flyingElement.style.boxShadow = '0 16px 36px rgba(0,0,0,0.25)';
    flyingElement.style.pointerEvents = 'none';
    flyingElement.style.transform = 'translate(-50%, -50%)';
    
    const imgSrc = item.product.image_url || item.product.images?.[0] || item.product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop';
    const price = item.product.price || item.product.base_price || 0;

    flyingElement.innerHTML = `
      <img src="${imgSrc}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 9999px; flex-shrink: 0;" />
      <div style="display: flex; flex-direction: column; max-width: 130px; overflow: hidden;">
        <span style="font-size: 11px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${item.product.name}</span>
        <span style="font-size: 10px; font-weight: 600; color: #666; margin-top: 2px;">Rs.${price.toLocaleString()}</span>
      </div>
    `;
    
    document.body.appendChild(flyingElement);

    // Force reflow
    flyingElement.offsetHeight;

    // Calculate control points for bezier curve
    const startX = triggerRect.left + triggerRect.width / 2;
    const startY = triggerRect.top + triggerRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;
    
    // Control point for bezier - creates an elegant upward floating arc
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 140;

    // Animate smoothly using Web Animations API (900ms smooth gentle arc)
    const animation = flyingElement.animate([
      { 
        transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
        opacity: 1,
        offset: 0,
      },
      { 
        transform: `translate(${controlX - startX}px, ${controlY - startY}px) scale(1.06) rotate(6deg)`,
        opacity: 0.95,
        offset: 0.45,
      },
      { 
        transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.18) rotate(16deg)`,
        opacity: 0.15,
        offset: 1,
      }
    ], {
      duration: 900,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    // On animation complete
    animation.onfinish = () => {
      // Create particle explosion at cart icon
      createParticleExplosion(endX, endY);
      
      // Remove flying element
      flyingElement.remove();
      
      // Auto open sidebar pop-up
      setIsSidebarOpen(true);
      setIsAnimating(false);
    };
  }, [storeAddToCart]);

  const createParticleExplosion = (x: number, y: number) => {
    const particleCount = 14;
    const colors = ['#000000', '#F59E0B', '#EF4444', '#10B981', '#FFFFFF'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'cart-particle';
      particle.style.position = 'fixed';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${Math.random() * 6 + 4}px`;
      particle.style.height = particle.style.width;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '50%';
      particle.style.zIndex = '99999';
      particle.style.pointerEvents = 'none';
      
      document.body.appendChild(particle);

      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 70 + 40;
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
        duration: 450,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });

      animation.onfinish = () => particle.remove();
    }
  };

  const addToCart = useCallback((
    product: Product, 
    size: string, 
    color: string, 
    quantity: number = 1,
    triggerElement?: HTMLElement
  ) => {
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
    storeRemoveFromCart(productId, size);
  }, [storeRemoveFromCart]);

  const updateCartQuantity = useCallback((productId: string, size: string, quantity: number) => {
    storeUpdateCartQuantity(productId, size, quantity);
  }, [storeUpdateCartQuantity]);

  const clearCart = useCallback(() => {
    storeClearCart();
  }, [storeClearCart]);

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
