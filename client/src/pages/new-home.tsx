import { useState } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  Home as HomeIcon,
  MapPin,
  Heart,
  Search,
  GraduationCap,
  Building,
  Users,
  Globe,
  Star,
  ArrowRight,
  Banknote,
  Calendar,
  Won,
  Settings,
  Shield
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar-fixed";
import FavoriteButton from "@/components/favorite-button";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/admin-login";
import AdminPanel from "@/components/admin-panel";
import PropertyForm from "@/components/property-form";
import CategoryManager from "@/components/category-manager";

export default function NewHome() {
  const { isTranslated, targetLanguage, getTranslatedText } = useTranslation();
  
  // 대학교 데이터 (번역 지원)
  const universities = [
    { id: "snu", name: getTranslatedText("서울대학교", "seoul-national-university"), nameEn: "Seoul National University", location: getTranslatedText("관악구", "gwanak-gu"), icon: "🏛️" },
    { id: "yonsei", name: getTranslatedText("연세대학교", "yonsei-university"), nameEn: "Yonsei University", location: getTranslatedText("서대문구", "seodaemun-gu"), icon: "🎓" },
    { id: "korea", name: getTranslatedText("고려대학교", "korea-university"), nameEn: "Korea University", location: getTranslatedText("성북구", "seongbuk-gu"), icon: "📚" },
    { id: "hongik", name: getTranslatedText("홍익대학교", "hongik-university"), nameEn: "Hongik University", location: getTranslatedText("마포구", "mapo-gu"), icon: "🎨" },
    { id: "ewha", name: getTranslatedText("이화여자대학교", "ewha-womans-university"), nameEn: "Ewha Womans University", location: getTranslatedText("서대문구", "seodaemun-gu"), icon: "🌸" },
    { id: "sogang", name: getTranslatedText("서강대학교", "sogang-university"), nameEn: "Sogang University", location: getTranslatedText("마포구", "mapo-gu"), icon: "⭐" },
    { id: "skku", name: getTranslatedText("성균관대학교", "sungkyunkwan-university"), nameEn: "Sungkyunkwan University", location: getTranslatedText("종로구", "jongno-gu"), icon: "📖" },
    { id: "kyunghee", name: getTranslatedText("경희대학교", "kyung-hee-university"), nameEn: "Kyung Hee University", location: getTranslatedText("동대문구", "dongdaemun-gu"), icon: "🌍" },
  ];

  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [minRent, setMinRent] = useState<number>(0);
  const [maxRent, setMaxRent] = useState<number>(80);
  

  const [includeMaintenanceFee, setIncludeMaintenanceFee] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAdminTrigger, setShowAdminTrigger] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const { isAdmin, logout } = useAdmin();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties");
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  // 추천 매물 (최신 3개)
  const featuredProperties = properties.slice(0, 3);

  const handleUniversitySelect = (universityId: string) => {
    setSelectedUniversity(universityId);
    // 해당 대학교 근처 매물로 필터링 로직 추가
  };

  const handleUniversityClick = (universityId: string) => {
    // 대학교 ID를 데이터베이스 ID로 매핑
    const universityIdMap: { [key: string]: number } = {
      'snu': 1,        // 서울대학교
      'yonsei': 2,     // 연세대학교  
      'korea': 3,      // 고려대학교
      'hongik': 4,     // 홍익대학교
      'ewha': 5,       // 이화여자대학교
      'sogang': 6,     // 서강대학교
      'skku': 7,       // 성균관대학교
      'kyunghee': 8    // 경희대학교
    };
    
    const dbUniversityId = universityIdMap[universityId];
    if (dbUniversityId) {
      // 해당 대학교 매물 필터링된 페이지로 이동
      window.location.href = `/properties?university=${dbUniversityId}`;
    }
  };

  const handleSearch = () => {
    // 검색 로직 구현
    console.log('검색 조건:', {
      university: selectedUniversity,
      rent: [minRent, maxRent],
      includeMaintenance: includeMaintenanceFee
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      

      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {getTranslatedText("한국에서 찾는", "main-title-1")} 
              <span className="text-blue-600 block mt-2">{getTranslatedText("나의 첫 집", "main-title-2")}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {getTranslatedText("외국인을 위한 편리한 주거 솔루션", "main-desc-new")}, <span className="text-blue-500 font-medium">{getTranslatedText("하우징버디", "housing-buddy-name")}</span>{getTranslatedText("를 만나보세요", "meet-housing-buddy")}
            </p>
          </div>

          {/* 검색 바 */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 대학교 선택 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{getTranslatedText("대학교", "university")}</Label>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder={getTranslatedText("대학교 선택", "university-select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map(uni => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.icon} {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 월세 범위 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  {getTranslatedText("월세", "monthly-rent")}: {minRent}{getTranslatedText("만원", "10k-won")} ~ {maxRent === 200 ? `${maxRent}${getTranslatedText("만원", "10k-won")}+` : `${maxRent}${getTranslatedText("만원", "10k-won")}`}
                </Label>
                <div className="px-3">
                  <Slider
                    value={[minRent, maxRent]}
                    onValueChange={([min, max]) => {
                      setMinRent(min);
                      setMaxRent(max);
                    }}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0만원</span>
                  <span>200만원+</span>
                </div>
              </div>
            </div>
            
            {/* 관리비 포함 체크박스 및 검색 버튼 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenance-fee"
                  checked={includeMaintenanceFee}
                  onCheckedChange={setIncludeMaintenanceFee}
                />
                <Label htmlFor="maintenance-fee" className="text-sm text-gray-700">
                  {getTranslatedText("관리비 포함하여 계산", "include-maintenance")}
                </Label>
              </div>
              
              <Button className="px-8" size="lg" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                {getTranslatedText("매물 찾기", "search-properties")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 대학교 선택 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <GraduationCap className="h-8 w-8 inline mr-3 text-blue-600" />
              {getTranslatedText("대학교별 매물 찾기", "university-property-search")}
            </h2>
            <p className="text-gray-600">
              {getTranslatedText("내가 다닐 대학교 근처의 안전하고 편리한 매물을 확인해보세요", "university-property-desc")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universities.map(uni => (
              <Card 
                key={uni.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleUniversityClick(uni.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{uni.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{uni.name}</h3>
                  <p className="text-sm text-gray-500">{uni.location}</p>
                  <p className="text-xs text-blue-600 mt-1">{uni.nameEn}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 추천 매물 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                <Star className="h-8 w-8 inline mr-3 text-yellow-500" />
                {getTranslatedText("추천 매물", "recommended-properties")}
              </h2>
              <p className="text-gray-600">
                {getTranslatedText("하우징버디가 추천하는 매물", "recommended-desc")}
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline">
                {getTranslatedText("전체보기", "view-all")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map(property => (
              <Card 
                key={property.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform transition-all duration-200"
                onClick={() => window.location.href = `/property/${property.id}`}
              >
                <div className="relative">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <HomeIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary">{getTranslatedText("신규", "new-badge")}</Badge>
                  </div>
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton propertyId={property.id} size="sm" variant="ghost" />
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getTranslatedText("보증금", "deposit")}</span>
                      <span className="font-semibold text-blue-600">
                        {property.deposit.toLocaleString()}{getTranslatedText("원", "won")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{getTranslatedText("월세", "monthly-rent")}</span>
                      <span className="font-semibold text-green-600">
                        {property.monthlyRent.toLocaleString()}{getTranslatedText("원", "won")}
                      </span>
                    </div>
                  </div>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    <Link href={`/property/${property.id}`}>
                      <Button className="w-full">{getTranslatedText("자세히 보기", "view-details")}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 외국인 정착 가이드 섹션 */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            <Globe className="h-8 w-8 inline mr-3" />
            외국인 정착 가이드
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            한국에서의 새로운 시작을 위한 완벽한 가이드
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Banknote className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">은행 계좌 개설</h3>
                <p className="text-blue-100 text-sm">
                  KB국민은행과 함께하는 간편한 계좌 개설 안내
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">주거 계약</h3>
                <p className="text-blue-100 text-sm">
                  안전한 임대차 계약을 위한 필수 체크리스트
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">생활 정보</h3>
                <p className="text-blue-100 text-sm">
                  한국 생활에 필요한 실용적인 정보와 꿀팁
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Button variant="secondary" className="mt-8" size="lg">
            가이드 보기 <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* 통계 및 신뢰도 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{properties.length}+</div>
              <p className="text-gray-600">검증된 매물</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
              <p className="text-gray-600">만족한 유학생</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">8</div>
              <p className="text-gray-600">주요 대학교</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">24/7</div>
              <p className="text-gray-600">고객 지원</p>
            </div>
          </div>
        </div>
      </section>



      {/* 관리자 로그인 모달 */}
      <AdminLogin 
        isOpen={showAdminLogin} 
        onClose={() => {
          setShowAdminLogin(false);
          setShowAdminTrigger(false);
        }} 
      />

      {/* 매물 등록 모달 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>새 매물 등록</DialogTitle>
          <PropertyForm 
            onSuccess={() => {
              setShowCreateModal(false);
              setShowAdminTrigger(false);
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setShowAdminTrigger(false);
            }}
            availableCategories={[...new Set(['기타', ...customCategories])]}
          />
        </DialogContent>
      </Dialog>

      {/* 카테고리 관리 모달 */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent>
          <DialogTitle>카테고리 관리</DialogTitle>
          <CategoryManager
            isOpen={showCategoryManager}
            onClose={() => {
              setShowCategoryManager(false);
              setShowAdminTrigger(false);
            }}
            customCategories={customCategories}
            onUpdateCategories={(categories) => {
              setCustomCategories(categories);
              localStorage.setItem('customCategories', JSON.stringify(categories));
            }}
            propertyCategories={[...new Set(properties.map(p => p.category).filter(Boolean))]}
          />
        </DialogContent>
      </Dialog>

      {/* 은밀한 관리자 로그인 버튼 - 로그인 전에만 표시 */}
      {!isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdminLogin(true)}
            className="opacity-30 hover:opacity-70 transition-opacity bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            title="관리자 로그인"
          >
            <Shield className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      )}
    </div>
  );
}