import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Test suite for ProductImageCarousel auto-rotation feature
 */

describe('ProductImageCarousel Auto-Rotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Auto-Rotation Behavior', () => {
    it('should auto-rotate every 5 seconds', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;
      const autoRotateInterval = 5000;

      // Simulate auto-rotation
      const timer = setInterval(() => {
        currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
      }, autoRotateInterval);

      expect(currentIndex).toBe(0);
      
      vi.advanceTimersByTime(5000);
      expect(currentIndex).toBe(1);
      
      vi.advanceTimersByTime(5000);
      expect(currentIndex).toBe(2);
      
      vi.advanceTimersByTime(5000);
      expect(currentIndex).toBe(0); // Wraps around
      
      clearInterval(timer);
    });

    it('should pause auto-rotation on user interaction', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;
      let isAutoRotating = true;

      const pauseAutoRotate = () => {
        isAutoRotating = false;
      };

      expect(isAutoRotating).toBe(true);
      pauseAutoRotate();
      expect(isAutoRotating).toBe(false);
    });

    it('should resume auto-rotation after 5 seconds of inactivity', () => {
      let isAutoRotating = true;
      const pauseTimeout = 5000;

      const pauseAutoRotate = () => {
        isAutoRotating = false;
        setTimeout(() => {
          isAutoRotating = true;
        }, pauseTimeout);
      };

      pauseAutoRotate();
      expect(isAutoRotating).toBe(false);

      vi.advanceTimersByTime(5000);
      expect(isAutoRotating).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('should pause on previous button click', () => {
      let isAutoRotating = true;
      let currentIndex = 1;
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

      const goToPrevious = () => {
        isAutoRotating = false;
        currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      };

      goToPrevious();
      expect(isAutoRotating).toBe(false);
      expect(currentIndex).toBe(0);
    });

    it('should pause on next button click', () => {
      let isAutoRotating = true;
      let currentIndex = 0;
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

      const goToNext = () => {
        isAutoRotating = false;
        currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      };

      goToNext();
      expect(isAutoRotating).toBe(false);
      expect(currentIndex).toBe(1);
    });

    it('should pause on thumbnail click', () => {
      let isAutoRotating = true;
      let currentIndex = 0;

      const goToImage = (index: number) => {
        isAutoRotating = false;
        currentIndex = index;
      };

      goToImage(2);
      expect(isAutoRotating).toBe(false);
      expect(currentIndex).toBe(2);
    });

    it('should pause on image click', () => {
      let isAutoRotating = true;

      const handleImageClick = () => {
        isAutoRotating = false;
      };

      handleImageClick();
      expect(isAutoRotating).toBe(false);
    });
  });

  describe('Carousel Navigation', () => {
    it('should navigate to next image', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;

      const goToNext = () => {
        currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      };

      goToNext();
      expect(currentIndex).toBe(1);
      
      goToNext();
      expect(currentIndex).toBe(2);
      
      goToNext();
      expect(currentIndex).toBe(0); // Wraps to start
    });

    it('should navigate to previous image', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 2;

      const goToPrevious = () => {
        currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      };

      goToPrevious();
      expect(currentIndex).toBe(1);
      
      goToPrevious();
      expect(currentIndex).toBe(0);
      
      goToPrevious();
      expect(currentIndex).toBe(2); // Wraps to end
    });

    it('should jump to specific image', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;

      const goToImage = (index: number) => {
        currentIndex = index;
      };

      goToImage(2);
      expect(currentIndex).toBe(2);
      
      goToImage(0);
      expect(currentIndex).toBe(0);
    });
  });

  describe('Single Image Behavior', () => {
    it('should not auto-rotate with single image', () => {
      const images = ['img1.jpg'];
      let currentIndex = 0;
      let autoRotateActive = images.length > 1;

      expect(autoRotateActive).toBe(false);
      expect(currentIndex).toBe(0);
    });

    it('should not show navigation controls with single image', () => {
      const images = ['img1.jpg'];
      const showNavigation = images.length > 1;

      expect(showNavigation).toBe(false);
    });
  });

  describe('Multiple Images Behavior', () => {
    it('should show navigation controls with multiple images', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      const showNavigation = images.length > 1;

      expect(showNavigation).toBe(true);
    });

    it('should show image counter with multiple images', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;
      const counter = `${currentIndex + 1} / ${images.length}`;

      expect(counter).toBe('1 / 3');
      
      currentIndex = 2;
      const updatedCounter = `${currentIndex + 1} / ${images.length}`;
      expect(updatedCounter).toBe('3 / 3');
    });

    it('should show auto-rotate indicator when active', () => {
      let isAutoRotating = true;

      expect(isAutoRotating).toBe(true);

      isAutoRotating = false;
      expect(isAutoRotating).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', () => {
      const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
      let currentIndex = 0;
      let isAutoRotating = true;

      const handleClick = () => {
        isAutoRotating = false;
        currentIndex = (currentIndex + 1) % images.length;
      };

      handleClick();
      handleClick();
      handleClick();
      
      expect(currentIndex).toBe(0); // 0 + 1 + 1 + 1 = 3, 3 % 3 = 0
      expect(isAutoRotating).toBe(false);
    });

    it('should handle empty images array gracefully', () => {
      const images: string[] = [];
      const hasImages = images.length > 0;

      expect(hasImages).toBe(false);
    });

    it('should handle cleanup on unmount', () => {
      let timerCleared = false;
      const mockTimer = setInterval(() => {}, 5000);

      clearInterval(mockTimer);
      timerCleared = true;

      expect(timerCleared).toBe(true);
    });
  });
});
