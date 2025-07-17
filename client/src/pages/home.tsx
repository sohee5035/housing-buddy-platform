import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import PropertyForm from "@/components/property-form";
import CategoryManager from "@/components/category-manager";
import PropertyCard from "@/components/property-card";

import SmartTextWithTooltips from "@/components/smart-text-with-tooltips";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Home as HomeIcon, MapPin, Calendar, Trash2, Tags, X, Settings, Languages, Globe, RotateCcw, ShieldCheck, LogOut, GraduationCap } from "lucide-react";
import FavoriteButton from "@/components/favorite-button";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/admin-login";
import AdminPanel from "@/components/admin-panel";
import Navbar from "@/components/navbar";
import { translateText, supportedLanguages } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";



export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [, setLocation] = useLocation();
  

  
  // URL 쿼리 파라미터에서 대학교 ID 추출
  const urlParams = new URLSearchParams(window.location.search);
  const universityFilter = urlParams.get('university');

  // 대학교 정보 가져오기 (필터링된 대학교 이름 표시용)
  const { data: universities = [] } = useQuery({
    queryKey: ["/api/universities"],
    queryFn: async () => {
      const response = await fetch("/api/universities");
      if (!response.ok) throw new Error("Failed to fetch universities");
      return response.json();
    },
  });

  // 선택된 대학교 정보
  const selectedUniversity = universities.find(
    (uni: any) => uni.id === parseInt(universityFilter || '0')
  );
  
  // Translation context
  const { 
    isTranslated, 
    translatedData,
    targetLanguage, 
    setTargetLanguage, 
    setTranslatedData, 
    setIsTranslated, 
    clearTranslations,
    getTranslatedText 
  } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, logout } = useAdmin();

  // 번역 상태 변경 시 로깅
  useEffect(() => {
    console.log('🌍 홈 페이지 번역 상태 변경:', {
      isTranslated,
      targetLanguage,
      translatedDataKeys: Object.keys(translatedData),
      translatedDataSample: Object.fromEntries(Object.entries(translatedData).slice(0, 3))
    });
  }, [isTranslated, translatedData, targetLanguage]);

  const { data: properties = [], isLoading, error, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties", {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      console.log(`❌ 재시도 ${failureCount}번째:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });



  // Translation mutation using bulk translation API
  const translateMutation = useMutation({
    mutationFn: async ({ targetLang }: { targetLang: string }) => {
      console.log('메인 페이지 매물 번역 시작:', { targetLang, propertiesCount: properties.length });
      
      // 매물 번역 API 호출
      const response = await fetch('/api/translate-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: properties,
          targetLang: targetLang
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('매물 번역 응답:', data);
      
      return data.translations || {};
    },
    onSuccess: (translations) => {
      console.log('메인 페이지 번역 성공:', { translationsCount: Object.keys(translations).length, translations });
      setTranslatedData(prevData => ({
        ...prevData,
        ...translations
      }));
      setIsTranslated(true);
      setTargetLanguage(targetLanguage);
      // 조용한 번역 - 토스트 메시지 제거
      console.log(`매물 번역 완료: ${supportedLanguages.find(l => l.code === targetLanguage)?.name}`);
    },
    onError: (error) => {
      console.error('메인 페이지 번역 실패:', error);
      // 조용한 번역 - 토스트 메시지 제거
    },
  });

  const handleTranslateAll = () => {
    if (properties.length === 0) {
      console.log('번역할 매물이 없습니다');
      return;
    }
    
    console.log('매물 번역 시작:', { targetLanguage, propertiesCount: properties.length });
    translateMutation.mutate({ targetLang: targetLanguage });
  };

  const handleRestoreOriginal = () => {
    clearTranslations();
    console.log('원본 텍스트로 복원 완료');
    // 조용한 번역 - 토스트 메시지 제거
  };

  // UI 텍스트 번역 함수
  const translateUI = (koreanText: string) => {
    if (!isTranslated) return koreanText;
    
    const uiTranslations: Record<string, string> = {
      '보증금': 'Deposit',
      '월세': 'Monthly Rent',
      '관리비': 'Maintenance Fee',
      '만원': 'K KRW',
      '전체': 'All',
      '기타': 'Others',
      '매물 등록': 'Add Property',
      '휴지통': 'Trash',
      '상세보기': 'View Details',
      '미정': 'TBD',
      '알 수 없음': 'Unknown',
      '등록된 매물': 'Property Listings',
      '개의 매물이 등록되어 있습니다': 'properties are listed',
      '총': 'Total',
      '매물이 없습니다': 'No properties available',
      '검색 결과가 없습니다': 'No search results found',
      '님 안녕하세요!': ', Hello!'
    };
    
    return uiTranslations[koreanText] || koreanText;
  };

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `${translateUI('보증금')} ${depositStr}${translateUI('만원')} / ${translateUI('월세')} ${rentStr}${translateUI('만원')}`;
  };

  // 모든 매물의 대학교 관계 데이터 가져오기 
  const { data: allPropertyUniversities = [] } = useQuery({
    queryKey: ["/api/properties/universities"],
    queryFn: async () => {
      const response = await fetch("/api/properties/universities");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // 카테고리별 및 대학교별 매물 필터링
  const filteredProperties = properties.filter(property => {
    // 카테고리 필터
    if (selectedCategory !== '전체' && property.category !== selectedCategory) {
      return false;
    }
    
    // 대학교 필터 (URL 파라미터 기반)
    if (universityFilter) {
      // 해당 대학교와 연결된 매물인지 확인
      const hasUniversity = allPropertyUniversities.some(
        (pu: any) => pu.propertyId === property.id && pu.universityId === parseInt(universityFilter)
      );
      return hasUniversity;
    }
    
    return true;
  });
  


  // 사용 가능한 카테고리 목록 생성 (매물에서 실제 사용된 카테고리들 + 커스텀 카테고리들)
  const propertyCategories = Array.from(new Set(properties.map(p => p.category || '기타').filter(Boolean)));
  const allCategories = Array.from(new Set([...propertyCategories, ...customCategories]));
  const availableCategories = ['전체', ...allCategories];
  
  // 매물 등록 폼에 전달할 전체 카테고리 목록 (기본 카테고리 포함)
  const formCategories = Array.from(new Set(['기타', ...allCategories]));



  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <Navbar onCreateListing={() => setShowCreateModal(true)} />
      
      {/* Header with Controls */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Translation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {!isTranslated ? (
                  <>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-32 sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline"
                      onClick={handleTranslateAll}
                      disabled={translateMutation.isPending}
                      size="sm"
                    >
                      {translateMutation.isPending ? (
                        <>
                          <Languages className="h-4 w-4 mr-1 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-1" />
                          Translate All
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={handleRestoreOriginal}
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore Original
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("🔄 수동 새로고침 버튼 클릭");
                    refetch();
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>


            </div>
          </div>
        </div>
      </header>



      {/* Category Filter */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Tags className="h-4 w-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">카테고리</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {translateUI(category)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Property List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-neutral-900">
              {universityFilter && selectedUniversity ? 
                `${selectedUniversity.name} 주변 매물` : 
                translateUI('등록된 매물')}
            </h2>
            {universityFilter && selectedUniversity && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/properties'}
                className="text-sm"
              >
                전체보기
              </Button>
            )}
          </div>
          <p className="text-neutral-600">
            {universityFilter && selectedUniversity ? 
              `${selectedUniversity.name} 관련 매물 ${filteredProperties.length}개를 찾았습니다` : 
              selectedCategory === '전체' 
                ? `${translateUI('총')} ${filteredProperties.length}${translateUI('개의 매물이 등록되어 있습니다')}.`
                : `'${selectedCategory}' 카테고리에 ${filteredProperties.length}개의 매물이 있습니다.`
            }
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-neutral-200 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 bg-neutral-200 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-neutral-200 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <HomeIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">{translateUI('매물이 없습니다')}</h3>
            <p className="text-neutral-600 mb-6">
              {isAdmin ? "첫 번째 매물을 등록해보세요!" : "매물이 등록되면 여기에 표시됩니다."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {translateUI('매물 등록')}하기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              console.log('📋 매물 렌더링 직전 상태:', {
                propertiesCount: filteredProperties.length,
                isTranslated,
                targetLanguage,
                translatedDataKeys: Object.keys(translatedData),
                propertyIds: filteredProperties.map(p => p.id)
              });
              return filteredProperties.map((property) => (
                <PropertyCard 
                  key={`property-${property.id}-${targetLanguage}-${isTranslated}-${Object.keys(translatedData).length}`}
                  property={property}
                  onTranslate={() => {}} // 빈 함수 - 메인 페이지에서는 개별 번역 버튼 불필요
                  viewMode="grid"
                />
              ));
            })()}
          </div>
        )}
      </main>

      {/* Create Property Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PropertyForm 
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
            onCancel={() => setShowCreateModal(false)}
            availableCategories={formCategories}
            key={`${allCategories.join(',')}-${customCategories.join(',')}`}
          />
        </DialogContent>
      </Dialog>

      {/* Category Manager */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        customCategories={customCategories}
        onUpdateCategories={(categories) => {
          setCustomCategories(categories);
          localStorage.setItem('customCategories', JSON.stringify(categories));
        }}
        propertyCategories={propertyCategories}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      {/* Floating Admin Menu - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isAdmin ? (
          <Button
            type="button"
            onClick={() => setShowAdminLogin(true)}
            className="bg-neutral-600 hover:bg-neutral-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
            title="관리자 로그인"
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
        ) : (
          <AdminPanel
            onCreateListing={() => setShowCreateModal(true)}
            onCategoryManager={() => setShowCategoryManager(true)}
            onTrashView={() => window.location.href = "/trash"}
            onCommentsView={() => window.location.href = "/admin/comments"}
            onLogout={() => {
              logout();
              toast({
                title: "로그아웃",
                description: "관리자 모드에서 로그아웃되었습니다.",
              });
            }}
          />
        )}
      </div>

    </div>
  );
}
