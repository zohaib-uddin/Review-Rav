import { Share2, Facebook, Twitter, Instagram, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Share:</span>
      
      <a
        href={shareUrls.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        <Facebook size={16} />
      </a>
      
      <a
        href={shareUrls.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter size={16} />
      </a>
      
      <a
        href={shareUrls.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        title="Share on WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.666-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.199 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.423h-.004c-1.11 0-2.2-.296-3.156-.844l-.224-.136-2.327.612.627-2.264-.136-.216c-.604-.945-.933-2.04-.933-3.168 0-3.218 2.633-5.85 5.85-5.85 1.56 0 3.028.604 4.134 1.71 1.106 1.106 1.71 2.574 1.71 4.134 0 3.218-2.633 5.85-5.85 5.85m10.118-16.118C20.282 2.462 16.222.001 12.001.001 7.78.001 3.72 2.462 1.88 6.282.04 10.118 1.28 14.64 4.48 17.28l-.72 6.72 6.92-1.8c4.84 2.4 10.68.4 13.28-4.44 2.6-4.84.6-10.68-4.44-13.28"/>
        </svg>
      </a>
      
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-full transition-colors ${
          copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <LinkIcon size={16} />
        )}
      </button>
    </div>
  );
}
