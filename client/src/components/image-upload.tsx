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
  const [uploading, setUploading] = useState(false);
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

  const processImageFile = async (file: File) => {
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

    try {
      setUploading(true);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // Cloudinary에 업로드
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const result = await response.json();
      
      // Cloudinary URL을 이미지 배열에 추가
      const updatedImages = [...images, result.imageUrl];
      console.log('Adding Cloudinary image to state, new count:', updatedImages.length);
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      toast({
        title: "이미지 업로드 완료",
        description: `${file.name}이(가) Cloudinary에 성공적으로 업로드되었습니다.`,
      });
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList) => {
    console.log('handleFileSelect called with', files.length, 'files');
    if (files.length === 0) {
      console.warn('No files selected');
      return;
    }
    
    // 순차적으로 파일 처리 (동시에 여러 파일 업로드 방지)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}/${files.length}:`, file.name);
      await processImageFile(file);
    }
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
            <Button type="button" variant="outline" disabled={uploading}>
              {uploading ? "업로드 중..." : "파일 선택"}
            </Button>
            {isPasteReady && (
              <Button type="button" variant="outline" className="bg-blue-50" disabled={uploading}>
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
