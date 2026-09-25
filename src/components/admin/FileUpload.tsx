import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { adminToast } from '../../utils/notifications';

interface FileUploadProps {
  label?: string;
  helperText?: string;
  aspectRatio?: '16:9' | '9:16' | '3:4' | 'square' | 'any';
  multiple?: boolean;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  className?: string;
}

/**
 * Optimizes and resizes any image file down to WebP/JPEG format.
 * Prevents 413 Payload Too Large errors by compressing before upload.
 */
async function compressImageFile(
  file: File,
  aspectRatio: '16:9' | '9:16' | '3:4' | 'square' | 'any'
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let maxW = 1600;
        let maxH = 1600;

        if (aspectRatio === '16:9') {
          maxW = 1920;
          maxH = 1080;
        } else if (aspectRatio === '9:16') {
          maxW = 1080;
          maxH = 1920;
        } else if (aspectRatio === '3:4') {
          maxW = 1200;
          maxH = 1600;
        } else if (aspectRatio === 'square') {
          maxW = 1400;
          maxH = 1400;
        }

        let { width, height } = img;

        // Proportional downscale if exceeding maximum dimensions
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP format first (ultra efficient compression), fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', 0.85);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }

        resolve(dataUrl);
      } catch (canvasErr) {
        console.warn('Canvas compression failed, falling back to direct read:', canvasErr);
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

export default function FileUpload({
  label,
  helperText,
  aspectRatio = 'any',
  multiple = false,
  value,
  onChange,
  className = '',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const images: string[] = multiple
    ? Array.isArray(value) ? value : value ? [value] : []
    : typeof value === 'string' && value ? [value] : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    setProcessingStatus(`Optimizing ${files.length} file${files.length > 1 ? 's' : ''}...`);

    try {
      const fileList = Array.from(files);
      const readPromises = fileList.map((file) => compressImageFile(file, aspectRatio));
      const newImages = await Promise.all(readPromises);
      const validImages = newImages.filter(Boolean);

      if (multiple) {
        onChange([...images, ...validImages]);
      } else {
        onChange(validImages[0] || '');
      }

      adminToast.success(
        'Image Ready',
        `${validImages.length} image${validImages.length > 1 ? 's' : ''} optimized and ready for save.`
      );
    } catch (err: any) {
      console.error('File optimization error:', err);
      adminToast.error('Upload Error', err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    if (multiple) {
      onChange([...images, inputUrl.trim()]);
    } else {
      onChange(inputUrl.trim());
    }
    setInputUrl('');
    setShowUrlInput(false);
    adminToast.success('Image URL Set', 'URL saved for image.');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (indexToRemove: number) => {
    if (multiple) {
      const updated = images.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const setAsMain = (indexToMain: number) => {
    if (!multiple || indexToMain === 0) return;
    const target = images[indexToMain];
    const rest = images.filter((_, idx) => idx !== indexToMain);
    onChange([target, ...rest]);
  };

  const getAspectBadge = () => {
    if (aspectRatio === '16:9') {
      return (
        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
          16:9 Landscape Banner
        </span>
      );
    }
    if (aspectRatio === '9:16') {
      return (
        <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full">
          9:16 Warm Chapter Vertical
        </span>
      );
    }
    if (aspectRatio === '3:4') {
      return (
        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
          3:4 Collection Focus Portrait
        </span>
      );
    }
    return null;
  };

  const getAspectClass = () => {
    if (aspectRatio === '16:9') return 'aspect-[16/9] w-full';
    if (aspectRatio === '9:16') return 'aspect-[9/16] w-48 mx-auto';
    if (aspectRatio === '3:4') return 'aspect-[3/4] w-52 mx-auto';
    return 'aspect-video w-full';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            {label}
          </label>
          {getAspectBadge()}
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-black bg-neutral-50 scale-[1.01]'
            : 'border-gray-200 hover:border-black bg-white hover:bg-neutral-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-3 shadow-inner">
            <UploadCloud size={24} className="stroke-[2.2]" />
          </div>
          <p className="text-sm font-bold text-neutral-900">
            {multiple ? 'Upload Images from Device (PC / Mobile)' : 'Upload Image from Device (PC / Mobile)'}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Drag and drop, or click to browse files
          </p>
          {aspectRatio === '16:9' && (
            <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mt-2 border border-amber-200">
              Optimal: 1920×1080 (16:9) landscape for collection hero section & mega menu
            </p>
          )}
          {aspectRatio === '9:16' && (
            <p className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mt-2 border border-purple-200">
              Optimal: 1080×1920 (9:16) portrait for Warm Chapter homepage cards
            </p>
          )}
          {aspectRatio === '3:4' && (
            <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mt-2 border border-emerald-200">
              Optimal: 1200×1600 (3:4) portrait for Collections in Focus homepage cards
            </p>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold shadow-sm animate-pulse">
              <Loader2 size={14} className="animate-spin text-amber-400" />
              <span>{processingStatus || 'Optimizing & processing images...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Alternative: Enter URL */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs font-semibold text-neutral-600 hover:text-black underline cursor-pointer"
        >
          {showUrlInput ? 'Hide URL input' : 'Or paste direct image URL'}
        </button>
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Single Image Preview */}
      {!multiple && images.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              {aspectRatio === '16:9' ? '16:9 Banner Preview' : aspectRatio === '9:16' ? '9:16 Warm Chapter Preview' : aspectRatio === '3:4' ? '3:4 Collections in Focus Preview' : 'Image Preview'}
            </span>
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X size={13} /> Remove
            </button>
          </div>
          <div
            className={`relative rounded-xl overflow-hidden border border-gray-200 bg-neutral-900 shadow-sm ${getAspectClass()}`}
          >
            <img
              src={images[0]}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {aspectRatio !== 'any' && (
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {aspectRatio}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multiple Images Gallery Preview */}
      {multiple && images.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Uploaded Gallery ({images.length} {images.length === 1 ? 'image' : 'images'})
            </span>
            <span className="text-[11px] text-gray-500">First image is used as Main Image</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-neutral-100 shadow-sm"
              >
                <img
                  src={img}
                  alt={`Product img ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Main badge */}
                {idx === 0 ? (
                  <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    MAIN
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAsMain(idx)}
                    className="absolute top-1.5 left-1.5 bg-white/90 hover:bg-black hover:text-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Set Main
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-700 cursor-pointer"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
