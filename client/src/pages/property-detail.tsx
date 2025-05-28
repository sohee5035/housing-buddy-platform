import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState } from "react";
import PropertyForm from "@/components/property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  ChevronRight
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `보증금 ${depositStr}만원 / 월세 ${rentStr}만원`;
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 매물을 삭제하시겠습니까?")) {
      deleteMutation.mutate();
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
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-neutral-500 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.address}</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(property.deposit, property.monthlyRent)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">상세 설명</h3>
              <p className="text-neutral-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Other Info */}
            {property.otherInfo && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">기타 정보</h3>
                <p className="text-neutral-600">{property.otherInfo}</p>
              </div>
            )}

            {/* Created Date */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">등록 정보</h3>
              <div className="flex items-center text-neutral-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>등록일: {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}</span>
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
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
