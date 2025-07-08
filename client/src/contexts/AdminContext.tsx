import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  // 컴포넌트 마운트 시 localStorage에서 관리자 상태 확인
  useEffect(() => {
    const adminStatus = localStorage.getItem('housing-buddy-admin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === '1234') {
      setIsAdmin(true);
      localStorage.setItem('housing-buddy-admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
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