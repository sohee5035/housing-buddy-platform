import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { PropertyTerm, findTermByText } from "@/lib/property-terms";
import { BookOpen, Globe, Info } from "lucide-react";

interface PropertyTermTooltipProps {
  text: string;
  originalText?: string;
  children: React.ReactNode;
  isTranslated?: boolean;
}

export default function PropertyTermTooltip({ 
  text, 
  originalText, 
  children, 
  isTranslated = false 
}: PropertyTermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 번역된 텍스트나 원본 텍스트에서 용어 찾기
  const term = findTermByText(text) || (originalText ? findTermByText(originalText) : undefined);
  
  if (!term) {
    return <>{children}</>;
  }

  const getCategoryColor = (category: PropertyTerm['category']) => {
    switch (category) {
      case 'room_type': return 'bg-blue-100 text-blue-800';
      case 'location': return 'bg-green-100 text-green-800';
      case 'facility': return 'bg-purple-100 text-purple-800';
      case 'price': return 'bg-yellow-100 text-yellow-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: PropertyTerm['category']) => {
    switch (category) {
      case 'room_type': return <Info className="h-3 w-3" />;
      case 'location': return <Globe className="h-3 w-3" />;
      case 'facility': return <BookOpen className="h-3 w-3" />;
      case 'price': return <Info className="h-3 w-3" />;
      case 'general': return <BookOpen className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getCategoryLabel = (category: PropertyTerm['category']) => {
    switch (category) {
      case 'room_type': return '방 종류';
      case 'location': return '지역';
      case 'facility': return '시설';
      case 'price': return '가격';
      case 'general': return '일반';
      default: return '기타';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span 
            className="relative cursor-help underline decoration-dotted decoration-blue-400 hover:decoration-blue-600 transition-colors"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm p-4 bg-white border border-gray-200 shadow-lg rounded-lg"
          side="top"
          align="center"
        >
          <div className="space-y-3">
            {/* 카테고리 배지 */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(term.category)} flex items-center gap-1 px-2 py-1 text-xs`}
              >
                {getCategoryIcon(term.category)}
                {getCategoryLabel(term.category)}
              </Badge>
            </div>
            
            {/* 용어 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  🇰🇷 {term.korean}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  🇺🇸 {term.english}
                </span>
              </div>
            </div>
            
            {/* 설명 */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed">
                {term.explanation}
              </p>
            </div>
            
            {/* 학습 팁 */}
            {isTranslated && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <BookOpen className="h-3 w-3" />
                  <span className="font-medium">Language Learning Tip</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click to hear pronunciation or save to vocabulary list
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}