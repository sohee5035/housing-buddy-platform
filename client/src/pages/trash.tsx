import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Home as HomeIcon,
  MapPin,
  Calendar
} from "lucide-react";

export default function Trash() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deletedProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/trash"],
    queryFn: async () => {
      console.log("Fetching trash data...");
      const response = await fetch("/api/trash");
      console.log("Trash response status:", response.status);
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      if (!response.ok) throw new Error("Failed to fetch deleted properties");
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed trash data:", data);
      } catch (e) {
        console.log("JSON parse error:", e);
        throw new Error("Invalid JSON response");
      }
      
      return data;
    },
    staleTime: 0,
    cacheTime: 0,
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/trash/${id}/restore`);
      if (!response.ok) throw new Error("Failed to restore property");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "매물 복원 성공",
        description: "매물이 성공적으로 복원되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "복원 실패",
        description: "매물 복원 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/trash/${id}`);
      if (!response.ok) throw new Error("Failed to permanently delete property");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trash"] });
      toast({
        title: "영구 삭제 완료",
        description: "매물이 영구적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "매물 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleRestore = (id: number) => {
    if (window.confirm("이 매물을 복원하시겠습니까?")) {
      restoreMutation.mutate(id);
    }
  };

  const handlePermanentDelete = (id: number) => {
    if (window.confirm("정말로 이 매물을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      permanentDeleteMutation.mutate(id);
    }
  };

  const formatPrice = (deposit: number, monthlyRent: number) => {
    const depositStr = deposit ? (deposit / 10000).toLocaleString() : '0';
    const rentStr = monthlyRent ? (monthlyRent / 10000).toLocaleString() : '0';
    return `보증금 ${depositStr}만원 / 월세 ${rentStr}만원`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-neutral-900">휴지통</h1>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Deleted Properties */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">삭제된 매물</h2>
          <p className="text-neutral-600">
            총 {deletedProperties.length}개의 삭제된 매물이 있습니다. 
            복원하거나 영구적으로 삭제할 수 있습니다.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : deletedProperties.length === 0 ? (
          <div className="text-center py-16">
            <Trash2 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">휴지통이 비어있습니다</h3>
            <p className="text-neutral-600 mb-6">삭제된 매물이 없습니다.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                매물 목록으로 이동
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                <div className="relative h-48 bg-neutral-200">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      <HomeIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    삭제됨
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-neutral-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property.address}</span>
                  </div>
                  
                  <div className="text-sm font-medium text-primary mb-3">
                    {formatPrice(property.deposit, property.monthlyRent)}
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-xs text-neutral-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      삭제일: {property.deletedAt && new Date(property.deletedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(property.id)}
                      disabled={restoreMutation.isPending}
                      className="flex-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      복원
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePermanentDelete(property.id)}
                      disabled={permanentDeleteMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      영구삭제
                    </Button>
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