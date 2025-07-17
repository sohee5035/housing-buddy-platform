import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState, useEffect } from "react";
import PropertyForm from "@/components/property-form";
import ImageGalleryModal from "@/components/image-gallery-modal";
import FavoriteButton from "@/components/favorite-button";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SmartTextWithTooltips from "@/components/smart-text-with-tooltips";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import CommentsSection from "@/components/comments-section";
import AdminPanel from "@/components/admin-panel";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Home as HomeIcon,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isAdmin } = useAdmin();
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTrashView, setShowTrashView] = useState(false);
  const [showCommentsView, setShowCommentsView] = useState(false);
  
  // 로컬 스토리지에서 커스텀 카테고리 가져오기
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 로컬 스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('customCategories');
        setCustomCategories(saved ? JSON.parse(saved) : []);
      } catch {
        setCustomCategories([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // 전역 번역 상태 사용
  const { 
    isTranslated, 
    translatedData, 
    targetLanguage,
    getTranslatedText 
  } = useTranslation();

  // UI 텍스트 번역 함수
  const translateUI = (koreanText: string) => {
    if (!isTranslated) return koreanText;
    
    const uiTranslations: Record<string, string> = {
      '보증금': 'Deposit',
      '월세': 'Monthly Rent', 
      '관리비': 'Maintenance Fee',
      '만원': 'K KRW',
      '편집': 'Edit',
      '삭제': 'Delete',
      '뒤로가기': 'Back',
      '미정': 'TBD',
      '알 수 없음': 'Unknown',
      '기타': 'Others',
      '상세 설명': 'Property Details',
      '추가 정보': 'Additional Information',
      '위치': 'Location',
      '원본 링크': 'Original Link',
      '원본 페이지에서 보기': 'View Original Page',
      'Google Maps에서 보기': 'View on Google Maps',
      '등록일': 'Listed Date'
    };
    
    return uiTranslations[koreanText] || koreanText;
  };

  // 모든 매물 데이터를 가져와서 카테고리 목록 구성
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Failed to fetch property");
      return response.json();
    },
  });

  // 매물의 연결된 대학교들 조회
  const { data: propertyUniversities = [] } = useQuery({
    queryKey: [`/api/properties/${id}/universities`],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}/universities`);
      if (!response.ok) return [];
      const data = await response.json();
      console.log('Property Universities API Response:', data);
      console.log('Number of universities:', data.length);
      return data;
    },
    staleTime: 0, // 항상 최신 데이터 가져오기
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "삭제 완료",
        description: "매물이 휴지통으로 이동되었습니다.",
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

  const handleDelete = () => {
    if (confirm("정말로 이 매물을 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `${translateUI('보증금')} ${depositStr}${translateUI('만원')} / ${translateUI('월세')} ${rentStr}${translateUI('만원')}`;
  };

  const formatMaintenanceFee = (fee: number | null) => {
    if (fee === null) return translateUI('미정');
    if (fee === 0) return translateUI('알 수 없음');
    return `${translateUI('관리비')} ${(fee / 10000).toLocaleString()}${translateUI('만원')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900">Housing Buddy</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">매물을 찾을 수 없습니다</h2>
          <p className="text-neutral-600 mb-4">요청하신 매물이 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 전역 번역 데이터에서 해당 매물의 번역된 텍스트 가져오기
  const getTranslatedPropertyText = (field: string) => {
    if (!isTranslated) return null;
    return translatedData[`${field}_${property.id}`] || null;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 bg-neutral-200 rounded-lg overflow-hidden">
              {property.photos && property.photos.length > 0 ? (
                <>
                  <img
                    src={property.photos[currentImageIndex]}
                    alt={getTranslatedPropertyText('title') || property.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => {
                      setSelectedImageIndex(currentImageIndex);
                      setShowImageGallery(true);
                    }}
                  />
                  {property.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? property.photos!.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === property.photos!.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {property.photos.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <HomeIcon className="h-16 w-16" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {property.photos && property.photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {property.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                    }}
                    className={`h-16 bg-neutral-200 rounded overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all ${
                      currentImageIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${getTranslatedPropertyText('title') || property.title} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {/* 연결된 대학교 정보 - 매물 제목 위에 표시 */}
                {(() => {
                  console.log('Top universities section rendering:', { propertyUniversities, length: propertyUniversities?.length });
                  return propertyUniversities && propertyUniversities.length > 0;
                })() && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {propertyUniversities.map((pu: any) => (
                        <div 
                          key={pu.universityId} 
                          className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                        >
                          <span className="text-base mr-2">{pu.university.icon}</span>
                          <span className="font-bold">{pu.university.name}</span>
                          {pu.distanceKm && (
                            <span className="ml-2 text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                              {pu.distanceKm}km
                            </span>
                          )}
                          {pu.isRecommended && (
                            <span className="ml-2 text-xs">⭐</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-neutral-900 flex-1">
                    <SmartTextWithTooltips
                      text={getTranslatedPropertyText('title') || property.title}
                      originalText={property.title}
                      isTranslated={isTranslated}
                    />
                  </h1>
                  <div className="ml-4">
                    <FavoriteButton propertyId={property.id} size="lg" variant="ghost" />
                  </div>
                </div>
                
                <div className="flex items-center text-neutral-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    <SmartTextWithTooltips
                      text={getTranslatedPropertyText('address') || property.address}
                      originalText={property.address}
                      isTranslated={isTranslated}
                    />
                  </span>
                </div>

                <div className="space-y-4">
                  {/* 가격 정보 - 더 예쁘게 표시 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-neutral-600 mb-1">{translateUI('보증금')}</div>
                        <div className="text-xl font-bold text-blue-600">
                          {(property.deposit / 10000).toLocaleString()}<span className="text-sm text-neutral-500">만원</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-neutral-600 mb-1">{translateUI('월세')}</div>
                        <div className="text-xl font-bold text-indigo-600">
                          {(property.monthlyRent / 10000).toLocaleString()}<span className="text-sm text-neutral-500">만원</span>
                        </div>
                      </div>
                    </div>
                    {property.maintenanceFee !== null && property.maintenanceFee > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-center">
                          <div className="text-sm text-neutral-600 mb-1">{translateUI('관리비')}</div>
                          <div className="text-lg font-semibold text-green-600">
                            {(property.maintenanceFee / 10000).toLocaleString()}<span className="text-sm text-neutral-500">만원</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상세 설명 - 더 예쁘게 표시 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    {translateUI('상세 설명')}
                  </h3>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      <SmartTextWithTooltips
                        text={getTranslatedPropertyText('description') || property.description}
                        originalText={property.description}
                        isTranslated={isTranslated}
                      />
                    </p>
                  </div>
                </div>

                {property.otherInfo && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                      <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                      {translateUI('추가 정보')}
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                        <SmartTextWithTooltips
                          text={getTranslatedPropertyText('otherInfo') || property.otherInfo}
                          originalText={property.otherInfo}
                          isTranslated={isTranslated}
                        />
                      </p>
                    </div>
                  </div>
                )}

                {/* 연결된 대학교 섹션 - 하단에 더 자세히 표시 */}
                {propertyUniversities && propertyUniversities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                      <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                      근처 대학교
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {propertyUniversities.map((pu: any) => (
                          <div key={pu.universityId} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-3xl mr-3">{pu.university.icon}</div>
                                <div>
                                  <div className="font-bold text-blue-900 text-base">{pu.university.name}</div>
                                  <div className="text-sm text-blue-600 font-medium">{pu.university.nameEn}</div>
                                </div>
                              </div>
                              {pu.distanceKm && (
                                <div className="text-sm text-blue-700 font-bold bg-blue-100 px-2 py-1 rounded-full">
                                  약 {pu.distanceKm}km
                                </div>
                              )}
                            </div>
                            {pu.isRecommended && (
                              <div className="mt-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm">
                                  ⭐ 추천 매물
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 지도 섹션 - 마커 포함 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                    <div className="w-1 h-6 bg-red-500 rounded-full mr-3"></div>
                    {translateUI('위치')}
                  </h3>
                  <div className="bg-neutral-100 rounded-lg overflow-hidden shadow-sm">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=16&markers=${encodeURIComponent(property.address)}`}
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${property.title} 위치`}
                    />
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-neutral-700">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>{getTranslatedPropertyText('address') || property.address}</span>
                      </div>
                      <a
                        href={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
{translateUI('Google Maps에서 보기')} →
                      </a>
                    </div>
                  </div>
                </div>

                {property.originalUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{translateUI('원본 링크')}</h3>
                    <a
                      href={property.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {translateUI('원본 페이지에서 보기')}
                    </a>
                  </div>
                )}



                <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center text-sm text-neutral-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {translateUI('등록일')}: {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>

            {/* 댓글 섹션 */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <CommentsSection propertyId={property.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>



      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>매물 편집</DialogTitle>
          </DialogHeader>
          <PropertyForm
            initialData={property}
            availableCategories={Array.from(new Set([
              '기타',
              ...allProperties.map(p => p.category).filter((cat): cat is string => Boolean(cat)),
              ...customCategories
            ]))}
            onSuccess={() => {
              setShowEditModal(false);
              queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
              queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
              toast({
                title: "수정 완료",
                description: "매물 정보가 성공적으로 수정되었습니다.",
              });
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      {property && property.photos && property.photos.length > 0 && (
        <ImageGalleryModal
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
          images={property.photos}
          initialIndex={selectedImageIndex}
          title={getTranslatedPropertyText('title') || property.title}
        />
      )}

      {/* Floating Admin Buttons - Property Detail Page */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              title="매물 편집"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("정말로 이 매물을 삭제하시겠습니까?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="shadow-lg rounded-full w-12 h-12 p-0"
              title="매물 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}