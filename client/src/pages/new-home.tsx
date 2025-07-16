import { useState } from "react";
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
import Navbar from "@/components/navbar";
import FavoriteButton from "@/components/favorite-button";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import AdminLogin from "@/components/admin-login";
import AdminPanel from "@/components/admin-panel";
import PropertyForm from "@/components/property-form";
import CategoryManager from "@/components/category-manager";

// 대학교 데이터
const universities = [
  { id: "snu", name: "서울대학교", nameEn: "Seoul National University", location: "관악구", icon: "🏛️" },
  { id: "yonsei", name: "연세대학교", nameEn: "Yonsei University", location: "서대문구", icon: "🎓" },
  { id: "korea", name: "고려대학교", nameEn: "Korea University", location: "성북구", icon: "📚" },
  { id: "hongik", name: "홍익대학교", nameEn: "Hongik University", location: "마포구", icon: "🎨" },
  { id: "ewha", name: "이화여자대학교", nameEn: "Ewha Womans University", location: "서대문구", icon: "🌸" },
  { id: "sogang", name: "서강대학교", nameEn: "Sogang University", location: "마포구", icon: "⭐" },
  { id: "skku", name: "성균관대학교", nameEn: "Sungkyunkwan University", location: "종로구", icon: "📖" },
  { id: "kyunghee", name: "경희대학교", nameEn: "Kyung Hee University", location: "동대문구", icon: "🌍" },
];

export default function NewHome() {
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
  
  const { isTranslated, targetLanguage } = useTranslation();
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
              한국에서 찾는 
              <span className="text-blue-600 block mt-2">나의 첫 집</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              외국인 유학생을 위한 안전하고 편리한 주거 솔루션
              <br />
              <span className="text-blue-500 font-medium">하우징버디</span>가 함께합니다
            </p>
          </div>

          {/* 검색 바 */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 대학교 선택 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">대학교</Label>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="대학교 선택" />
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
                  월세: {minRent}만원 ~ {maxRent === 200 ? `${maxRent}만원+` : `${maxRent}만원`}
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
                  관리비 포함하여 계산
                </Label>
              </div>
              
              <Button className="px-8" size="lg" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                매물 찾기
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
              대학교별 매물 찾기
            </h2>
            <p className="text-gray-600">
              내가 다닐 대학교 근처의 안전하고 편리한 매물을 확인해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universities.map(uni => (
              <Card 
                key={uni.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleUniversitySelect(uni.id)}
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
                추천 매물
              </h2>
              <p className="text-gray-600">
                하우징버디가 엄선한 외국인 유학생에게 인기 있는 매물들
              </p>
            </div>
            <Link href="/all-properties">
              <Button variant="outline">
                전체보기 <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map(property => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <Badge variant="secondary">신규</Badge>
                  </div>
                  <div className="absolute top-3 right-3">
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
                      <span className="text-sm text-gray-600">보증금</span>
                      <span className="font-semibold text-blue-600">
                        {property.deposit.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">월세</span>
                      <span className="font-semibold text-green-600">
                        {property.monthlyRent.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  
                  <Link href={`/property/${property.id}`}>
                    <Button className="w-full">자세히 보기</Button>
                  </Link>
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

      {/* 숨겨진 관리자 트리거 - 우측 하단 모서리 */}
      <div
        className="fixed bottom-0 right-0 w-8 h-8 cursor-pointer z-50 opacity-5 hover:opacity-20 transition-opacity"
        onClick={() => setShowAdminTrigger(!showAdminTrigger)}
        title="관리자"
      />

      {/* 관리자 버튼 - 트리거 클릭 시에만 표시 */}
      {showAdminTrigger && !isAdmin && (
        <Button
          onClick={() => {
            setShowAdminLogin(true);
            setShowAdminTrigger(false);
          }}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50 animate-in fade-in duration-200"
          size="sm"
        >
          <Shield className="h-5 w-5" />
        </Button>
      )}

      {/* 관리자 로그인 후 패널 */}
      {showAdminTrigger && isAdmin && (
        <AdminPanel
          onCreateListing={() => {
            setShowCreateModal(true);
            setShowAdminTrigger(false);
          }}
          onCategoryManager={() => {
            setShowCategoryManager(true);
            setShowAdminTrigger(false);
          }}
          onTrashView={() => {
            window.location.href = '/trash';
            setShowAdminTrigger(false);
          }}
          onCommentsView={() => {
            window.location.href = '/admin/comments';
            setShowAdminTrigger(false);
          }}
          onLogout={() => {
            logout();
            setShowAdminTrigger(false);
          }}
          className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-200"
          trigger={
            <Button className="w-12 h-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700">
              <Settings className="h-5 w-5" />
            </Button>
          }
        />
      )}

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
    </div>
  );
}