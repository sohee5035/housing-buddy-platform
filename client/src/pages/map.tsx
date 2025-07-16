import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Filter, Search } from "lucide-react";
import { Property } from "@/shared/schema";
// import PropertyCard from "@/components/property-card-simple";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface MapFilters {
  minDeposit: string;
  maxDeposit: string;
  minRent: string;
  maxRent: string;
  category: string;
  moveInDate: string;
}

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilters>({
    minDeposit: "",
    maxDeposit: "",
    minRent: "",
    maxRent: "",
    category: "",
    moveInDate: "",
  });
  
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [showNLDialog, setShowNLDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const filteredProperties = properties.filter(property => {
    if (filters.minDeposit && property.deposit < parseInt(filters.minDeposit)) return false;
    if (filters.maxDeposit && property.deposit > parseInt(filters.maxDeposit)) return false;
    if (filters.minRent && property.monthlyRent < parseInt(filters.minRent)) return false;
    if (filters.maxRent && property.monthlyRent > parseInt(filters.maxRent)) return false;
    if (filters.category && property.category !== filters.category) return false;
    return true;
  });

  const handleNaturalLanguageSubmit = () => {
    // TODO: 자연어 처리 및 필터 자동 설정
    console.log("자연어 입력:", naturalLanguageInput);
    
    // 간단한 키워드 추출 예시
    const input = naturalLanguageInput.toLowerCase();
    
    if (input.includes("원룸")) {
      setFilters(prev => ({ ...prev, category: "원룸" }));
    }
    if (input.includes("투룸")) {
      setFilters(prev => ({ ...prev, category: "투룸" }));
    }
    
    // 가격 추출 (예: "50만원 이하")
    const priceMatch = input.match(/(\d+)만원/);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]) * 10000;
      if (input.includes("이하")) {
        setFilters(prev => ({ ...prev, maxRent: price.toString() }));
      }
    }
    
    setShowNLDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 간단한 헤더 */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">🗺️ 지도로 매물 찾기</h1>
        <Badge variant="secondary" className="text-sm">
          {filteredProperties.length}개 매물
        </Badge>
      </div>

      {/* 간단한 필터 바 */}
      <div className="bg-white border-b p-3 z-30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">전체 유형</option>
                <option value="원룸">원룸</option>
                <option value="투룸">투룸</option>
                <option value="오피스텔">오피스텔</option>
              </select>
              
              <Input
                placeholder="최대 월세 (만원)"
                value={filters.maxRent}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value }))}
                className="w-32 text-sm"
                type="number"
              />
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showNLDialog} onOpenChange={setShowNLDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden md:inline">자연어 검색</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>원하는 집에 대해 설명해주세요</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="예: 학교 근처 원룸, 월세 50만원 이하로 찾고 있어요"
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowNLDialog(false)}>
                        취소
                      </Button>
                      <Button onClick={handleNaturalLanguageSubmit}>
                        검색
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  minDeposit: "",
                  maxDeposit: "",
                  minRent: "",
                  maxRent: "",
                  category: "",
                  moveInDate: "",
                })}
              >
                초기화
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
        {/* 지도 영역 */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-full">
          <div className="w-full h-full relative">
            {/* Google Maps iframe */}
            <iframe
              src="https://maps.google.com/maps?q=서울특별시+동작구&output=embed&z=13&t=m"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Housing Buddy 매물 지도"
              className="w-full h-full"
            />
            
            {/* 지도 위 정보 오버레이 */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-xl z-10 border">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">{filteredProperties.length}개 매물</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">서울 동작구 실시간</p>
            </div>
            
            {/* 매물 위치 가이드 */}
            <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-xl z-10 border max-w-xs">
              <h3 className="font-semibold text-sm mb-2">매물 위치</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div>• 대방동: {filteredProperties.filter(p => p.address.includes('대방동')).length}개</div>
                <div>• 상도동: {filteredProperties.filter(p => p.address.includes('상도동')).length}개</div>
                <div>• 신길동: {filteredProperties.filter(p => p.address.includes('신길동')).length}개</div>
              </div>
            </div>
          </div>
        </div>

        {/* 매물 리스트 영역 */}
        <div className="w-full lg:w-80 bg-white border-l lg:border-t-0 border-t overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">매물 목록</h3>
            <p className="text-sm text-muted-foreground">
              총 {filteredProperties.length}개 매물
            </p>
          </div>
          
          <div className="space-y-4 p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">매물을 불러오는 중...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">조건에 맞는 매물이 없습니다</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFilters({
                    minDeposit: "",
                    maxDeposit: "",
                    minRent: "",
                    maxRent: "",
                    category: "",
                    moveInDate: "",
                  })}
                >
                  필터 초기화
                </Button>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedProperty(property)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {property.photos && property.photos.length > 0 && (
                        <img
                          src={property.photos[0]}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{property.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {property.address}
                        </p>
                        <div className="flex gap-1 mt-2 text-xs">
                          <Badge variant="outline">{property.category}</Badge>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="font-medium text-blue-600">
                            보증금 {property.deposit.toLocaleString()}원
                          </span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="font-medium text-green-600">
                            월세 {property.monthlyRent.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}