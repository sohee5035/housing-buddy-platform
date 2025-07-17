import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ShieldCheck, Calendar, MapPin } from "lucide-react";
import { Comment } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { useTranslation } from "@/contexts/TranslationContext";

export default function MyInquiries() {
  const { user, isAuthenticated } = useAuth();
  const { getTranslatedText } = useTranslation();

  // 번역된 UI 텍스트 가져오기
  const translateUI = (koreanText: string) => {
    return getTranslatedText(koreanText, `ui-${koreanText}`) || koreanText;
  };

  // 사용자의 모든 댓글 가져오기
  const { data: inquiries = [], isLoading } = useQuery<(Comment & { property: { title: string; id: number } })[]>({
    queryKey: ['/api/my-inquiries'],
    queryFn: async () => {
      const response = await fetch('/api/my-inquiries', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch inquiries");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              {translateUI('로그인이 필요합니다')}
            </h2>
            <p className="text-neutral-600 mb-6">
              {translateUI('문의 내역을 확인하려면 로그인해주세요.')}
            </p>
            <Link href="/signup">
              <Button>{translateUI('로그인하기')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{translateUI('내 문의 내역')}</h1>
          <p className="text-gray-600">{translateUI('등록하신 문의와 관리자 답변을 확인할 수 있습니다.')}</p>
        </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">{translateUI('문의 내역이 없습니다')}</h2>
          <p className="text-gray-500 mb-4">{translateUI('매물에 문의를 남겨보세요.')}</p>
          <Link href="/">
            <Button>{translateUI('매물 둘러보기')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium text-gray-900 mb-2">
                      <Link href={`/property/${inquiry.property.id}`} className="hover:text-blue-600 transition-colors">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {inquiry.property.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      {inquiry.isAdminOnly && (
                        <Badge variant="secondary" className="text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          관리자 전용
                        </Badge>
                      )}
                      {inquiry.adminReply && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          답변 완료
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* 본인 문의 내용 */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">문의 내용</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">
                      {inquiry.content}
                    </p>
                  </div>
                  {inquiry.authorContact && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>연락처:</strong> {inquiry.authorContact}
                    </div>
                  )}
                </div>

                {/* 관리자 답변 */}
                {inquiry.adminReply && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800">관리자 답변</h4>
                        {inquiry.adminReplyAt && (
                          <span className="text-sm text-green-600">
                            {new Date(inquiry.adminReplyAt).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <p className="text-green-900 whitespace-pre-wrap leading-relaxed">
                          {inquiry.adminReply}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                
                {!inquiry.adminReply && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-center py-3 text-gray-500 text-sm">
                      {translateUI('아직 관리자 답변이 없습니다. 곧 답변드리겠습니다.')}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}