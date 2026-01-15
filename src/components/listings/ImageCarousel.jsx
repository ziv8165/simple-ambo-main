import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageCarousel({ images = [], photo360 = null, title = '', className = '', listingId = null }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Build slides array: 360 first if exists, then regular images
  const slides = [];
  if (photo360) {
    slides.push({ type: '360', url: photo360, isFirst: true });
  }
  images.forEach((img) => slides.push({ type: 'image', url: img }));

  const scrollPrev = useCallback((e) => {
    e?.stopPropagation();
    e?.preventDefault();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e) => {
    e?.stopPropagation();
    e?.preventDefault();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleImageClick = useCallback((e) => {
    // Only navigate if we have a listingId and the click wasn't on a button
    if (listingId && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      navigate(createPageUrl(`ListingDetails?id=${listingId}`));
    }
  }, [listingId, navigate]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (slides.length === 0) {
    return (
      <div className={cn("w-full h-full bg-gray-200 flex items-center justify-center", className)}>
        <p className="text-gray-500 text-sm">אין תמונות</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full group", className)}>
      <div 
        className="rounded-xl overflow-hidden h-full cursor-pointer" 
        ref={emblaRef}
        onClick={handleImageClick}
      >
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
              {slide.type === '360' ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={slide.url}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; gyroscope; magnetometer; vr"
                      allowFullScreen
                      style={{ display: 'block', width: '100%', height: '100%', border: 'none' }}
                    />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none z-10">
                      <Eye className="w-4 h-4 text-[#BC5D34]" />
                      <span className="text-xs font-bold text-[#4A2525]">360° Virtual Tour</span>
                    </div>
                  </div>
                ) : (
                <img
                  src={slide.url}
                  alt={`${title} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 -translate-y-1/2 left-2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm text-[#4A2525] flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 -translate-y-1/2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm text-[#4A2525] flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all pointer-events-none",
                  index === selectedIndex ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}