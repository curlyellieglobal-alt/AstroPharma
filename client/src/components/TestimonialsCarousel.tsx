import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const { data: testimonials = [], isLoading } = trpc.testimonials.getActive.useQuery();

  useEffect(() => {
    if (!autoRotate || testimonials.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoRotate, testimonials.length]);

  const handlePrev = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
    setTimeout(() => setAutoRotate(true), 5000);
  };

  const handleNext = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setAutoRotate(true), 5000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading testimonials...</p>
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <div className="w-full bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Testimonial Content */}
        <div className="mb-8">
          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < current.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            "{current.title}"
          </h3>

          {/* Content */}
          <p className="text-gray-700 text-lg mb-6 italic">
            "{current.content}"
          </p>

          {/* Customer Info */}
          <div className="flex items-center gap-4">
            {current.customerImage && (
              <img
                src={current.customerImage}
                alt={current.customerName}
                className="w-14 h-14 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{current.customerName}</p>
              {current.customerEmail && (
                <p className="text-sm text-gray-600">{current.customerEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} className="text-primary" />
          </button>

          {/* Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoRotate(false);
                  setCurrentIndex(index);
                  setTimeout(() => setAutoRotate(true), 5000);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} className="text-primary" />
          </button>
        </div>

        {/* Counter */}
        <div className="text-center mt-6 text-sm text-gray-600">
          {currentIndex + 1} / {testimonials.length}
        </div>
      </div>
    </div>
  );
}
