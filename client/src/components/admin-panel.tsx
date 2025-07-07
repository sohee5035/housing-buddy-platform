import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import AdminAuth from "@/components/admin-auth";
import { Settings, Plus, Trash2, FolderCog, Shield, Edit, Delete } from "lucide-react";

interface AdminPanelProps {
  onCreateListing: () => void;
  onCategoryManager: () => void;
  onTrashView: () => void;
  onEditProperty?: () => void;
  onDeleteProperty?: () => void;
  currentPropertyId?: number;
}

export default function AdminPanel({ 
  onCreateListing, 
  onCategoryManager, 
  onTrashView,
  onEditProperty,
  onDeleteProperty,
  currentPropertyId
}: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleAdminAction = (action: () => void) => {
    setPendingAction(() => action);
    setShowAdminAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAdminAuth(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* 숨겨진 관리자 접근 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div
            className="fixed bottom-0 right-0 w-8 h-8 cursor-pointer opacity-0 hover:opacity-20 transition-opacity z-50"
            title="관리자 모드"
          >
            <Shield className="h-4 w-4" />
          </div>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              관리자 패널
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
              <h3 className="font-medium text-sm text-neutral-700 mb-3">매물 관리</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAdminAction(onCreateListing)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 매물 등록
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAdminAction(onTrashView)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  휴지통
                </Button>
              </div>
            </div>
            
            {/* 현재 매물 편집/삭제 (매물 상세 페이지에서만 표시) */}
            {currentPropertyId && onEditProperty && onDeleteProperty && (
              <div className="rounded-lg border border-blue-200 p-4 bg-blue-50">
                <h3 className="font-medium text-sm text-blue-700 mb-3">현재 매물 관리</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAdminAction(onEditProperty)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    매물 편집
                  </Button>
                  
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => handleAdminAction(onDeleteProperty)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    매물 삭제
                  </Button>
                </div>
              </div>
            )}
            
            <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
              <h3 className="font-medium text-sm text-neutral-700 mb-3">시스템 설정</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAdminAction(onCategoryManager)}
                >
                  <FolderCog className="h-4 w-4 mr-2" />
                  카테고리 관리
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-amber-200 p-4 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">보안 알림</span>
              </div>
              <p className="text-xs text-amber-700">
                모든 관리자 기능은 비밀번호 인증이 필요합니다.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 관리자 인증 모달 */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => {
          setShowAdminAuth(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
        title="관리자 인증"
        description="관리자 기능을 사용하려면 비밀번호를 입력하세요."
      />
    </>
  );
}