import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, CheckCircle, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/TranslationContext";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

const registrationSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  confirmPassword: z.string().min(6, "비밀번호 확인을 입력해주세요."),
  verificationCode: z.string().optional(), // 선택사항으로 변경
  agreeToPrivacy: z.boolean(),
  agreeToTerms: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
}).refine((data) => data.agreeToPrivacy === true, {
  message: "개인정보 수집·이용 동의는 필수입니다.",
  path: ["agreeToPrivacy"],
}).refine((data) => data.agreeToTerms === true, {
  message: "이용약관 동의는 필수입니다.",
  path: ["agreeToTerms"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegistrationForm = z.infer<typeof registrationSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [emailForCode, setEmailForCode] = useState("");
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  
  const { toast } = useToast();
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth();
  const { getTranslatedText } = useTranslation();

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Registration form
  const registrationForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      agreeToPrivacy: false,
      agreeToTerms: false,
    },
  });

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data);
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegistrationForm) => {
    try {
      // 이메일 인증 없이 바로 회원가입 진행
      const response = await fetch("/api/auth/verify-and-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          verificationCode: data.verificationCode || "", // 빈 문자열로 전송
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "회원가입 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      
      // 회원가입 성공 후 자동으로 로그인 시도
      try {
        await login({
          email: data.email,
          password: data.password,
        });
        
        toast({
          title: "회원가입 및 로그인 성공",
          description: "Housing Buddy에 오신 것을 환영합니다!",
        });
        
        setLocation("/");
        
      } catch (loginError: any) {
        // 자동 로그인 실패 시 수동 로그인 유도
        toast({
          title: "회원가입 성공",
          description: "계정이 생성되었습니다. 로그인해주세요.",
        });
        
        // 로그인 탭으로 전환하고 이메일 자동 입력
        setActiveTab("login");
        loginForm.setValue("email", data.email);
        registrationForm.reset();
      }
      
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Terms of Service Component
  const TermsOfService = () => (
    <ScrollArea className="h-[300px] w-full rounded border p-4 text-sm">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Housing Buddy 이용약관</h3>
          <p className="text-gray-600 text-sm">시행일자: 2025년 7월 10일</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">제1조 (서비스 이용)</h4>
          <p className="text-gray-700">
            Housing Buddy는 부동산 매물 정보를 제공하는 플랫폼입니다. 본 서비스를 이용함으로써 이용약관에 동의하는 것으로 간주됩니다.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">제2조 (회원 의무)</h4>
          <ul className="text-gray-700 space-y-1">
            <li>- 정확한 정보로 회원가입을 해주세요</li>
            <li>- 타인에게 피해를 주는 행위는 금지됩니다</li>
            <li>- 허위 매물 정보 등록은 제재 대상입니다</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">제3조 (서비스 제공)</h4>
          <p className="text-gray-700">
            회사는 안정적인 서비스 제공을 위해 노력하며, 시스템 점검 등으로 일시 중단될 수 있습니다.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">제4조 (개인정보)</h4>
          <p className="text-gray-700">
            이용자의 개인정보는 관련 법령에 따라 보호되며, 자세한 내용은 개인정보처리방침을 참고해주세요.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">제5조 (기타)</h4>
          <p className="text-gray-700">
            본 약관은 대한민국 법령을 준수하며, 문의사항은 고객센터로 연락 바랍니다.
          </p>
        </div>
        
        <div className="text-center border-t pt-4">
          <p className="font-semibold">Team Housing Buddy</p>
          <p className="text-gray-600">📧 kbbuddy2025@gmail.com</p>
        </div>
      </div>
    </ScrollArea>
  );

  const sendVerificationCode = async () => {
    const email = registrationForm.getValues("email");
    if (!email) {
      toast({
        title: "이메일 입력 필요",
        description: "먼저 이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "인증번호 발송 중 오류가 발생했습니다.");
      }

      setIsCodeSent(true);
      setEmailForCode(email);
      toast({
        title: "인증번호 발송",
        description: "이메일로 인증번호를 발송했습니다. (현재는 도메인 구매 전이라 제한적으로 작동합니다)",
      });
    } catch (error: any) {
      toast({
        title: "발송 실패",
        description: error.message || "인증번호 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Housing Buddy</CardTitle>
            <CardDescription className="text-gray-600">
              부동산 매물 플랫폼에 오신 것을 환영합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="register">회원가입</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        className="pl-10 pr-10"
                        {...loginForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "로그인 중..." : "로그인"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={registrationForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="이름을 입력하세요"
                        className="pl-10"
                        {...registrationForm.register("name")}
                      />
                    </div>
                    {registrationForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {registrationForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        className="pl-10"
                        {...registrationForm.register("email")}
                      />
                    </div>
                    {registrationForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {registrationForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요 (6자 이상)"
                        className="pl-10 pr-10"
                        {...registrationForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {registrationForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {registrationForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-confirm-password">비밀번호 확인</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="pl-10 pr-10"
                        {...registrationForm.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {registrationForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {registrationForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* 이메일 인증 섹션 (선택사항) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="verification-code" className="text-sm text-gray-600">
                        이메일 인증번호 (선택사항)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={sendVerificationCode}
                        disabled={!registrationForm.watch("email")}
                      >
                        인증번호 발송
                      </Button>
                    </div>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="인증번호를 입력하세요 (도메인 구매 후 활성화)"
                        className="pl-10"
                        {...registrationForm.register("verificationCode")}
                        disabled={true} // 현재는 비활성화
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      현재는 이메일 인증 없이 가입 가능합니다
                    </p>
                    {isCodeSent && (
                      <p className="text-sm text-green-600">
                        {emailForCode}로 인증번호를 발송했습니다.
                      </p>
                    )}
                  </div>

                  {/* 동의 체크박스 섹션 */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agree-privacy"
                        checked={registrationForm.watch("agreeToPrivacy")}
                        onCheckedChange={(checked) => 
                          registrationForm.setValue("agreeToPrivacy", !!checked)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="agree-privacy"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          개인정보 수집·이용에 동의합니다 (필수)
                        </Label>
                      </div>
                    </div>
                    {registrationForm.formState.errors.agreeToPrivacy && (
                      <p className="text-sm text-red-600">
                        {registrationForm.formState.errors.agreeToPrivacy.message}
                      </p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agree-terms"
                        checked={registrationForm.watch("agreeToTerms")}
                        onCheckedChange={(checked) => 
                          registrationForm.setValue("agreeToTerms", !!checked)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="agree-terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                        >
                          이용약관에 동의합니다 (필수)
                          <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="h-3 w-3" />
                                보기
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>이용약관</DialogTitle>
                                <DialogDescription>
                                  Housing Buddy 서비스 이용약관을 확인해주세요.
                                </DialogDescription>
                              </DialogHeader>
                              <TermsOfService />
                              <div className="flex justify-end">
                                <Button onClick={() => setShowTermsDialog(false)}>
                                  확인
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </Label>
                      </div>
                    </div>
                    {registrationForm.formState.errors.agreeToTerms && (
                      <p className="text-sm text-red-600">
                        {registrationForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isRegisterLoading || 
                      !registrationForm.watch("agreeToPrivacy") || 
                      !registrationForm.watch("agreeToTerms")
                    }
                  >
                    {isRegisterLoading ? "회원가입 중..." : "회원가입"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              Housing Buddy와 함께 완벽한 부동산을 찾아보세요
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}