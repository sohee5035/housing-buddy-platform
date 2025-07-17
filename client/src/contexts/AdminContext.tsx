import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { logout: userLogout, isAuthenticated } = useAuth();

  // 컴포넌트 마운트 시 localStorage에서 관리자 상태 확인
  useEffect(() => {
    const adminStatus = localStorage.getItem('housing-buddy-admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // 일반 사용자가 로그인되어 있고 관리자도 로그인되어 있으면 관리자 로그아웃
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      console.log('🔧 일반 사용자 로그인 감지: 관리자 자동 로그아웃');
      logout();
    }
  }, [isAuthenticated, isAdmin]);

  const login = (password: string): boolean => {
    if (password === '1234') {
      // 관리자 로그인 시 일반 사용자 로그아웃
      console.log('🔧 관리자 로그인: 일반 사용자 자동 로그아웃');
      userLogout().catch(err => console.log('일반 사용자 로그아웃 실패:', err));
      
      setIsAdmin(true);
      localStorage.setItem('housing-buddy-admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    console.log('🔧 관리자 로그아웃');
    setIsAdmin(false);
    localStorage.removeItem('housing-buddy-admin');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}