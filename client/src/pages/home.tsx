import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import PropertyForm from "@/components/property-form";
import AdminAuth from "@/components/admin-auth";
import CategoryManager from "@/components/category-manager";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Home as HomeIcon, MapPin, Calendar, Trash2, Tags, X, Settings, Languages, Globe, RotateCcw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/contexts/TranslationContext";
import { translateText, supportedLanguages } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [adminAction, setAdminAction] = useState<'create' | 'trash' | 'category'>('create');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  
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

  const { data: properties = [], isLoading, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  // Translation mutation for bulk translating all properties
  const translateMutation = useMutation({
    mutationFn: async ({ targetLang }: { targetLang: string }) => {
      const translations: Record<string, string> = {};
      
      for (const property of properties) {
        // Translate each text field
        const fieldsToTranslate = [
          { key: `title_${property.id}`, text: property.title },
          { key: `address_${property.id}`, text: property.address },
          { key: `description_${property.id}`, text: property.description },
          { key: `category_${property.id}`, text: property.category || '기타' },
        ];
        
        if (property.otherInfo) {
          fieldsToTranslate.push({ key: `otherInfo_${property.id}`, text: property.otherInfo });
        }

        for (const field of fieldsToTranslate) {
          try {
            const result = await translateText(field.text, targetLang);
            translations[field.key] = result.translatedText;
          } catch (error) {
            console.error(`Failed to translate ${field.key}:`, error);
            translations[field.key] = field.text; // Fallback to original
          }
        }
      }
      
      return translations;
    },
    onSuccess: (translations) => {
      console.log('Translation successful, setting data:', translations);
      setTranslatedData(prevData => ({
        ...prevData,
        ...translations
      }));
      setIsTranslated(true);
      setTargetLanguage(targetLanguage);
      toast({
        title: "번역 완료",
        description: `모든 매물이 ${supportedLanguages.find(l => l.code === targetLanguage)?.name}로 번역되었습니다.`,
      });
    },
    onError: (error) => {
      toast({
        title: "번역 실패",
        description: "번역 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleTranslateAll = () => {
    if (properties.length === 0) {
      toast({
        title: "번역할 매물이 없습니다",
        description: "먼저 매물을 등록해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    translateMutation.mutate({ targetLang: targetLanguage });
  };

  const handleRestoreOriginal = () => {
    clearTranslations();
    toast({
      title: "원본 복원",
      description: "모든 매물이 원래 한국어로 복원되었습니다.",
    });
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
      '알 수 없음': 'Unknown'
    };
    
    return uiTranslations[koreanText] || koreanText;
  };

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `${translateUI('보증금')} ${depositStr}${translateUI('만원')} / ${translateUI('월세')} ${rentStr}${translateUI('만원')}`;
  };

  // 카테고리별 매물 필터링
  const filteredProperties = properties.filter(property => {
    if (selectedCategory === '전체') return true;
    return property.category === selectedCategory;
  });

  // 사용 가능한 카테고리 목록 생성 (매물에서 실제 사용된 카테고리들 + 커스텀 카테고리들)
  const propertyCategories = Array.from(new Set(properties.map(p => p.category || '기타').filter(Boolean)));
  const allCategories = Array.from(new Set([...propertyCategories, ...customCategories]));
  const availableCategories = ['전체', ...allCategories];
  
  // 매물 등록 폼에 전달할 전체 카테고리 목록
  const formCategories = Array.from(new Set([...allCategories, ...customCategories]));



  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="flex items-center justify-center py-4 border-b border-neutral-100">
            <HomeIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
          </div>
          
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
                          번역중
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-1" />
                          전체번역
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
                    원본복원
                  </Button>
                )}
              </div>

              <Button 
                variant="outline"
                onClick={() => {
                  setAdminAction('category');
                  setShowAdminAuth(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                카테고리 관리
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setAdminAction('trash');
                  setShowAdminAuth(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {translateUI('휴지통')}
              </Button>
              <Button onClick={() => {
                setAdminAction('create');
                setShowAdminAuth(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                {translateUI('매물 등록')}
              </Button>
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
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">등록된 매물</h2>
          <p className="text-neutral-600">
            {selectedCategory === '전체' 
              ? `총 ${properties.length}개의 매물이 등록되어 있습니다.`
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
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">등록된 매물이 없습니다</h3>
            <p className="text-neutral-600 mb-6">첫 번째 매물을 등록해보세요!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              매물 등록하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
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
                  </div>
                </Link>
                
                <CardContent className="p-4">
                  <Link href={`/property/${property.id}`}>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-1">
                      {isTranslated && translatedData[`title_${property.id}`] 
                        ? translatedData[`title_${property.id}`] 
                        : property.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center text-sm text-neutral-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {isTranslated && translatedData[`address_${property.id}`] 
                        ? translatedData[`address_${property.id}`] 
                        : property.address}
                    </span>
                  </div>
                  
                  <div className="text-sm font-medium text-primary mb-3">
                    {formatPrice(property.deposit, property.monthlyRent)}
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                    {isTranslated && translatedData[`description_${property.id}`] 
                      ? translatedData[`description_${property.id}`] 
                      : property.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-neutral-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <Link href={`/property/${property.id}`}>
                      <Button size="sm" variant="outline">{translateUI('상세보기')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Admin Authentication */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onSuccess={() => {
          setShowAdminAuth(false);
          if (adminAction === 'create') {
            setShowCreateModal(true);
          } else if (adminAction === 'trash') {
            setLocation('/trash');
          } else if (adminAction === 'category') {
            setShowCategoryManager(true);
          }
        }}
        title={
          adminAction === 'create' ? "매물 등록 권한 확인" : 
          adminAction === 'trash' ? "휴지통 접근 권한 확인" :
          "카테고리 관리 권한 확인"
        }
        description={
          adminAction === 'create' ? "매물을 등록하려면 관리자 비밀번호가 필요합니다." : 
          adminAction === 'trash' ? "휴지통에 접근하려면 관리자 비밀번호가 필요합니다." :
          "카테고리를 관리하려면 관리자 비밀번호가 필요합니다."
        }
      />

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
        onUpdateCategories={setCustomCategories}
        propertyCategories={propertyCategories}
      />

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 md:hidden shadow-lg"
        size="icon"
        onClick={() => setShowAdminAuth(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
