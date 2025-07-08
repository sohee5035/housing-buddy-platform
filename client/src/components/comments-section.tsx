import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, InsertComment, UpdateComment, DeleteComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { systemMessages } from "@/lib/property-terms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, Trash2, User, Edit, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface CommentsSectionProps {
  propertyId: number;
}

export default function CommentsSection({ propertyId }: CommentsSectionProps) {
  const [authorName, setAuthorName] = useState("");
  const [authorPassword, setAuthorPassword] = useState("");
  const [content, setContent] = useState("");
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdminOnly, setEditIsAdminOnly] = useState(false);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const { getTranslatedText } = useTranslation();

  // 댓글 목록 가져오기
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/properties/${propertyId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/comments`, {
        headers: {
          'x-admin': isAdmin.toString(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: Omit<InsertComment, 'propertyId'>) => {
      const response = await apiRequest("POST", `/api/properties/${propertyId}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
      setAuthorName("");
      setAuthorPassword("");
      setContent("");
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

  // 댓글 삭제 mutation (비밀번호 인증)
  const deleteCommentWithPasswordMutation = useMutation({
    mutationFn: async ({ commentId, deleteData }: { commentId: number; deleteData: DeleteComment }) => {
      await apiRequest("POST", `/api/comments/${commentId}/delete`, deleteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/comments`] });
      setDeletingComment(null);
      setDeletePassword("");
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다.",
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
      setEditPassword("");
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
    if (!authorName.trim() || !content.trim() || !authorPassword.trim()) {
      toast({
        title: "입력 오류",
        description: "이름, 비밀번호(4자리), 댓글 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (authorPassword.length !== 4 || !/^\d{4}$/.test(authorPassword)) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 4자리 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      authorName: authorName.trim(),
      authorPassword: authorPassword.trim(),
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
    setDeletePassword("");
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditIsAdminOnly(comment.isAdminOnly === 1);
    setEditPassword("");
  };

  const handleUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editPassword.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (editPassword.length !== 4 || !/^\d{4}$/.test(editPassword)) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 4자리 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (editingComment) {
      updateCommentMutation.mutate({
        commentId: editingComment.id,
        updateData: {
          content: editContent.trim(),
          password: editPassword.trim(),
          isAdminOnly: editIsAdminOnly ? 1 : 0,
        },
      });
    }
  };

  const handleConfirmDeleteComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast({
        title: "입력 오류",
        description: "비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (deletePassword.length !== 4 || !/^\d{4}$/.test(deletePassword)) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 4자리 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (deletingComment) {
      deleteCommentWithPasswordMutation.mutate({
        commentId: deletingComment.id,
        deleteData: {
          password: deletePassword.trim(),
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="이름을 입력하세요"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <Input
                type="password"
                placeholder="4자리 숫자 비밀번호"
                value={authorPassword}
                onChange={(e) => setAuthorPassword(e.target.value)}
                maxLength={4}
              />
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
                  id="adminOnly"
                  checked={isAdminOnly}
                  onCheckedChange={setIsAdminOnly}
                />
                <label 
                  htmlFor="adminOnly" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <ShieldCheck className="h-4 w-4 mr-1 text-blue-600" />
                  관리자만 볼 수 있음
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
          comments.map((comment, index) => (
            <div key={comment.id}>
              <Card className={comment.isAdminOnly === 1 ? "border-blue-200 bg-blue-50/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-neutral-500" />
                      <Badge variant="outline">{comment.authorName}</Badge>
                      {comment.isAdminOnly === 1 && (
                        <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          관리자 전용
                        </Badge>
                      )}
                      <span className="text-sm text-neutral-500">
                        {comment.createdAt && new Date(comment.createdAt).toLocaleString('ko-KR')}
                      </span>
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-neutral-400">(수정됨)</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditComment(comment)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCommentUser(comment)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          title="관리자 삭제"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
              {index < comments.length - 1 && <Separator className="my-2" />}
            </div>
          ))
        )}
      </div>

      {/* 댓글 수정 모달 */}
      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>댓글 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateComment} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="4자리 숫자 비밀번호"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                maxLength={4}
              />
            </div>
            <div>
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full resize-none"
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
                  관리자만 볼 수 있음
                </label>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingComment(null)}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={updateCommentMutation.isPending}
              >
                {updateCommentMutation.isPending ? "수정 중..." : "수정"}
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
          <form onSubmit={handleConfirmDeleteComment} className="space-y-4">
            <p className="text-sm text-neutral-600">
              댓글을 삭제하려면 작성 시 설정한 4자리 비밀번호를 입력해주세요.
            </p>
            <div>
              <Input
                type="password"
                placeholder="4자리 숫자 비밀번호"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeletingComment(null)}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={deleteCommentWithPasswordMutation.isPending}
              >
                {deleteCommentWithPasswordMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}