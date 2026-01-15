import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Grid3x3, Eye } from 'lucide-react';

export default function ImageGallery({ images = [], title = '', photo360 = null, displayLocation = null, onView360Tour }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  const openLightbox = (index) => {
    setSelectedIndex(index);
    setShowGrid(false);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setShowGrid(false);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">אין תמונות זמינות</p>
      </div>
    );
  }

  // Determine which images to show in grid
  const mainImage = photo360 ? null : images[0]; // If no 360, first image is main
  const gridImages = photo360 ? images.slice(0, 4) : images.slice(1, 5); // Next 4 images
  const hasMoreImages = images.length > (photo360 ? 4 : 5);

  return (
    <>
      {/* Gallery Grid - Fixed Layout */}
      <div className="grid grid-cols-3 gap-2 h-[500px] rounded-3xl overflow-hidden">
        {/* Hero Frame - Main slot with fixed aspect ratio */}
        <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
          {photo360 ? (
            <div className="relative w-full h-full">
              <iframe
                src={photo360}
                width="100%"
                height="100%"
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
            <div 
              className="relative w-full h-full cursor-pointer overflow-hidden"
              onClick={() => openLightbox(0)}
            >
              <img
                src={mainImage}
                alt={`${title} - 1`}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                style={{ display: 'block' }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
            </div>
          )}
        </div>
        
        {/* Right side - Top 2 preview frames with fixed dimensions */}
        <div className="col-span-1 grid grid-rows-2 gap-2">
          {gridImages.slice(0, 2).map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer group overflow-hidden rounded-lg"
              style={{ width: '100%', height: '100%' }}
            >
              <img
                src={image}
                alt={`${title} - ${photo360 ? index + 1 : index + 2}`}
                className="w-full h-full object-cover object-center group-hover:brightness-90 transition-all"
                onClick={() => openLightbox(photo360 ? index : index + 1)}
                style={{ display: 'block' }}
              />
            </div>
          ))}
        </div>

        {/* Bottom 2 frames - Fixed dimensions */}
        {gridImages.length > 2 && (
          <>
            {gridImages.slice(2, 3).map((image, index) => (
              <div
                key={index + 2}
                className="relative cursor-pointer group overflow-hidden rounded-lg"
                style={{ width: '100%', height: '100%' }}
              >
                <img
                  src={image}
                  alt={`${title} - ${photo360 ? index + 3 : index + 4}`}
                  className="w-full h-full object-cover object-center group-hover:brightness-90 transition-all"
                  onClick={() => openLightbox(photo360 ? index + 2 : index + 3)}
                  style={{ display: 'block' }}
                />
              </div>
            ))}
            
            {gridImages[3] && (
              <div
                className="relative cursor-pointer group overflow-hidden rounded-lg"
                style={{ width: '100%', height: '100%' }}
                onClick={hasMoreImages ? () => setShowGrid(true) : () => openLightbox(photo360 ? 3 : 4)}
              >
                {hasMoreImages && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all group-hover:bg-black/70">
                    <Grid3x3 className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">להציג את כל התמונות</span>
                    <span className="text-xs opacity-80">{images.length} תמונות</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black" dir="rtl">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center gap-2 transition-all"
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-sm">כל התמונות</span>
          </button>

          {photo360 && onView360Tour && (
            <button
              onClick={onView360Tour}
              className="absolute top-4 left-32 z-50 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center gap-2 transition-all"
            >
              <Eye className="w-5 h-5" />
              <span className="text-sm">360° Virtual Tour</span>
            </button>
          )}

          {showGrid ? (
            <div className="w-full h-full overflow-y-auto p-8 bg-black">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group overflow-hidden rounded-lg"
                    style={{ aspectRatio: '3/2' }}
                    onClick={() => {
                      setSelectedIndex(index);
                      setShowGrid(false);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${title} - ${index + 1}`}
                      className="w-full h-full object-cover object-center group-hover:brightness-90 transition-all"
                      style={{ display: 'block' }}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                      {index + 1} / {images.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={images[selectedIndex]}
                alt={`${title} - ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{ display: 'block' }}
              />

              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}