import React from 'react';
import toast from 'react-hot-toast';
import { Check, X, CheckCircle2, AlertCircle, ShoppingBag, Heart, LogIn, LogOut, PackageCheck } from 'lucide-react';

/* =========================================================================
   FRONTEND STOREFRONT TOASTS
   Clean white pill / card with vivid green tick and crisp streetwear typography
   ========================================================================= */

export const frontendToast = {
  success: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <p className="text-xs font-bold text-neutral-900 truncate tracking-tight">
              {message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 3000, position: 'top-right' }
    );
  },

  error: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-red-200 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <X className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <p className="text-xs font-bold text-red-700 truncate tracking-tight">
              {message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 3500, position: 'top-right' }
    );
  },

  addToCart: (productName: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <ShoppingBag size={13} className="text-neutral-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-900 truncate">
                Added to Bag: <span className="font-extrabold text-black">{productName}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 3200, position: 'top-right' }
    );
  },

  removeFromCart: (productName?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <p className="text-xs font-bold text-neutral-900 truncate tracking-tight">
              {productName ? `Removed from Bag: ${productName}` : 'Item removed from Bag'}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 2800, position: 'top-right' }
    );
  },

  addToWishlist: (productName: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Heart size={13} className="text-rose-500 fill-rose-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-900 truncate">
                Saved to Wishlist: <span className="font-extrabold text-black">{productName}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 3000, position: 'top-right' }
    );
  },

  removeFromWishlist: (productName?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <p className="text-xs font-bold text-neutral-900 truncate tracking-tight">
              {productName ? `Removed from Wishlist: ${productName}` : 'Removed from Wishlist'}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 2800, position: 'top-right' }
    );
  },

  login: (name?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <LogIn size={13} className="text-neutral-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-900 truncate">
                Welcome{name ? `, ${name}` : ''}! Signed in successfully.
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 3200, position: 'top-right' }
    );
  },

  logout: () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-full pointer-events-auto flex items-center justify-between border border-neutral-200/90 px-4 py-2.5 transition-all`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <LogOut size={13} className="text-neutral-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-900 truncate">
                Signed out successfully
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 2800, position: 'top-right' }
    );
  },

  orderPlaced: (orderNumber?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex items-start justify-between border-2 border-emerald-500/30 p-4 transition-all`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <PackageCheck size={14} className="text-emerald-600" />
                <h4 className="text-sm font-extrabold uppercase tracking-tight text-neutral-900">
                  Order Confirmed!
                </h4>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                {orderNumber ? `Order #${orderNumber} placed successfully.` : 'Thank you for your order!'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-3 p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ),
      { duration: 5000, position: 'top-right' }
    );
  },
};

/* =========================================================================
   ADMIN PANEL TOASTS
   Sleek Dark Executive Theme with [ADMIN] badge, structured title & detail subtext
   ========================================================================= */

export const adminToast = {
  success: (title: string, detail?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-neutral-950 text-white shadow-2xl rounded-xl pointer-events-auto border border-neutral-800 p-3.5 transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
                <CheckCircle2 size={16} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                    ADMIN
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white tracking-wide truncate">
                  {title}
                </h5>
                {detail && (
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug line-clamp-2">
                    {detail}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ),
      { duration: 3500, position: 'top-right' }
    );
  },

  error: (title: string, detail?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-neutral-950 text-white shadow-2xl rounded-xl pointer-events-auto border border-red-900/60 p-3.5 transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 mt-0.5">
                <AlertCircle size={16} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 rounded">
                    ADMIN ERROR
                  </span>
                </div>
                <h5 className="text-xs font-bold text-red-200 tracking-wide truncate">
                  {title}
                </h5>
                {detail && (
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug line-clamp-2">
                    {detail}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ),
      { duration: 4500, position: 'top-right' }
    );
  },

  info: (title: string, detail?: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-neutral-950 text-white shadow-2xl rounded-xl pointer-events-auto border border-neutral-800 p-3.5 transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0 text-sky-400 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">
                    ADMIN NOTICE
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white tracking-wide truncate">
                  {title}
                </h5>
                {detail && (
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug line-clamp-2">
                    {detail}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ),
      { duration: 3500, position: 'top-right' }
    );
  },
};
