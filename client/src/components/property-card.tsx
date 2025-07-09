import { useState } from "react";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartTextWithTooltips from "@/components/smart-text-with-tooltips";
import FavoriteButton from "@/components/favorite-button";
import { useTranslation } from "@/contexts/TranslationContext";
import { 
  MapPin, 
  Heart, 
  Languages,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onTranslate: () => void;
  viewMode?: "grid" | "list";
}

export default function PropertyCard({ property, onTranslate, viewMode = "grid" }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { 
    isTranslated, 
    translatedData
  } = useTranslation();

  // 전역 번역 데이터에서 해당 매물의 번역된 텍스트 가져오기
  const getTranslatedPropertyText = (field: string) => {
    if (!isTranslated) return null;
    return translatedData[`${field}_${property.id}`] || null;
  };

  const displayTitle = getTranslatedPropertyText('title') || property.title;
  const displayAddress = getTranslatedPropertyText('address') || property.address;
  const displayDescription = getTranslatedPropertyText('description') || property.description;

  if (viewMode === "list") {
    return (
      <Link href={`/property/${property.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
          <div className="flex">
            {/* 이미지 섹션 */}
            <div className="relative w-64 h-48 bg-neutral-200 rounded-l-lg overflow-hidden flex-shrink-0">
              {property.photos && property.photos.length > 0 ? (
                <img
                  src={property.photos[0]}
                  alt={displayTitle}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <div className="text-center">
                    <HomeIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">이미지 준비중</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-3 left-3">
                <Badge variant="secondary">임대</Badge>
              </div>
              
              <div className="absolute top-3 right-3" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                  <FavoriteButton propertyId={property.id} size="md" variant="ghost" />
                </div>
              </div>
            </div>

            {/* 내용 섹션 */}
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏠</span>
                    <h3 className="text-xl font-semibold text-neutral-900 hover:text-primary transition-colors">
                      <SmartTextWithTooltips 
                        text={displayTitle}
                        originalText={property.title}
                        isTranslated={isTranslated}
                      />
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      <SmartTextWithTooltips 
                        text={displayAddress}
                        originalText={property.address}
                        isTranslated={isTranslated}
                      />
                    </span>
                  </div>
                  
                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    <SmartTextWithTooltips 
                      text={displayDescription}
                      originalText={property.description}
                      isTranslated={isTranslated}
                    />
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
                    <span className="flex items-center">
                      <span className="text-neutral-500">카테고리:</span>
                      <span className="ml-1 font-medium">{property.category}</span>
                    </span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-600">보증금</span>
                        <span className="text-lg font-bold text-blue-600">
                          {(property.deposit / 10000).toLocaleString()}<span className="text-xs text-neutral-500 ml-1">만원</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-600">월세</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {(property.monthlyRent / 10000).toLocaleString()}<span className="text-xs text-neutral-500 ml-1">만원</span>
                        </span>
                      </div>
                      {property.maintenanceFee !== null && property.maintenanceFee > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-blue-200">
                          <span className="text-xs text-neutral-600">관리비</span>
                          <span className="text-sm font-semibold text-green-600">
                            {(property.maintenanceFee / 10000).toLocaleString()}<span className="text-xs text-neutral-500 ml-1">만원</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTranslate();
                      }}
                    >
                      <Languages className="h-4 w-4" />
                    </Button>
                    <Button size="sm">자세히 보기</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid 뷰 (기본)
  return (
    <Link href={`/property/${property.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative">
          <div className="relative h-64 bg-neutral-200 rounded-t-lg overflow-hidden">
            {property.photos && property.photos.length > 0 ? (
              <img
                src={property.photos[0]}
                alt={displayTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-400">
                <div className="text-center">
                  <HomeIcon className="h-16 w-16 mx-auto mb-2" />
                  <p className="text-sm">이미지 준비중</p>
                </div>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <Badge variant="secondary">임대</Badge>
            </div>
            
            <div className="absolute top-4 right-4" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                <FavoriteButton propertyId={property.id} size="md" variant="ghost" />
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏠</span>
                  <h3 className="text-xl font-semibold text-neutral-900 hover:text-primary transition-colors">
                    <SmartTextWithTooltips 
                      text={displayTitle}
                      originalText={property.title}
                      isTranslated={isTranslated}
                    />
                  </h3>
                </div>
                
                <div className="flex items-center text-sm text-neutral-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    <SmartTextWithTooltips 
                      text={displayAddress}
                      originalText={property.address}
                      isTranslated={isTranslated}
                    />
                  </span>
                </div>
                
                <p className="text-neutral-600 mb-4 line-clamp-2">
                  <SmartTextWithTooltips 
                    text={displayDescription}
                    originalText={property.description}
                    isTranslated={isTranslated}
                  />
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
                  <span className="flex items-center">
                    <span className="text-neutral-500">카테고리:</span>
                    <span className="ml-1 font-medium">{property.category}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">보증금</span>
                  <span className="text-xl font-bold text-blue-600">
                    {(property.deposit / 10000).toLocaleString()}<span className="text-sm text-neutral-500 ml-1">만원</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">월세</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {(property.monthlyRent / 10000).toLocaleString()}<span className="text-sm text-neutral-500 ml-1">만원</span>
                  </span>
                </div>
                {property.maintenanceFee !== null && property.maintenanceFee > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm text-neutral-600">관리비</span>
                    <span className="text-lg font-semibold text-green-600">
                      {(property.maintenanceFee / 10000).toLocaleString()}<span className="text-sm text-neutral-500 ml-1">만원</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTranslate();
                }}
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button size="sm" className="flex-1">자세히 보기</Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}