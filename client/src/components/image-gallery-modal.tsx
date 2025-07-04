import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export default function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0,
  title = ""
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-screen h-screen p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 헤더 */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-gray-300">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleZoom}
                className="text-white hover:bg-white/10"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 이미지 */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-grab' : 'cursor-zoom-in'
              }`}
              onClick={toggleZoom}
              draggable={false}
            />
          </div>

          {/* 이전/다음 버튼 */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* 하단 썸네일 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex gap-2 bg-black/50 rounded-lg p-2 max-w-96 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsZoomed(false);
                    }}
                    className={`relative w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                      index === currentIndex 
                        ? 'border-white' 
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 사용법 안내 */}
          <div className="absolute bottom-4 right-4 text-white/70 text-sm z-20">
            <div className="bg-black/50 rounded-lg p-3">
              <p>← → 키: 이미지 전환</p>
              <p>ESC: 닫기</p>
              <p>클릭: 확대/축소</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}