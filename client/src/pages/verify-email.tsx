import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [location] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // URL에서 쿼리 파라미터 추출
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const userId = url.searchParams.get("userId");

        if (!token || !userId) {
          setStatus("error");
          setMessage("유효하지 않은 인증 링크입니다.");
          return;
        }

        // 이메일 인증 API 호출
        const response = await apiRequest(`/api/auth/verify-email?token=${token}&userId=${userId}`, {
          method: "GET",
        });

        setStatus("success");
        setMessage(response.message || "이메일 인증이 완료되었습니다.");
        setUserInfo(response.user);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "이메일 인증 중 오류가 발생했습니다.");
      }
    };

    verifyEmail();
  }, []);

  const handleGoToLogin = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          
          <CardTitle className={`${
            status === "success" ? "text-green-600" : 
            status === "error" ? "text-red-600" : 
            "text-blue-600"
          }`}>
            {status === "loading" && "이메일 인증 중..."}
            {status === "success" && "인증 완료!"}
            {status === "error" && "인증 실패"}
          </CardTitle>
          
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && userInfo && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">계정 정보</span>
              </div>
              <p className="text-sm text-green-700">
                <strong>이름:</strong> {userInfo.name}
              </p>
              <p className="text-sm text-green-700">
                <strong>이메일:</strong> {userInfo.email}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-sm text-gray-600 space-y-2">
              <p>🎉 Housing Buddy에 오신 것을 환영합니다!</p>
              <p>이제 모든 기능을 이용하실 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>매물 검색 및 문의</li>
                <li>다국어 번역 서비스</li>
                <li>즐겨찾기 기능</li>
                <li>부동산 용어 도움말</li>
              </ul>
            </div>
          )}

          <Button 
            onClick={handleGoToLogin} 
            className="w-full"
            variant={status === "success" ? "default" : "outline"}
          >
            {status === "success" ? "로그인하러 가기" : "홈으로 돌아가기"}
          </Button>

          {status === "error" && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                문제가 지속되면 고객 지원에 문의해주세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}