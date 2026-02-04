import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

export function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);



  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    // Only auto-rotate if enabled and more than 1 image
    if (!isAutoRotating || images.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev === images.length - 1 ? 0 : prev + 1;
        return nextIndex;
      });
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [isAutoRotating, images.length]);

  // Cleanup pause timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const pauseAutoRotate = () => {
    setIsAutoRotating(false);

    // Clear any existing pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // Resume auto-rotation after 5 seconds of inactivity
    pauseTimerRef.current = setTimeout(() => {
      setIsAutoRotating(true);
    }, 5000);
  };

  const goToPrevious = () => {
    pauseAutoRotate();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    pauseAutoRotate();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    pauseAutoRotate();
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    pauseAutoRotate();
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer group">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="h-full w-full object-contain group-hover:opacity-90 transition-opacity"
          onClick={handleImageClick}
          loading="lazy"
        />
        
        {/* Navigation Arrows - Only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Auto-rotate indicator */}
        {images.length > 1 && isAutoRotating && (
          <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs font-medium">
            Auto-rotating
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                index === currentIndex
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
