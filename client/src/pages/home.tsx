import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import PropertyForm from "@/components/property-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Home as HomeIcon, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: properties = [], isLoading, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

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
              <h1 className="text-2xl font-bold text-neutral-900">부동산 매물</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/trash">
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  휴지통
                </Button>
              </Link>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                매물 등록
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Property List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">등록된 매물</h2>
          <p className="text-neutral-600">총 {properties.length}개의 매물이 등록되어 있습니다.</p>
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
        ) : properties.length === 0 ? (
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
            {properties.map((property) => (
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
                      {property.title}
                    </h3>
                  </Link>
                  
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-neutral-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {property.createdAt && new Date(property.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <Link href={`/property/${property.id}`}>
                      <Button size="sm" variant="outline">상세보기</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
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
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 md:hidden shadow-lg"
        size="icon"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
