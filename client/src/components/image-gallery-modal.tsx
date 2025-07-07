import { useState, useEffect, useRef } from "react";
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 모바일 터치 감지
  const isMobile = window.innerWidth <= 768;
  
  // 터치 스와이프 최소 거리
  const minSwipeDistance = 50;

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

  // 터치 스와이프 핸들러들
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile 
          ? 'max-w-none w-full h-full p-0 bg-black border-0 rounded-none' 
          : 'max-w-7xl w-screen h-screen p-0 bg-black/95'
        }
      `}>
        <div className="relative w-full h-full flex flex-col">
          {/* 모바일 헤더 */}
          <div className={`
            ${isMobile 
              ? 'flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm' 
              : 'absolute top-4 left-4 right-4 z-20 flex items-center justify-between'
            }
          `}>
            <div className="text-white">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold truncate max-w-48`}>
                {title}
              </h3>
              <p className="text-sm text-gray-300">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleZoom}
                  className="text-white hover:bg-white/10"
                >
                  {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </Button>
              )}
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

          {/* 이미지 영역 */}
          <div className={`
            relative flex-1 flex items-center justify-center
            ${isMobile ? 'px-0' : 'p-16'}
          `}>
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                ref={imageRef}
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className={`
                  max-w-full max-h-full object-contain transition-transform duration-300
                  ${isMobile 
                    ? 'cursor-default select-none' 
                    : isZoomed 
                      ? 'scale-150 cursor-grab' 
                      : 'cursor-zoom-in'
                  }
                `}
                onClick={isMobile ? undefined : toggleZoom}
                draggable={false}
              />
            </div>
          </div>

          {/* PC용 이전/다음 버튼 */}
          {!isMobile && images.length > 1 && (
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

          {/* 하단 썸네일 - 모바일/PC 구분 */}
          {images.length > 1 && (
            <div className={`
              ${isMobile 
                ? 'p-4 bg-black/80 backdrop-blur-sm' 
                : 'absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'
              }
            `}>
              <div className={`
                flex gap-2 rounded-lg p-2 overflow-x-auto
                ${isMobile 
                  ? 'bg-transparent justify-center' 
                  : 'bg-black/50 max-w-96'
                }
              `}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsZoomed(false);
                    }}
                    className={`
                      relative rounded overflow-hidden border-2 transition-colors flex-shrink-0
                      ${isMobile ? 'w-12 h-9' : 'w-16 h-12'}
                      ${index === currentIndex 
                        ? 'border-white' 
                        : 'border-transparent hover:border-white/50'
                      }
                    `}
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

          {/* PC용 사용법 안내 */}
          {!isMobile && (
            <div className="absolute bottom-4 right-4 text-white/70 text-sm z-20">
              <div className="bg-black/50 rounded-lg p-3">
                <p>← → 키: 이미지 전환</p>
                <p>ESC: 닫기</p>
                <p>클릭: 확대/축소</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}