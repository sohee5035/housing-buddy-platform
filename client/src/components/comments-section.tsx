import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Trash2, User } from "lucide-react";

interface CommentsSectionProps {
  propertyId: number;
}

export default function CommentsSection({ propertyId }: CommentsSectionProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();

  // 댓글 목록 가져오기
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/properties/${propertyId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${propertyId}/comments`);
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
      setContent("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "이름과 댓글 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      authorName: authorName.trim(),
      content: content.trim(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">댓글 ({comments.length})</h3>
      </div>

      {/* 댓글 작성 폼 */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="이름을 입력하세요"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={createCommentMutation.isPending}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {createCommentMutation.isPending ? "등록 중..." : "댓글 등록"}
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
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-neutral-500" />
                      <Badge variant="outline">{comment.authorName}</Badge>
                      <span className="text-sm text-neutral-500">
                        {comment.createdAt && new Date(comment.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
    </div>
  );
}