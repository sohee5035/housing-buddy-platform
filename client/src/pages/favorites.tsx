import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, HomeIcon, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import SmartTextWithTooltips from "@/components/smart-text-with-tooltips";
import type { Property } from "@shared/schema";

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const { getTranslatedText, isTranslated, translatedData } = useTranslation();
  const { toast } = useToast();

  const { data: favorites = [], isLoading, error, refetch } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
    enabled: !!isAuthenticated,
    retry: (failureCount, error) => {
      console.log(`❌ 즐겨찾기 조회 재시도 ${failureCount}번째:`, error);
      return failureCount < 3;
    },
  });

  // 번역된 UI 텍스트 가져오기
  const translateUI = (koreanText: string) => {
    return getTranslatedText(koreanText, `ui-${koreanText}`) || koreanText;
  };

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `${translateUI('보증금')} ${depositStr}${translateUI('만원')} / ${translateUI('월세')} ${rentStr}${translateUI('만원')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              {translateUI('로그인이 필요합니다')}
            </h2>
            <p className="text-neutral-600 mb-6">
              {translateUI('관심 매물을 확인하려면 로그인해주세요.')}
            </p>
            <Link href="/signup">
              <Button>{translateUI('로그인하기')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              {translateUI('오류가 발생했습니다')}
            </h2>
            <p className="text-neutral-600 mb-6">
              {translateUI('관심 매물을 불러오는데 실패했습니다.')}
            </p>
            <Button onClick={() => refetch()}>
              {translateUI('다시 시도')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            <h1 className="text-2xl font-bold text-neutral-900">
              {translateUI('관심 매물')}
            </h1>
            <span className="text-sm text-neutral-500">
              ({favorites.length}{translateUI('개')})
            </span>
          </div>
          <p className="text-neutral-600 mt-2">
            {translateUI('관심있는 매물들을 모아서 확인하세요.')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-neutral-200 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {translateUI('관심 매물이 없습니다')}
            </h3>
            <p className="text-neutral-600 mb-6">
              {translateUI('마음에 드는 매물을 찾아 하트를 눌러보세요!')}
            </p>
            <Link href="/">
              <Button>
                <HomeIcon className="h-4 w-4 mr-2" />
                {translateUI('매물 둘러보기')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/property/${property.id}`}>
                  <div className="relative h-48 bg-neutral-200">
                    {property.photos && property.photos.length > 0 ? (
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-500">
                        <HomeIcon className="h-12 w-12" />
                      </div>
                    )}
                    {/* Heart indicator */}
                    <div className="absolute top-3 right-3">
                      <Heart className="h-6 w-6 text-red-500 fill-current" />
                    </div>
                  </div>
                </Link>
                
                <CardContent className="p-4">
                  <Link href={`/property/${property.id}`}>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-1">
                      <SmartTextWithTooltips 
                        text={isTranslated && translatedData[`title_${property.id}`] 
                          ? translatedData[`title_${property.id}`] 
                          : property.title}
                        originalText={property.title}
                        isTranslated={isTranslated}
                      />
                    </h3>
                  </Link>
                  
                  <div className="flex items-center text-sm text-neutral-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      <SmartTextWithTooltips 
                        text={isTranslated && translatedData[`address_${property.id}`] 
                          ? translatedData[`address_${property.id}`] 
                          : property.address}
                        originalText={property.address}
                        isTranslated={isTranslated}
                      />
                    </span>
                  </div>
                  
                  <div className="text-sm font-medium text-primary mb-3">
                    {formatPrice(property.deposit, property.monthlyRent)}
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                    <SmartTextWithTooltips 
                      text={isTranslated && translatedData[`description_${property.id}`] 
                        ? translatedData[`description_${property.id}`] 
                        : property.description}
                      originalText={property.description}
                      isTranslated={isTranslated}
                    />
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-neutral-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <Link href={`/property/${property.id}`}>
                      <Button size="sm" variant="outline">
                        {translateUI('상세보기')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}