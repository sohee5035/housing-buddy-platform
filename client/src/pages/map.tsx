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
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
            {/* 지도 시뮬레이션 - 서울 대방동 일대 */}
            <div className="absolute inset-0">
              {/* 큰 지도 타이틀 */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-20">
                <h2 className="text-lg font-bold text-gray-800">서울 동작구 매물 지도</h2>
              </div>
              
              {/* 강 - 한강 */}
              <div className="absolute top-0 left-0 w-full h-20 bg-blue-300 transform -rotate-2 opacity-80"></div>
              <div className="absolute top-4 left-1/4 text-sm font-bold text-blue-800 bg-white px-2 py-1 rounded">한강</div>
              
              {/* 도로망 */}
              <div className="absolute top-1/4 left-0 w-full h-3 bg-gray-400 opacity-90"></div>
              <div className="absolute top-1/2 left-1/3 w-3 h-full bg-gray-400 opacity-90"></div>
              <div className="absolute top-3/4 left-0 w-full h-3 bg-gray-400 opacity-90"></div>
              <div className="absolute top-0 left-2/3 w-3 h-full bg-gray-400 opacity-90"></div>
              
              {/* 지역 구분 */}
              <div className="absolute top-1/4 left-1/4 w-32 h-24 bg-green-200 opacity-50 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-24 bg-yellow-200 opacity-50 rounded-lg"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-24 bg-pink-200 opacity-50 rounded-lg"></div>
              
              {/* 지역 라벨 */}
              <div className="absolute top-32 left-20 text-lg font-bold text-gray-800 bg-white px-2 py-1 rounded shadow">대방동</div>
              <div className="absolute top-48 left-56 text-lg font-bold text-gray-800 bg-white px-2 py-1 rounded shadow">상도동</div>
              <div className="absolute bottom-20 right-20 text-lg font-bold text-gray-800 bg-white px-2 py-1 rounded shadow">신길동</div>
              
              {/* 지하철역 */}
              <div className="absolute top-40 left-32 w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-lg z-10"></div>
              <div className="absolute top-44 left-24 text-sm text-green-800 font-bold bg-white px-2 py-1 rounded">대방역</div>
              
              <div className="absolute top-56 left-60 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10"></div>
              <div className="absolute top-60 left-52 text-sm text-blue-800 font-bold bg-white px-2 py-1 rounded">상도역</div>
            </div>
            
            {/* 매물 마커 시뮬레이션 */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {filteredProperties.map((property, index) => {
                // 지역별로 위치 분산
                const positions = [
                  { left: '22%', top: '38%' }, // 대방동 1
                  { left: '28%', top: '42%' }, // 대방동 2
                  { left: '58%', top: '55%' }, // 상도동 1
                  { left: '62%', top: '48%' }, // 상도동 2
                  { left: '75%', top: '75%' }, // 신길동 1
                ];
                const position = positions[index % positions.length];
                
                return (
                  <div
                    key={property.id}
                    className="absolute pointer-events-auto cursor-pointer transform hover:scale-110 transition-transform"
                    style={{
                      left: position.left,
                      top: position.top,
                    }}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <div className="bg-red-500 text-white text-sm px-3 py-2 rounded-full shadow-xl hover:bg-red-600 transition-colors border-2 border-white">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {Math.round(property.monthlyRent / 10000)}만원
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 지도 위 정보 */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-xl z-20 border">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">{filteredProperties.length}개 매물</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">서울 동작구 실시간</p>
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