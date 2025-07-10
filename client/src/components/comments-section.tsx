import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, InsertComment, UpdateComment, DeleteComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/hooks/useAuth";
import { systemMessages } from "@/lib/property-terms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, Trash2, User, Edit, ShieldCheck, Eye, EyeOff, LogIn } from "lucide-react";
import AuthModal from "@/components/auth-modal";

// 관리자 답변 컴포넌트
function AdminReplyForm({ commentId, onSuccess }: { commentId: number; onSuccess: () => void }) {
  const [reply, setReply] = useState("");
  const { toast } = useToast();

  const replyMutation = useMutation({
    mutationFn: async (replyText: string) => {
      const response = await apiRequest("PUT", `/api/admin/comments/${commentId}/reply`, { reply: replyText });
      return response.json();
    },
    onSuccess: () => {
      setReply("");
      onSuccess();
      toast({
        title: "답변 등록 완료",
        description: "관리자 답변이 등록되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "답변 등록 실패",
        description: error.message || "답변 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="고객에게 보낼 답변을 작성하세요..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={3}
        className="w-full resize-none"
      />
      <div className="flex justify-end">
        <Button
          onClick={() => replyMutation.mutate(reply)}
          disabled={!reply.trim() || replyMutation.isPending}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {replyMutation.isPending ? "답변 등록 중..." : "답변 등록"}
        </Button>
      </div>
    </div>
  );
}

interface CommentsSectionProps {
  propertyId: number;
}

export default function CommentsSection({ propertyId }: CommentsSectionProps) {
  const [content, setContent] = useState("");
  const [authorContact, setAuthorContact] = useState("");
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdminOnly, setEditIsAdminOnly] = useState(false);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedComment, setExpandedComment] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const { getTranslatedText } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  // 댓글 목록 가져오기 (본인 댓글만)
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/properties/${propertyId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/comments`, {
        headers: {
          'x-admin': isAdmin.toString(),
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: Omit<InsertComment, 'propertyId' | 'authorName'>) => {
      const response = await apiRequest("POST", `/api/properties/${propertyId}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
      setContent("");
      setAuthorContact("");
      setIsAdminOnly(false);
      toast({
        title: "댓글 등록 완료",
        description: "댓글이 성공적으로 등록되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 등록 실패",
        description: error.message || "댓글 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 댓글 삭제 mutation (관리자만)
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 삭제 실패",
        description: error.message || "댓글 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });



  // 댓글 수정 mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, updateData }: { commentId: number; updateData: UpdateComment }) => {
      const response = await apiRequest("PUT", `/api/comments/${commentId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
      setEditingComment(null);
      setEditContent("");
      setEditContact("");
      setEditIsAdminOnly(false);
      toast({
        title: "댓글 수정 완료",
        description: "댓글이 성공적으로 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 수정 실패",
        description: error.message || "댓글 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      authorContact: authorContact.trim() || undefined,
      content: content.trim(),
      isAdminOnly: isAdminOnly ? 1 : 0,
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleDeleteCommentUser = (comment: Comment) => {
    setDeletingComment(comment);
  };

  const handleEditComment = async (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditContact(comment.authorContact || "");
    setEditIsAdminOnly(comment.isAdminOnly === 1);
  };

  const handleUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (editingComment) {
      updateCommentMutation.mutate({
        commentId: editingComment.id,
        updateData: {
          content: editContent.trim(),
          isAdminOnly: editIsAdminOnly ? 1 : 0,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{getTranslatedText("문의 및 예약")} ({comments.length})</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
            {getTranslatedText(systemMessages.commentGuidance, "comment-guidance")}
          </p>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      <Card>
        <CardContent className="p-4">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <LogIn className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getTranslatedText("로그인이 필요합니다")}
                  </h3>
                  <p className="text-gray-600">
                    {getTranslatedText("문의를 남기려면 회원가입 후 로그인해주세요.")}
                  </p>
                </div>
                <Button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <LogIn className="h-4 w-4 mr-2" />
                  {getTranslatedText("로그인 / 회원가입")}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.name}님으로 문의 남기기</span>
                </div>
                <div>
                  <Input
                    placeholder="한국 휴대폰번호 (선택사항) - 예: 010-1234-5678"
                    value={authorContact}
                    onChange={(e) => setAuthorContact(e.target.value)}
                    pattern="[0-9-]+"
                    maxLength={13}
                  />
                </div>
              </div>
              <div>
                <Textarea
                  placeholder={getTranslatedText("궁금한 점이나 예약 관련 문의를 입력해주세요...", "comment-placeholder")}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full resize-none"
                />
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="admin-only"
                    checked={isAdminOnly}
                    onCheckedChange={(checked) => setIsAdminOnly(checked === true)}
                  />
                  <label htmlFor="admin-only" className="text-sm text-gray-600">
                    {getTranslatedText("관리자 전용 문의")}
                  </label>
                </div>
              )}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createCommentMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createCommentMutation.isPending ? getTranslatedText("등록 중...") : getTranslatedText("문의 등록")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-neutral-500">
            댓글을 불러오는 중...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            {getTranslatedText("아직 문의가 없습니다. 첫 번째 문의를 남겨보세요!", "no-comments")}
          </div>
        ) : (
          comments.map((comment, index) => {
            const isExpanded = expandedComment === comment.id;
            const canViewContent = user?.id === comment.userId || isAdmin;
            const contentPreview = comment.content.length > 50 ? comment.content.substring(0, 50) + "..." : comment.content;
            
            return (
              <div key={comment.id}>
                <Card className={comment.isAdminOnly === 1 ? "border-blue-200 bg-blue-50/50" : ""}>
                  <CardContent className="p-4">
                    {/* 질문 제목 헤더 - 클릭 가능 */}
                    <div 
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => setExpandedComment(isExpanded ? null : comment.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-neutral-500" />
                            <span className="font-medium text-gray-900">{comment.authorName || user?.name}</span>
                            {comment.isAdminOnly === 1 && (
                              <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                {getTranslatedText("관리자 전용")}
                              </Badge>
                            )}
                            {comment.adminReply && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                답변완료
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-neutral-500">
                            <span>{comment.createdAt && new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                              <span className="text-xs text-neutral-400">({getTranslatedText("수정됨")})</span>
                            )}
                          </div>
                          {/* 미리보기 제목 */}
                          <div className="text-gray-700 font-medium mt-1">
                            {canViewContent ? contentPreview : "문의 내용 (본인만 확인 가능)"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>

                    {/* 상세 내용 - 확장 시에만 표시 */}
                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        {/* 접근 권한 확인 */}
                        {!canViewContent ? (
                          <div className="text-center py-8">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                              <ShieldCheck className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              접근 권한이 없습니다
                            </h3>
                            <p className="text-gray-600 mb-4">
                              이 문의는 작성자 본인만 확인할 수 있습니다.
                            </p>
                            <p className="text-sm text-gray-500">
                              본인의 문의를 확인하려면 해당 계정으로 로그인해주세요.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* 관리자만 연락처 표시 */}
                            {isAdmin && comment.authorContact && (
                              <div className="mb-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                <strong>휴대폰번호:</strong> {comment.authorContact}
                              </div>
                            )}
                            
                            {/* 문의 내용 */}
                            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                            
                            {/* 관리자 답변 표시 */}
                            {comment.adminReply && (
                              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                                <div className="flex items-center space-x-2 mb-2">
                                  <ShieldCheck className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">관리자 답변</span>
                                  {comment.adminReplyAt && (
                                    <span className="text-xs text-green-600">
                                      {new Date(comment.adminReplyAt).toLocaleString('ko-KR')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-green-900 whitespace-pre-wrap leading-relaxed">
                                  {comment.adminReply}
                                </p>
                              </div>
                            )}
                            
                            {/* 관리자 답변 작성 (관리자만) */}
                            {isAdmin && !comment.adminReply && (
                              <div className="mb-4">
                                <AdminReplyForm commentId={comment.id} onSuccess={() => {
                                  queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
                                }} />
                              </div>
                            )}
                            
                            {/* 수정/삭제 버튼 */}
                            <div className="flex justify-end space-x-2">
                              {isAuthenticated && user?.id === comment.userId && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditComment(comment)}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    수정
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCommentUser(comment)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                  </Button>
                                </>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                  title="관리자 삭제"
                                >
                                  <ShieldCheck className="h-4 w-4 mr-1" />
                                  관리자 삭제
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {index < comments.length - 1 && <Separator className="my-2" />}
              </div>
            );
          })
        )}
      </div>

      {/* 댓글 수정 모달 */}
      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{getTranslatedText("댓글 수정")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateComment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {getTranslatedText("댓글 내용")}
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                휴대폰번호 (선택사항)
              </label>
              <Input
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                placeholder="010-1234-5678"
                pattern="[0-9-]+"
                maxLength={13}
              />
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editAdminOnly"
                  checked={editIsAdminOnly}
                  onCheckedChange={setEditIsAdminOnly}
                />
                <label 
                  htmlFor="editAdminOnly" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <ShieldCheck className="h-4 w-4 mr-1 text-blue-600" />
                  {getTranslatedText("관리자만 볼 수 있음")}
                </label>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingComment(null)}
              >
                {getTranslatedText("취소")}
              </Button>
              <Button 
                type="submit" 
                disabled={updateCommentMutation.isPending}
              >
                {updateCommentMutation.isPending ? getTranslatedText("수정 중...") : getTranslatedText("수정")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 댓글 삭제 모달 */}
      <Dialog open={!!deletingComment} onOpenChange={() => setDeletingComment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              정말로 이 댓글을 삭제하시겠습니까?
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeletingComment(null)}
              >
                취소
              </Button>
              <Button 
                variant="destructive"
                disabled={deleteCommentMutation.isPending}
                onClick={() => {
                  if (deletingComment) {
                    deleteCommentMutation.mutate(deletingComment.id);
                  }
                }}
              >
                {deleteCommentMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </div>
  );
}