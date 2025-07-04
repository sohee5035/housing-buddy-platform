import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState } from "react";
import PropertyForm from "@/components/property-form";
import AdminAuth from "@/components/admin-auth";
import ImageGalleryModal from "@/components/image-gallery-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SmartTextWithTooltips from "@/components/smart-text-with-tooltips";
import { useTranslation } from "@/contexts/TranslationContext";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Home as HomeIcon,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminAction, setAdminAction] = useState<'edit' | 'delete'>('edit');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
      '기타': 'Others'
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
                <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                className="flex items-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/");
                }}
              >
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900 whitespace-nowrap">부동산 매물</h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {translateUI('뒤로가기')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAdminAction('edit');
                  setShowAdminAuth(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {translateUI('편집')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setAdminAction('delete');
                  setShowAdminAuth(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {translateUI('삭제')}
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                      setSelectedImageIndex(index);
                      setShowImageGallery(true);
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
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                  <SmartTextWithTooltips
                    text={getTranslatedPropertyText('title') || property.title}
                    originalText={property.title}
                    isTranslated={isTranslated}
                  />
                </h1>
                
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
                    상세 설명
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
                      추가 정보
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

                {/* 지도 섹션 - 마커 포함 */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                    <div className="w-1 h-6 bg-red-500 rounded-full mr-3"></div>
                    위치
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
                        Google Maps에서 보기 →
                      </a>
                    </div>
                  </div>
                </div>

                {property.originalUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">원본 링크</h3>
                    <a
                      href={property.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      원본 페이지에서 보기
                    </a>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center text-sm text-neutral-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  등록일: {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
        title={adminAction === 'edit' ? '매물 편집' : '매물 삭제'}
        description={adminAction === 'edit' 
          ? '매물 정보를 편집하려면 관리자 인증이 필요합니다.' 
          : '매물을 삭제하려면 관리자 인증이 필요합니다.'
        }
      />

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>매물 편집</DialogTitle>
          </DialogHeader>
          <PropertyForm
            initialData={property}
            availableCategories={Array.from(new Set(allProperties.map(p => p.category).filter((cat): cat is string => Boolean(cat))))}
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
    </div>
  );
}