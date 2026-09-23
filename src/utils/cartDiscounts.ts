import { CartItem } from '../store/useStore';

export interface CartDiscountBreakdown {
  subtotal: number;
  totalQty: number;
  flatDiscountPercent: number; // 10%
  flatDiscount: number;
  tierPercent: number; // 0, 5, or 10
  tierDiscount: number;
  autoDiscount: number; // flatDiscount + tierDiscount
  tierStatusMessage: string;
  nextTierGoal: number;
  itemsNeeded: number;
  progressPercent: number;
  unlockedTier1: boolean; // >= 2 items
  unlockedTier2: boolean; // >= 5 items
  shipping: number;
  finalTotal: number;
}

/**
 * Calculates dynamic tiered & flat discounts for Cart Sidebar, Cart Page, and Checkout.
 * Tier 1: Add 2 items -> 5% extra OFF
 * Tier 2: Add 5 items -> 10% extra OFF
 * Base: Flat 10% OFF
 */
export function calculateCartDiscounts(
  cart: CartItem[],
  couponDiscount: number = 0
): CartDiscountBreakdown {
  const subtotal = cart.reduce((sum, item) => {
    const p = item.product;
    const unitPrice = Number(p.salePrice || p.price || p.base_price || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Flat 10% discount on cart
  const flatDiscountPercent = totalQty > 0 ? 10 : 0;
  const flatDiscount = Math.round(subtotal * (flatDiscountPercent / 100));

  // Tiered volume discount
  let tierPercent = 0;
  let unlockedTier1 = false;
  let unlockedTier2 = false;
  let tierStatusMessage = '';
  let nextTierGoal = 2;
  let itemsNeeded = 0;

  if (totalQty >= 5) {
    tierPercent = 10;
    unlockedTier1 = true;
    unlockedTier2 = true;
    tierStatusMessage = '🎉 Maximum tier unlocked: Extra 10% OFF applied!';
    nextTierGoal = 5;
    itemsNeeded = 0;
  } else if (totalQty >= 2) {
    tierPercent = 5;
    unlockedTier1 = true;
    unlockedTier2 = false;
    const remaining = 5 - totalQty;
    itemsNeeded = remaining;
    nextTierGoal = 5;
    tierStatusMessage = `🔥 Extra 5% OFF unlocked! Add ${remaining} more item${remaining > 1 ? 's' : ''} to get 10% OFF!`;
  } else if (totalQty === 1) {
    tierPercent = 0;
    unlockedTier1 = false;
    unlockedTier2 = false;
    itemsNeeded = 1;
    nextTierGoal = 2;
    tierStatusMessage = 'Add 1 more item to unlock Extra 5% OFF!';
  } else {
    tierPercent = 0;
    unlockedTier1 = false;
    unlockedTier2 = false;
    itemsNeeded = 2;
    nextTierGoal = 2;
    tierStatusMessage = 'Add 2 items to get 5% OFF, or 5 items for 10% OFF!';
  }

  const tierDiscount = Math.round(subtotal * (tierPercent / 100));
  const autoDiscount = flatDiscount + tierDiscount;
  const totalCombinedDiscount = autoDiscount + couponDiscount;

  // 0 to 5 items scale for progress bar (each item is 20%)
  const progressPercent = Math.min(100, Math.round((totalQty / 5) * 100));

  // Free shipping over Rs. 3000 after discount
  const discountedSubtotal = Math.max(0, subtotal - totalCombinedDiscount);
  const shipping = subtotal > 0 && discountedSubtotal >= 3000 ? 0 : (subtotal > 0 ? 200 : 0);
  const finalTotal = discountedSubtotal + shipping;

  return {
    subtotal,
    totalQty,
    flatDiscountPercent,
    flatDiscount,
    tierPercent,
    tierDiscount,
    autoDiscount,
    tierStatusMessage,
    nextTierGoal,
    itemsNeeded,
    progressPercent,
    unlockedTier1,
    unlockedTier2,
    shipping,
    finalTotal,
  };
}
