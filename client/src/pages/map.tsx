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
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">🏠 Housing Buddy</h1>
            <Badge variant="secondary" className="text-sm">
              지도 기반 매물 탐색
            </Badge>
          </div>
        </div>
      </div>

      {/* 간단한 필터 바 */}
      <div className="bg-white border-b p-3 sticky top-[73px] z-30">
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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* 지도 영역 */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-100">
            {/* Google Maps iframe - 서울 동작구 대방동 중심 */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25297.034899!2d126.914!3d37.509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c9fb76f936a77%3A0x1!2z7ISc7Jq47Yq567OE7IucIOuPmeyCrOq1rCDrjIXrsqntlZk!5e0!3m2!1sko!2skr!4v1634567890123!5m2!1sko!2skr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full rounded-none"
              title="서울 대방동 매물 지도"
            ></iframe>
            
            {/* 매물 마커 시뮬레이션 (향후 실제 Google Maps API로 대체) */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="absolute pointer-events-auto cursor-pointer z-10"
                  style={{
                    // 대방동, 상도동, 신길동 위치를 임시로 시뮬레이션
                    left: `${25 + (index * 12)}%`,
                    top: `${35 + (index * 8)}%`,
                  }}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {Math.round(property.monthlyRent / 10000)}만원
                  </div>
                </div>
              ))}
            </div>
            
            {/* 지도 위 정보 */}
            <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg z-10">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">{filteredProperties.length}개 매물</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">서울 동작구 중심</p>
            </div>
          </div>
        </div>

        {/* 매물 리스트 영역 */}
        <div className="w-full lg:w-80 bg-white border-l overflow-y-auto">
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