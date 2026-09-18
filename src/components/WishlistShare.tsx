import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Link as LinkIcon, Facebook, Twitter, Instagram, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function WishlistShare() {
  const { wishlist, products } = useStore();
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  const shareUrl = `${window.location.origin}/wishlist/shared/${btoa(JSON.stringify(wishlist)).slice(0, 20)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Ravenza Wishlist',
          text: `Check out my wishlist with ${wishlistProducts.length} items!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my Ravenza wishlist!')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent('Check out my Ravenza wishlist! ' + shareUrl)}`,
  };

  if (wishlistProducts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="text-pink-600" size={24} />
          <h3 className="text-xl font-bold">Share Your Wishlist</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Public</span>
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Share your wishlist with friends and family. They'll be able to see your favorite items!
      </p>

      {/* Wishlist Preview */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-sm font-medium mb-2">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} in your wishlist
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {wishlistProducts.slice(0, 5).map(product => (
            <div key={product.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {wishlistProducts.length > 5 && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
              +{wishlistProducts.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Share Options */}
      <div className="space-y-3">
        {/* Copy Link */}
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 border rounded-lg text-sm bg-gray-50"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {copied ? <Check size={16} /> : <LinkIcon size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex gap-2">
          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Share
            </button>
          )}
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Facebook size={16} />
            Facebook
          </a>
          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium text-sm hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
          >
            <Twitter size={16} />
            Twitter
          </a>
          <a
            href={shareUrls.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.666-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.199 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.423h-.004c-1.11 0-2.2-.296-3.156-.844l-.224-.136-2.327.612.627-2.264-.136-.216c-.604-.945-.933-2.04-.933-3.168 0-3.218 2.633-5.85 5.85-5.85 1.56 0 3.028.604 4.134 1.71 1.106 1.106 1.71 2.574 1.71 4.134 0 3.218-2.633 5.85-5.85 5.85m10.118-16.118C20.282 2.462 16.222.001 12.001.001 7.78.001 3.72 2.462 1.88 6.282.04 10.118 1.28 14.64 4.48 17.28l-.72 6.72 6.92-1.8c4.84 2.4 10.68.4 13.28-4.44 2.6-4.84.6-10.68-4.44-13.28"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
