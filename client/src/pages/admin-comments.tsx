import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, User, Calendar, MapPin, Phone, ArrowLeft, Home as HomeIcon, ShieldCheck } from "lucide-react";
import { Comment, Property } from "@shared/schema";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdmin } from "@/contexts/AdminContext";
import { format } from "date-fns";
import { Link } from "wouter";

export default function AdminComments() {
  const { getTranslatedText } = useTranslation();
  const { isAdmin } = useAdmin();

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
                  <ArrowLeft className="h-6 w-6 text-neutral-600 mr-2" />
                  <span className="text-sm text-neutral-600 mr-4">뒤로가기</span>
                </button>
              </Link>
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-neutral-900">Housing Buddy</h1>
              </div>
            </div>
            
            {/* Admin Status Indicator */}
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">관리자</span>
              </div>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}