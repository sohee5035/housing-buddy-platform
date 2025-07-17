import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLogin({ isOpen, onClose }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAdmin();
  const { logout: userLogout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // 관리자 로그인 모달 상태 관리 (자동 닫기 로직 제거)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(password)) {
      // 관리자 로그인 시 일반 계정 로그아웃
      userLogout();
      
      toast({
        title: "관리자 로그인 성공",
        description: "관리자 모드로 전환되었습니다. 일반 계정은 로그아웃됩니다.",
      });
      setPassword("");
      onClose();
    } else {
      toast({
        title: "로그인 실패",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>관리자 로그인</span>
          </DialogTitle>
          <DialogDescription>
            Housing Buddy 관리자 계정으로 로그인하세요.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                className="pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-400" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!password.trim()}>
              로그인
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}