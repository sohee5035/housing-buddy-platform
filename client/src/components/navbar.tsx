import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import SimpleAuthModal from "./simple-auth-modal";
import AdminLogin from "./admin-login";
import AdminPanel from "./admin-panel";
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
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: "/", label: "매물 보기", active: location === "/" },
    { href: "#", label: "즐겨찾기" },
    { href: "#", label: "문의 내역" },
    { href: "#", label: "도움말" },
  ];

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
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
                  key={item.href}
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
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={onCreateListing}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                매물 등록
              </Button>
            )}
            
            {/* 사용자 아이콘 */}
            <Button variant="ghost" size="icon" onClick={handleLogin}>
              <User className="h-5 w-5" />
            </Button>
            
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
                  <DropdownMenuItem>
                    <Home className="h-4 w-4 mr-2" />
                    즐겨찾기
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
            ) : null}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateListing}
                className="border-primary text-primary"
              >
                <Plus className="h-4 w-4" />
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
                    <span className="text-xl font-bold text-neutral-900">Housing Buddy</span>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
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
                        
                        <Button
                          variant="outline"
                          className="w-full mb-2"
                          onClick={() => {
                            onCreateListing?.();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          매물 등록
                        </Button>
                        
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
      
      {/* Simple Auth Modal */}
      <SimpleAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
      
      {/* Admin Login Modal */}
      <AdminLogin 
        isOpen={showAdminLogin} 
        onClose={() => setShowAdminLogin(false)} 
      />
      
      {/* Admin Panel - Show when admin is logged in */}
      {isAdmin && (
        <AdminPanel
          onCreateListing={onCreateListing || (() => {})}
          onCategoryManager={() => {}}
          onTrashView={() => {}}
          onCommentsView={() => {}}
          trigger={null}
          className="hidden"
        />
      )}
    </nav>
  );
}
