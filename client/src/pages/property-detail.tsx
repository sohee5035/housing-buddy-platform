import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState } from "react";
import PropertyForm from "@/components/property-form";
import AdminAuth from "@/components/admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Home as HomeIcon,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translatedContent, setTranslatedContent] = useState<{
    title?: string;
    description?: string;
    otherInfo?: string;
  }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminAction, setAdminAction] = useState<'edit' | 'delete'>('edit');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 모든 매물 데이터를 가져와서 카테고리 목록 구성
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  // 사용 가능한 카테고리 목록 생성
  const availableCategories = Array.from(new Set(allProperties.map(p => p.category || '기타').filter(Boolean)));

  const supportedLanguages = [
    { code: "ko", name: "한국어 (원본)" },
    { code: "en", name: "English (영어)" },
    { code: "ja", name: "日本語 (일본어)" },
    { code: "zh", name: "中文 (중국어)" },
    { code: "zh-TW", name: "繁體中文 (번체중국어)" },
    { code: "es", name: "Español (스페인어)" },
    { code: "fr", name: "Français (프랑스어)" },
    { code: "de", name: "Deutsch (독일어)" },
    { code: "it", name: "Italiano (이탈리아어)" },
    { code: "pt", name: "Português (포르투갈어)" },
    { code: "ru", name: "Русский (러시아어)" },
    { code: "ar", name: "العربية (아랍어)" },
    { code: "hi", name: "हिन्दी (힌디어)" },
    { code: "th", name: "ไทย (태국어)" },
    { code: "vi", name: "Tiếng Việt (베트남어)" },
    { code: "nl", name: "Nederlands (네덜란드어)" },
    { code: "sv", name: "Svenska (스웨덴어)" },
    { code: "da", name: "Dansk (덴마크어)" },
    { code: "no", name: "Norsk (노르웨이어)" },
    { code: "fi", name: "Suomi (핀란드어)" },
    { code: "pl", name: "Polski (폴란드어)" }
  ];

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      if (!response.ok) throw new Error("Failed to delete property");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "삭제 완료",
        description: "매물이 성공적으로 삭제되었습니다.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "매물 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json();
    },
  });

  const nextImage = () => {
    if (property?.photos && property.photos.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.photos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.photos && property.photos.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.photos!.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (deposit: number, monthlyRent: number, maintenanceFee?: number | null) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    const maintenanceStr = maintenanceFee ? (maintenanceFee / 10000).toLocaleString() : null;
    
    let priceText = `보증금 ${depositStr}만원 / 월세 ${rentStr}만원`;
    if (maintenanceStr) {
      priceText += ` / 관리비 ${maintenanceStr}만원`;
    } else {
      priceText += ' / 관리비 알 수 없음';
    }
    return priceText;
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 매물을 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

  const handleTranslate = async () => {
    if (!selectedLanguage || !property) return;
    
    setIsTranslating(true);
    setShowTranslationModal(false);
    
    // 한국어를 선택한 경우 원본으로 돌아가기
    if (selectedLanguage === "ko") {
      setShowOriginal(true);
      setTranslatedContent({});
      setIsTranslating(false);
      toast({
        title: "원본 표시",
        description: "한국어 원본으로 되돌렸습니다.",
      });
      return;
    }
    
    try {
      const translations = await Promise.all([
        apiRequest("POST", "/api/translate", { text: property.title, targetLang: selectedLanguage }),
        apiRequest("POST", "/api/translate", { text: property.description, targetLang: selectedLanguage }),
        property.otherInfo ? apiRequest("POST", "/api/translate", { text: property.otherInfo, targetLang: selectedLanguage }) : null
      ]);

      const [titleRes, descRes, otherInfoRes] = translations;
      
      const translatedData = {
        title: (await titleRes.json()).translatedText,
        description: (await descRes.json()).translatedText,
        otherInfo: otherInfoRes ? (await otherInfoRes.json()).translatedText : property.otherInfo
      };
      
      setTranslatedContent(translatedData);
      setShowOriginal(false);
      
      toast({
        title: "번역 완료",
        description: "매물 정보가 성공적으로 번역되었습니다.",
      });
    } catch (error) {
      toast({
        title: "번역 실패",
        description: "번역 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-4">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-4 text-center py-16">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">매물을 찾을 수 없습니다</h1>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowTranslationModal(true)}
              >
                <Languages className="h-4 w-4 mr-2" />
                번역
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAdminAction('edit');
                  setShowAdminAuth(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setAdminAction('delete');
                  setShowAdminAuth(true);
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto p-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로 돌아가기
        </Button>

        {/* Image Gallery */}
        <div className="relative h-96 bg-neutral-200 rounded-2xl overflow-hidden mb-8">
          {property.photos && property.photos.length > 0 ? (
            <>
              <img
                src={property.photos[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {property.photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {property.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              <div className="text-center">
                <HomeIcon className="h-16 w-16 mb-4 mx-auto" />
                <div>등록된 사진이 없습니다</div>
              </div>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {showOriginal ? property.title : (translatedContent.title || property.title)}
                </h1>
                {!showOriginal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOriginal(true)}
                  >
                    원본 보기
                  </Button>
                )}
              </div>
              <div className="flex items-center text-neutral-500 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.address}</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(property.deposit, property.monthlyRent, property.maintenanceFee)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">상세 설명</h3>
              <p className="text-neutral-600 leading-relaxed">
                {showOriginal ? property.description : (translatedContent.description || property.description)}
              </p>
            </div>

            {/* Other Info */}
            {property.otherInfo && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">기타 정보</h3>
                <p className="text-neutral-600">
                  {showOriginal ? property.otherInfo : (translatedContent.otherInfo || property.otherInfo)}
                </p>
              </div>
            )}

            {/* Original URL */}
            {property.originalUrl && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">원본 페이지</h3>
                <a 
                  href={property.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary/80 underline"
                >
                  원본 매물 페이지 보기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Created Date */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">등록 정보</h3>
              <div className="flex items-center text-neutral-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>등록일: {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center text-neutral-600">
                <span className="w-4 h-4 mr-2 text-center">📂</span>
                <span>카테고리: {property.category || '기타'}</span>
              </div>
            </div>
          </div>

          {/* Property Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">매물 요약</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">보증금</span>
                    <span className="font-medium">{(property.deposit / 10000).toLocaleString()}만원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">월세</span>
                    <span className="font-medium">{(property.monthlyRent / 10000).toLocaleString()}만원</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">등록일</span>
                      <span className="font-medium">
                        {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Translation Modal */}
      <Dialog open={showTranslationModal} onOpenChange={setShowTranslationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>매물 번역</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">번역할 언어 선택</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="언어를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleTranslate} 
                disabled={!selectedLanguage || isTranslating}
                className="flex-1"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    번역 중...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    번역하기
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowTranslationModal(false)}>
                닫기
              </Button>
            </div>

            {translatedContent && (
              <div className="mt-6 space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">번역 결과</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">원본</h4>
                    <p className="text-sm border rounded p-2 bg-neutral-50">{property?.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">번역</h4>
                    <p className="text-sm border rounded p-2 bg-blue-50">{translatedContent.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">주소 (원본)</h4>
                    <p className="text-sm border rounded p-2 bg-neutral-50">{property?.address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">주소 (번역)</h4>
                    <p className="text-sm border rounded p-2 bg-blue-50">{translatedContent.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">설명 (원본)</h4>
                    <p className="text-sm border rounded p-2 bg-neutral-50 max-h-32 overflow-y-auto">{property?.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-neutral-600 mb-1">설명 (번역)</h4>
                    <p className="text-sm border rounded p-2 bg-blue-50 max-h-32 overflow-y-auto">{translatedContent.description}</p>
                  </div>
                </div>

                {property?.otherInfo && translatedContent.otherInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-neutral-600 mb-1">기타 정보 (원본)</h4>
                      <p className="text-sm border rounded p-2 bg-neutral-50">{property.otherInfo}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-neutral-600 mb-1">기타 정보 (번역)</h4>
                      <p className="text-sm border rounded p-2 bg-blue-50">{translatedContent.otherInfo}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Authentication */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onSuccess={() => {
          setShowAdminAuth(false);
          if (adminAction === 'edit') {
            setShowEditModal(true);
          } else if (adminAction === 'delete') {
            handleDelete();
          }
        }}
        title={adminAction === 'edit' ? "매물 수정 권한 확인" : "매물 삭제 권한 확인"}
        description={adminAction === 'edit' ? "매물을 수정하려면 관리자 비밀번호가 필요합니다." : "매물을 삭제하려면 관리자 비밀번호가 필요합니다."}
      />

      {/* Edit Property Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PropertyForm 
            initialData={property}
            onSuccess={() => {
              setShowEditModal(false);
              queryClient.invalidateQueries({ queryKey: ["/api/properties", id] });
              toast({
                title: "수정 완료",
                description: "매물이 성공적으로 수정되었습니다.",
              });
            }}
            onCancel={() => setShowEditModal(false)}
            availableCategories={availableCategories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
