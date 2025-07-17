import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Menu, User, LogOut, Settings, Heart, MessageCircle, MapPin, Shield, Languages, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { apiRequest } from "@/lib/queryClient";

import AdminLogin from "./admin-login";
import AdminPanel from "./admin-panel";
import PropertyForm from "./property-form";
import CategoryManager from "./category-manager";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onCreateListing?: () => void;
}

export default function Navbar({ onCreateListing }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { isAdmin, logout: adminLogout } = useAdmin();
  const { getTranslatedText, isTranslated, isTranslating, targetLanguage, updateTargetLanguage, setIsTranslated, setIsTranslating, setTranslatedData } = useTranslation();
  
  // 지원 언어 목록
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' }
  ];

  const currentLanguage = languages.find(lang => lang.code === targetLanguage) || languages[0];
  
  // 언어 변경 및 번역 함수
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === 'ko') {
      // 한국어로 변경 시 번역 해제
      updateTargetLanguage('ko');
      return;
    }
    
    updateTargetLanguage(languageCode);
    setIsTranslating(true);
    
    // 일괄 번역 실행
    try {
      const textsToTranslate = [
        { key: 'home', text: '홈' },
        { key: 'favorites', text: '관심 매물' },
        { key: 'inquiries', text: '문의 내역' },
        { key: 'login-signup', text: '로그인 / 회원가입' },
        { key: 'logout', text: '로그아웃' },
        { key: 'account-settings', text: '계정 설정' },
        { key: 'greeting-suffix', text: '님 안녕하세요!' },
        { key: 'admin-login', text: '관리자 로그인' },
        { key: 'housing-buddy', text: 'Housing Buddy' },
        { key: 'admin', text: '관리자' },
        { key: 'new-property', text: '새 매물 등록' },
        { key: 'category-management', text: '카테고리 관리' },
        { key: 'login-required', text: '로그인이 필요합니다...' },
        { key: 'login', text: '로그인' },
        // 메인 페이지 텍스트
        { key: 'main-title-1', text: '한국에서 찾는' },
        { key: 'main-title-2', text: '나의 첫 집' },
        { key: 'main-desc-new', text: '외국인을 위한 편리한 주거 솔루션' },
        { key: 'housing-buddy-name', text: '하우징버디' },
        { key: 'meet-housing-buddy', text: '를 만나보세요' },
        { key: 'university', text: '대학교' },
        { key: 'university-select', text: '대학교 선택' },
        { key: 'monthly-rent', text: '월세' },
        { key: '10k-won', text: '만원' },
        { key: 'include-maintenance', text: '관리비 포함하여 계산' },
        { key: 'search-properties', text: '매물 찾기' },
        { key: 'university-property-search', text: '대학교별 매물 찾기' },
        { key: 'university-property-desc', text: '내가 다닐 대학교 근처의 안전하고 편리한 매물을 확인해보세요' },
        { key: 'recommended-properties', text: '추천 매물' },
        { key: 'recommended-desc', text: '하우징버디가 추천하는 매물' },
        { key: 'new-badge', text: '신규' },
        { key: 'deposit', text: '보증금' },
        { key: 'won', text: '원' },
        { key: 'view-details', text: '자세히 보기' },
        { key: 'view-all', text: '전체보기' },
        // 대학교 이름들
        { key: 'seoul-national-university', text: '서울대학교' },
        { key: 'yonsei-university', text: '연세대학교' },
        { key: 'korea-university', text: '고려대학교' },
        { key: 'hongik-university', text: '홍익대학교' },
        { key: 'ewha-womans-university', text: '이화여자대학교' },
        { key: 'sogang-university', text: '서강대학교' },
        { key: 'sungkyunkwan-university', text: '성균관대학교' },
        { key: 'kyung-hee-university', text: '경희대학교' },
        // 지역명들
        { key: 'gwanak-gu', text: '관악구' },
        { key: 'seodaemun-gu', text: '서대문구' },
        { key: 'seongbuk-gu', text: '성북구' },
        { key: 'mapo-gu', text: '마포구' },
        { key: 'jongno-gu', text: '종로구' },
        { key: 'dongdaemun-gu', text: '동대문구' },
        // 문의 내역 페이지 UI 텍스트들
        { key: 'ui-내 문의 내역', text: '내 문의 내역' },
        { key: 'ui-등록하신 문의와 관리자 답변을 확인할 수 있습니다.', text: '등록하신 문의와 관리자 답변을 확인할 수 있습니다.' },
        { key: 'ui-문의 내역이 없습니다', text: '문의 내역이 없습니다' },
        { key: 'ui-매물에 문의를 남겨보세요.', text: '매물에 문의를 남겨보세요.' },
        { key: 'ui-매물 둘러보기', text: '매물 둘러보기' },
        { key: 'ui-아직 관리자 답변이 없습니다. 곧 답변드리겠습니다.', text: '아직 관리자 답변이 없습니다. 곧 답변드리겠습니다.' },
        { key: 'ui-로그인이 필요합니다', text: '로그인이 필요합니다' },
        { key: 'ui-문의 내역을 확인하려면 로그인해주세요.', text: '문의 내역을 확인하려면 로그인해주세요.' },
        { key: 'ui-로그인하기', text: '로그인하기' },
        { key: 'ui-관심 매물을 확인하려면 로그인해주세요.', text: '관심 매물을 확인하려면 로그인해주세요.' }
      ];

      // 일괄 번역 API 호출
      const response = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLang: languageCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTranslatedData(result.translations);
        setIsTranslated(true);
        
        toast({
          title: "번역 완료",
          description: `${currentLanguage.name}로 번역되었습니다.`
        });
      } else {
        throw new Error('번역 API 오류');
      }
    } catch (error) {
      console.error('번역 실패:', error);
      toast({
        title: "번역 실패",
        description: "번역 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  // 매물 데이터를 가져와서 카테고리 추출 (옵셔널)
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const navItems = [
    { href: "/", label: getTranslatedText("홈", "home"), active: location === "/", id: "home" },
    { href: "/favorites", label: getTranslatedText("관심 매물", "favorites"), active: location === "/favorites", id: "favorites" },
    { href: "/my-inquiries", label: getTranslatedText("문의 내역", "inquiries"), active: location === "/my-inquiries", id: "inquiries" },
  ];

  const handleLogin = () => {
    setLocation("/signup");
  };

  const handleLogout = async () => {
    try {
      await logout();
      // 관리자 로그아웃 시 관리자 상태도 초기화
      if (isAdmin) {
        adminLogout();
      }
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };



  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Home className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-neutral-900">{getTranslatedText("Housing Buddy", "housing-buddy")}</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`transition-colors ${
                    item.active
                      ? "text-primary font-medium"
                      : "text-neutral-700 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 언어 선택 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2" disabled={isTranslating}>
                  <Languages className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''}`} />
                  <span className="text-sm">{currentLanguage.flag}</span>
                  {isTranslating && <span className="text-xs ml-1">번역중...</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={targetLanguage === language.code ? "bg-blue-50" : ""}
                  >
                    <span className="mr-2">{language.flag}</span>
                    {language.name}
                    {targetLanguage === language.code && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 관리자 방패 버튼 - 로그인 후에만 표시 */}
            {isAdmin && (
              <AdminPanel
                onCreateListing={() => setShowCreateModal(true)}
                onCategoryManager={() => setShowCategoryManager(true)}
                onTrashView={() => setLocation('/trash')}
                onCommentsView={() => setLocation('/admin/comments')}
                onLogout={adminLogout}
                trigger={
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Shield className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden lg:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="h-4 w-4 mr-2" />
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    {getTranslatedText("계정 설정", "account-settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="w-full flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      {getTranslatedText("관심 매물", "favorites")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-inquiries" className="w-full flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {getTranslatedText("문의 내역", "inquiries")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => setShowAdminLogin(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {getTranslatedText("관리자 로그인", "admin-login")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {getTranslatedText("로그아웃", "logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* 로그인하지 않은 경우 로그인 버튼만 표시 */
              <Button variant="ghost" size="icon" onClick={handleLogin}>
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-1">
            {/* 모바일 언어 선택 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isTranslating}>
                  <Languages className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={targetLanguage === language.code ? "bg-blue-50" : ""}
                  >
                    <span className="mr-2">{language.flag}</span>
                    {language.name}
                    {targetLanguage === language.code && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 관리자인 경우에만 모바일 매물 등록 버튼 표시 */}
            {isAuthenticated && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateListing}
                className="border-primary text-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            {/* 모바일 관리자 방패 버튼 - 로그인 후에만 표시 */}
            {isAdmin && (
              <AdminPanel
                onCreateListing={() => setShowCreateModal(true)}
                onCategoryManager={() => setShowCategoryManager(true)}
                onTrashView={() => setLocation('/trash')}
                onCommentsView={() => setLocation('/admin/comments')}
                onLogout={adminLogout}
                trigger={
                  <Button variant="ghost" size="icon" className="bg-blue-600 text-white hover:bg-blue-700">
                    <Shield className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            
            {/* 모바일에서 사용자 인사말 또는 로그인 버튼 표시 */}
            {isAuthenticated ? (
              <div className="flex items-center text-sm text-neutral-700 bg-neutral-50 px-3 py-1 rounded-full">
                <span className="font-medium">
                  {user?.name}{getTranslatedText("님 안녕하세요!", "greeting-suffix")}
                </span>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleLogin}>
                <User className="h-5 w-5" />
              </Button>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center mb-6">
                    <Home className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold text-neutral-900">{getTranslatedText("Housing Buddy", "housing-buddy")}</span>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`text-left px-4 py-2 rounded-lg transition-colors ${
                        item.active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    {isAuthenticated ? (
                      <>
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                        </div>
                        
                        {/* 관리자인 경우에만 사이드바 관리자 패널 버튼 표시 */}
                        {isAdmin && (
                          <AdminPanel
                            onCreateListing={() => {
                              setShowCreateModal(true);
                              setIsMobileMenuOpen(false);
                            }}
                            onCategoryManager={() => {
                              setShowCategoryManager(true);
                              setIsMobileMenuOpen(false);
                            }}
                            onTrashView={() => {
                              setLocation('/trash');
                              setIsMobileMenuOpen(false);
                            }}
                            onCommentsView={() => {
                              setLocation('/admin/comments');
                              setIsMobileMenuOpen(false);
                            }}
                            onLogout={adminLogout}
                            trigger={
                              <Button variant="outline" className="w-full mb-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                                <Settings className="h-4 w-4 mr-2" />
                                {getTranslatedText("관리자", "admin")}
                              </Button>
                            }
                          />
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full mb-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {getTranslatedText("계정 설정", "account-settings")}
                        </Button>
                        
                        {!isAdmin && (
                          <Button 
                            variant="ghost" 
                            className="w-full mb-2"
                            onClick={() => {
                              setShowAdminLogin(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {getTranslatedText("관리자 로그인", "admin-login")}
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {getTranslatedText("로그아웃", "logout")}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          handleLogin();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {getTranslatedText("로그인 / 회원가입", "login-signup")}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      

      {/* Admin Login Modal */}
      <AdminLogin 
        isOpen={showAdminLogin} 
        onClose={() => setShowAdminLogin(false)} 
      />

      {/* 매물 등록 모달 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{getTranslatedText("새 매물 등록", "new-property")}</DialogTitle>
          <PropertyForm 
            onSuccess={() => setShowCreateModal(false)}
            onCancel={() => setShowCreateModal(false)}
            availableCategories={[...new Set(['기타', ...customCategories])]}
          />
        </DialogContent>
      </Dialog>

      {/* 카테고리 관리 모달 */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent>
          <DialogTitle>{getTranslatedText("카테고리 관리", "category-management")}</DialogTitle>
          <CategoryManager
            isOpen={showCategoryManager}
            onClose={() => setShowCategoryManager(false)}
            customCategories={customCategories}
            onUpdateCategories={(categories) => {
              setCustomCategories(categories);
              localStorage.setItem('customCategories', JSON.stringify(categories));
            }}
            propertyCategories={[...new Set(properties.map((p: any) => p.category).filter(Boolean))]}
          />
        </DialogContent>
      </Dialog>
    </nav>
  );
}
