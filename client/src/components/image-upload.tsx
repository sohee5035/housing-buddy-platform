import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  maxImages?: number;
  onImagesChange: (images: string[]) => void;
  initialImages?: string[];
}

export default function ImageUpload({ 
  maxImages = 10, 
  onImagesChange, 
  initialImages = [] 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPasteReady, setIsPasteReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 클립보드 붙여넣기 이벤트 리스너
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      console.log('Paste event triggered, isPasteReady:', isPasteReady);
      
      // 매물 등록 폼이 열려있을 때는 항상 붙여넣기 허용
      // (드롭존 호버 상태가 아니어도 동작하도록 개선)
      const isInPropertyForm = document.querySelector('[data-property-form]') !== null;
      if (!isPasteReady && !isInPropertyForm) {
        console.log('Paste not ready and not in property form, ignoring');
        return;
      }
      
      const items = e.clipboardData?.items;
      if (!items) {
        console.log('No clipboard items');
        return;
      }

      console.log('Checking clipboard items:', items.length);
      let hasImage = false;
      Array.from(items).forEach((item, index) => {
        console.log(`Item ${index}: type=${item.type}, kind=${item.kind}`);
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          hasImage = true;
          const file = item.getAsFile();
          if (file) {
            console.log('Processing pasted image file:', file.name, file.size);
            processImageFile(file);
          }
        }
      });

      if (hasImage) {
        toast({
          title: "이미지 붙여넣기 완료",
          description: "클립보드의 이미지가 추가되었습니다.",
        });
      } else {
        console.log('No images found in clipboard');
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isPasteReady, images.length, maxImages]);

  const processImageFile = (file: File) => {
    console.log('Processing image file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      currentImagesCount: images.length,
      maxImages
    });

    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error('File size too large:', file.size);
      toast({
        title: "파일 크기 초과",
        description: "이미지는 10MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (images.length >= maxImages) {
      console.error('Too many images:', images.length, 'max:', maxImages);
      toast({
        title: "이미지 개수 초과",
        description: `최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('FileReader onload triggered');
      const result = e.target?.result as string;
      if (result) {
        const updatedImages = [...images, result];
        console.log('Adding image to state, new count:', updatedImages.length);
        setImages(updatedImages);
        onImagesChange(updatedImages);
        toast({
          title: "이미지 업로드 완료",
          description: `${file.name}이(가) 성공적으로 추가되었습니다.`,
        });
      } else {
        console.error('FileReader result is empty');
        toast({
          title: "이미지 업로드 실패",
          description: "이미지를 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      toast({
        title: "이미지 업로드 실패",
        description: "이미지를 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    };
    console.log('Starting FileReader.readAsDataURL');
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (files: FileList) => {
    console.log('handleFileSelect called with', files.length, 'files');
    if (files.length === 0) {
      console.warn('No files selected');
      return;
    }
    
    Array.from(files).forEach((file, index) => {
      console.log(`Processing file ${index + 1}/${files.length}:`, file.name);
      processImageFile(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        ref={dropZoneRef}
        className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : isPasteReady 
            ? "border-blue-400 bg-blue-50"
            : "border-neutral-300 hover:border-primary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsPasteReady(true)}
        onMouseLeave={() => setIsPasteReady(false)}
        onFocus={() => setIsPasteReady(true)}
        onBlur={() => setIsPasteReady(false)}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <Upload className="h-12 w-12 text-neutral-400 mr-2" />
            {isPasteReady && <Clipboard className="h-8 w-8 text-blue-500" />}
          </div>
          <div className="text-lg font-medium text-neutral-700 mb-2">
            매물 사진 업로드
          </div>
          <div className="text-neutral-500 mb-4">
            {isPasteReady 
              ? "Ctrl+V로 클립보드 이미지 붙여넣기 또는 파일 선택"
              : "이미지를 드래그하거나 클릭해서 파일 선택"
            }
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              파일 선택
            </Button>
            {isPasteReady && (
              <Button type="button" variant="outline" className="bg-blue-50">
                <Clipboard className="h-4 w-4 mr-2" />
                붙여넣기 준비됨
              </Button>
            )}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            최대 {maxImages}개 이미지, 각각 10MB 이하
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square relative">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Add more button if under limit */}
          {images.length < maxImages && (
            <Card
              className="aspect-square border-2 border-dashed border-neutral-300 hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <div className="text-sm text-neutral-500">Add More</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-sm text-neutral-600">
          {images.length} of {maxImages} images uploaded
        </div>
      )}
    </div>
  );
}
