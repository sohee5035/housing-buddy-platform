import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, User, Calendar, MapPin, Phone, ArrowLeft, Home as HomeIcon, ShieldCheck, StickyNote, Save, Edit2 } from "lucide-react";
import { Comment, Property } from "@shared/schema";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import AdminPanel from "@/components/admin-panel";

export default function AdminComments() {
  const { getTranslatedText } = useTranslation();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingMemo, setEditingMemo] = useState<number | null>(null);
  const [memoTexts, setMemoTexts] = useState<Record<number, string>>({});
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // 관리자용 전체 댓글 조회
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
  });

  // 매물 정보 조회
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // 매물 ID로 매물 제목 찾기
  const getPropertyTitle = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.title || `매물 #${propertyId}`;
  };

  // 관리자 메모 업데이트 뮤테이션
  const updateMemoMutation = useMutation({
    mutationFn: async ({ commentId, memo }: { commentId: number; memo: string }) => {
      try {
        const response = await fetch(`/api/admin/comments/${commentId}/memo`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memo }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: 메모 업데이트에 실패했습니다.`);
        }
        
        return response.json();
      } catch (error) {
        console.error('메모 업데이트 오류:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('메모 저장 성공:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: "✓ 메모 저장 완료",
        description: "관리자 메모가 성공적으로 저장되었습니다.",
        duration: 3000,
      });
      setEditingMemo(null);
      setMemoTexts({});
    },
    onError: (error: Error) => {
      console.error('메모 저장 실패:', error);
      toast({
        title: "❌ 메모 저장 실패",
        description: error.message || "메모 저장에 실패했습니다.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleMemoEdit = (commentId: number, currentMemo: string | null) => {
    setEditingMemo(commentId);
    setMemoTexts(prev => ({
      ...prev,
      [commentId]: currentMemo || ""
    }));
  };

  const handleMemoSave = (commentId: number) => {
    const memo = memoTexts[commentId] || "";
    updateMemoMutation.mutate({ commentId, memo });
  };

  const handleMemoCancel = () => {
    setEditingMemo(null);
    setMemoTexts({});
  };

  // 관리자가 아니면 홈으로 리다이렉트
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-neutral-600 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          {getTranslatedText("문의 내역을 불러오는 중...", "loading-comments")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 border-b border-neutral-100">
            <div className="flex items-center">
              <Link href="/">
                <button className="flex items-center hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0">
                  <ArrowLeft className="h-6 w-6 text-neutral-600" />
                </button>
              </Link>
              <div className="flex items-center ml-4">
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900">Housing Buddy</h1>
              </div>
            </div>
            
            {/* Admin Panel Button */}
            {isAdmin && (
              <AdminPanel
                onCreateListing={() => {}}
                onCategoryManager={() => {}}
                onTrashView={() => {}}
                onCommentsView={() => {}}
                trigger={
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </button>
                }
              />
            )}
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {getTranslatedText("전체 문의 관리", "admin-comments-title")}
          </h1>
          <p className="text-gray-600">
            {getTranslatedText("모든 매물의 문의 및 예약 현황을 관리할 수 있습니다.", "admin-comments-desc")}
          </p>
        </div>

      <div className="grid grid-cols-1 gap-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {getTranslatedText("아직 문의가 없습니다.", "no-admin-comments")}
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden">
              <CardHeader className="bg-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    {getPropertyTitle(comment.propertyId)}
                  </CardTitle>
                  <Badge variant={comment.isAdminOnly === 1 ? "secondary" : "outline"}>
                    {comment.isAdminOnly === 1 ? 
                      getTranslatedText("관리자 전용") : 
                      getTranslatedText("일반 문의")
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">{comment.authorName}</span>
                  </div>
                  {comment.authorContact && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{comment.authorContact}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {comment.createdAt && format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({getTranslatedText("수정됨")})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {getTranslatedText("문의 내용", "inquiry-content")}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* 관리자 메모 섹션 */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">관리자 메모</span>
                    </div>
                    
                    {editingMemo === comment.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMemoSave(comment.id)}
                          disabled={updateMemoMutation.isPending}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleMemoCancel}
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMemoEdit(comment.id, comment.adminMemo)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {editingMemo === comment.id ? (
                    <Textarea
                      value={memoTexts[comment.id] || ""}
                      onChange={(e) => setMemoTexts(prev => ({
                        ...prev,
                        [comment.id]: e.target.value
                      }))}
                      placeholder="관리자 전용 메모를 입력하세요..."
                      className="min-h-[80px] text-sm"
                    />
                  ) : (
                    <div className="text-sm text-yellow-700">
                      {comment.adminMemo || "메모가 없습니다. 편집 버튼을 클릭하여 메모를 추가하세요."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}