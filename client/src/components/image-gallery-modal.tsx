import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomOut, Maximize } from "lucide-react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

interface TouchData {
  x: number;
  y: number;
}

export default function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0,
  title = ""
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchData[]>([]);
  const [touchEnd, setTouchEnd] = useState<TouchData[]>([]);
  const [lastTap, setLastTap] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 모바일 터치 감지
  const isMobile = window.innerWidth <= 768;
  
  // 터치 스와이프 최소 거리
  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) {
      resetZoom();
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // 줌 및 패닝 리셋
  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setIsPanning(false);
  };

  // 두 터치 포인트 사이의 거리 계산
  const getDistance = (touches: TouchData[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].x - touches[1].x;
    const dy = touches[0].y - touches[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          if (scale === 1) goToPrevious();
          break;
        case 'ArrowRight':
          if (scale === 1) goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale]);

  const goToPrevious = () => {
    if (scale === 1) {
      setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      resetZoom();
    }
  };

  const goToNext = () => {
    if (scale === 1) {
      setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      resetZoom();
    }
  };

  // 더블탭 줌
  const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (scale === 1) {
        setScale(2);
      } else {
        resetZoom();
      }
    }
    setLastTap(now);
  };

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY
    }));
    
    setTouchStart(touches);
    setTouchEnd([]);
    
    if (touches.length === 2) {
      // 핀치 줌 시작
      const distance = getDistance(touches);
      setInitialDistance(distance);
      setInitialScale(scale);
    } else if (touches.length === 1 && scale > 1) {
      // 패닝 시작
      setIsPanning(true);
    }
  };

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    const touches = Array.from(e.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY
    }));
    
    setTouchEnd(touches);
    
    if (touches.length === 2 && touchStart.length === 2) {
      // 핀치 줌
      const currentDistance = getDistance(touches);
      const scaleChange = currentDistance / initialDistance;
      const newScale = Math.min(Math.max(initialScale * scaleChange, 0.5), 4);
      setScale(newScale);
    } else if (touches.length === 1 && touchStart.length === 1 && isPanning && scale > 1) {
      // 패닝
      const deltaX = touches[0].x - touchStart[0].x;
      const deltaY = touches[0].y - touchStart[0].y;
      setTranslateX(prev => prev + deltaX * 0.5);
      setTranslateY(prev => prev + deltaY * 0.5);
      setTouchStart(touches);
    }
  };

  // 터치 종료
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.length === 1 && touchEnd.length === 1 && !isPanning) {
      // 스와이프 제스처 확인
      const deltaX = touchStart[0].x - touchEnd[0].x;
      const deltaY = Math.abs(touchStart[0].y - touchEnd[0].y);
      
      if (Math.abs(deltaX) > minSwipeDistance && deltaY < 100 && scale === 1) {
        if (deltaX > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    }
    
    setIsPanning(false);
    setTouchStart([]);
    setTouchEnd([]);
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={`
        ${isFullscreen || isMobile 
          ? 'max-w-none w-full h-full p-0 bg-black border-0 rounded-none' 
          : 'max-w-7xl w-screen h-screen p-0 bg-black/95'
        }
      `}>
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className={`
            ${isMobile || isFullscreen
              ? 'flex items-center justify-between py-3 px-4 bg-black/80 backdrop-blur-sm absolute top-0 left-0 right-0 z-20 min-h-[70px]' 
              : 'absolute top-4 left-4 right-4 z-20 flex items-center justify-between'
            }
          `}>
            <div className="text-white flex-1">
              <h3 className={`${isMobile ? 'text-lg' : 'text-lg'} font-semibold truncate max-w-48`}>
                {title}
              </h3>
              <p className={`${isMobile ? 'text-base' : 'text-sm'} text-gray-300`}>
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/10"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size={isMobile ? "default" : "icon"}
                onClick={resetZoom}
                className={`text-white hover:bg-white/10 ${isMobile ? 'px-4 py-3 rounded-lg' : ''}`}
                disabled={scale === 1}
              >
                <ZoomOut className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                size={isMobile ? "default" : "icon"}
                onClick={onClose}
                className={`text-white hover:bg-white/10 ${isMobile ? 'px-4 py-3 min-w-[56px] rounded-lg bg-white/10' : ''}`}
              >
                <X className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
                {isMobile && <span className="ml-1 text-sm">닫기</span>}
              </Button>
            </div>
          </div>

          {/* 이미지 컨테이너 */}
          <div 
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleDoubleTap}
            style={{ 
              paddingTop: isMobile || isFullscreen ? '90px' : '0',
              paddingBottom: isMobile || isFullscreen ? '90px' : '0'
            }}
          >
            <img
              ref={imageRef}
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                transition: isPanning ? 'none' : 'transform 0.3s ease-out',
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>

          {/* PC용 이전/다음 버튼 */}
          {!isMobile && images.length > 1 && scale === 1 && (
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
            <div className={`
              ${isMobile || isFullscreen
                ? 'py-4 px-4 bg-black/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 min-h-[90px] flex items-center' 
                : 'absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'
              }
            `}>
              <div className={`
                flex gap-2 rounded-lg p-2 overflow-x-auto
                ${isMobile || isFullscreen
                  ? 'bg-transparent justify-center' 
                  : 'bg-black/50 max-w-96'
                }
              `}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      resetZoom();
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

          {/* 모바일용 사용법 안내 */}
          {isMobile && scale === 1 && (
            <div className="absolute top-24 left-4 right-4 text-white/70 text-sm z-10 text-center">
              <div className="bg-black/60 rounded-lg p-3 mx-auto max-w-xs">
                <p className="text-white/90">📱 더블탭: 확대 | 🤏 핀치: 줌 | ↔️ 스와이프: 전환</p>
              </div>
            </div>
          )}

          {/* PC용 사용법 안내 */}
          {!isMobile && (
            <div className="absolute bottom-4 right-4 text-white/70 text-sm z-20">
              <div className="bg-black/50 rounded-lg p-3">
                <p>← → 키: 이미지 전환</p>
                <p>ESC: 닫기</p>
                <p>더블클릭: 확대/축소</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}