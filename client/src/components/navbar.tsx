import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Menu, User, LogOut, Settings, Heart, MessageCircle, MapPin, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { useTranslation } from "@/contexts/TranslationContext";

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
  const { getTranslatedText, isTranslated } = useTranslation();
  
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
    { href: "/", label: "홈", active: location === "/", id: "home" },
    { href: "/favorites", label: "관심 매물", active: location === "/favorites", id: "favorites" },
    { href: "/my-inquiries", label: "문의 내역", active: location === "/my-inquiries", id: "inquiries" },
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
              <span className="text-xl font-bold text-neutral-900">Housing Buddy</span>
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
            {/* 관리자 패널 버튼 - 관리자 로그인 시에만 표시 */}
            {isAdmin && (
              <AdminPanel
                onCreateListing={() => setShowCreateModal(true)}
                onCategoryManager={() => setShowCategoryManager(true)}
                onTrashView={() => setLocation('/trash')}
                onCommentsView={() => setLocation('/admin/comments')}
                onLogout={adminLogout}
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Shield className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            
            {isAuthenticated ? (
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
                    계정 설정
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="w-full flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      관심 매물
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-inquiries" className="w-full flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      문의 내역
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => setShowAdminLogin(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      관리자 로그인
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* 로그인하지 않은 경우 로그인 버튼과 관리자 로그인 버튼 */
              <div className="flex items-center space-x-2">
                {!isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} title="관리자 로그인">
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogin}>
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-1">
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
            
            {/* 모바일에서 사용자 인사말 또는 로그인/관리자 버튼들 표시 */}
            {isAuthenticated ? (
              <div className="flex items-center text-sm text-neutral-700 bg-neutral-50 px-3 py-1 rounded-full">
                <span className="font-medium">
                  {user?.name}{getTranslatedText("님 안녕하세요!", "greeting-suffix")}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                {/* 관리자 로그인 버튼 */}
                {!isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => setShowAdminLogin(true)} title="관리자 로그인">
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                {/* 일반 로그인 버튼 */}
                <Button variant="ghost" size="icon" onClick={handleLogin}>
                  <User className="h-5 w-5" />
                </Button>
              </div>
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
                    <span className="text-xl font-bold text-neutral-900">Housing Buddy</span>
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
                                관리자
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
                          계정 설정
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
                            관리자 로그인
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
                          로그아웃
                        </Button>
                      </>
                    ) : (
                      <>
                        {!isAdmin && (
                          <Button 
                            variant="ghost" 
                            className="w-full mb-2"
                            onClick={() => {
                              setShowAdminLogin(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            관리자 로그인
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            handleLogin();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          로그인 / 회원가입
                        </Button>
                      </>
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
          <DialogTitle>새 매물 등록</DialogTitle>
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
          <DialogTitle>카테고리 관리</DialogTitle>
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
