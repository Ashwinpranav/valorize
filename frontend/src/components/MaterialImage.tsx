import React, { useState } from 'react';
import { getCategoryPlaceholder, isPlaceholderImage } from '../utils/materialImages';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MaterialImageProps {
  images?: Array<{ image_url: string; is_primary?: boolean }> | string[];
  imageUrl?: string;
  categoryName?: string;
  title?: string;
  alt?: string;
  className?: string;
  aspectRatio?: string;
  showControls?: boolean;
  showPlaceholderBadge?: boolean;
  onImageClick?: (index: number) => void;
}

export const MaterialImage: React.FC<MaterialImageProps> = ({
  images = [],
  imageUrl,
  categoryName,
  title,
  alt = 'Industrial Material',
  className = 'w-full h-full object-cover',
  aspectRatio = 'aspect-[16/10]',
  showControls = false,
  showPlaceholderBadge = true,
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  // Normalize images list with primary image sorted first
  const imageList: string[] = React.useMemo(() => {
    let list: Array<{ url: string; isPrimary: boolean }> = [];

    if (Array.isArray(images) && images.length > 0) {
      list = images
        .map((img: any) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: false };
          }
          return { url: img?.image_url || '', isPrimary: !!img?.is_primary };
        })
        .filter((item) => !!item.url);
    } else if (imageUrl) {
      list = [{ url: imageUrl, isPrimary: true }];
    }

    // Filter out known broken/cross-contaminated generic legacy Unsplash URLs
    list = list.filter((item) => !item.url.includes('photo-1590496793929'));

    // Sort primary images first
    list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    return list.map((item) => item.url);
  }, [images, imageUrl]);

  const fallback = getCategoryPlaceholder(categoryName, title);

  // If user image is present and not failed, use it; otherwise use category SVG data URI
  const rawUrl = imageList[currentIndex];
  const useRaw = rawUrl && !failedUrls.has(rawUrl) && !rawUrl.startsWith('/images/materials/');
  const currentSrc = useRaw ? rawUrl : fallback;
  const isPlaceholder = !useRaw || isPlaceholderImage(currentSrc);

  const handleImageError = () => {
    if (rawUrl && !failedUrls.has(rawUrl)) {
      setFailedUrls((prev) => new Set(prev).add(rawUrl));
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageList.length > 1) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageList.length > 1) {
      setCurrentIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className={`relative ${aspectRatio} bg-[#0C1929] overflow-hidden select-none group`}>
      <img
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
        onClick={() => onImageClick && onImageClick(currentIndex)}
      />

      {/* Category Reference Badge */}
      {showPlaceholderBadge && isPlaceholder && (
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide bg-[#0B1220]/85 text-teal-300 border border-teal-500/30 backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Reference Visual
          </span>
        </div>
      )}

      {/* Multiple images indicator & controls */}
      {showControls && imageList.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 z-20"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1 z-20">
            <span>{currentIndex + 1}</span>/<span>{imageList.length}</span>
          </div>
        </>
      )}
    </div>
  );
};
