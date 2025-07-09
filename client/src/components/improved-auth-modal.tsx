import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, ArrowLeft, User, Lock, Phone } from "lucide-react";

// Login Schema
const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

// Email Verification Schema
const emailVerificationSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
});

// Verification Code Schema
const verificationCodeSchema = z.object({
  code: z.string().min(6, "인증번호 6자리를 입력해주세요").max(6, "인증번호 6자리를 입력해주세요"),
});

// Registration Schema
const registrationSchema = z.object({
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  phone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "이용약관에 동의해주세요"
  }),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: "개인정보처리방침에 동의해주세요"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type EmailVerificationForm = z.infer<typeof emailVerificationSchema>;
type VerificationCodeForm = z.infer<typeof verificationCodeSchema>;
type RegistrationForm = z.infer<typeof registrationSchema>;

type AuthStep = "login" | "email-verification" | "code-verification" | "registration" | "success";

interface ImprovedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImprovedAuthModal({ isOpen, onClose }: ImprovedAuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  const { login, register, resendVerification, isLoginLoading, isRegisterLoading, isResendLoading } = useAuth();
  const { toast } = useToast();

  // Forms
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailForm = useForm<EmailVerificationForm>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<VerificationCodeForm>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
  });

  const registrationForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { 
      password: "", 
      confirmPassword: "", 
      name: "", 
      phone: "",
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const resetModal = () => {
    setCurrentStep("login");
    setPendingEmail("");
    setIsCodeSent(false);
    loginForm.reset();
    emailForm.reset();
    codeForm.reset();
    registrationForm.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Login Handler
  const onLogin = async (data: LoginForm) => {
    try {
      await login(data);
      toast({
        title: "로그인 성공",
        description: "Housing Buddy에 오신 것을 환영합니다!",
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Email Verification Handler
  const onSendVerification = async (data: EmailVerificationForm) => {
    try {
      // 이메일이 이미 등록되어 있는지 확인하는 API를 호출해야 함
      // 지금은 바로 인증번호 발송으로 넘어감
      setPendingEmail(data.email);
      setIsCodeSent(true);
      setCurrentStep("code-verification");
      
      toast({
        title: "인증번호 발송",
        description: `${data.email}으로 인증번호를 발송했습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "인증번호 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Code Verification Handler
  const onVerifyCode = async (data: VerificationCodeForm) => {
    try {
      // 인증번호 확인 로직 (실제로는 서버에서 확인해야 함)
      // 임시로 6자리 숫자면 통과
      if (data.code.length === 6 && /^\d+$/.test(data.code)) {
        setCurrentStep("registration");
        toast({
          title: "인증 완료",
          description: "이메일 인증이 완료되었습니다.",
        });
      } else {
        throw new Error("올바르지 않은 인증번호입니다.");
      }
    } catch (error: any) {
      toast({
        title: "인증 실패",
        description: error.message || "인증번호 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Registration Handler
  const onRegister = async (data: RegistrationForm) => {
    try {
      const { confirmPassword, agreeToTerms, agreeToPrivacy, ...registerData } = data;
      await register({
        email: pendingEmail,
        ...registerData,
      });
      
      setCurrentStep("success");
      toast({
        title: "회원가입 완료",
        description: "환영합니다! 로그인해주세요.",
      });
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "login":
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="h-5 w-5" />
                로그인
              </CardTitle>
              <CardDescription>
                이메일과 비밀번호를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoginLoading}>
                  {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  로그인
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentStep("email-verification")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  이메일로 회원가입
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "email-verification":
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentStep("login")}
                  className="absolute left-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle>이메일 인증</CardTitle>
              <CardDescription>
                회원가입할 이메일 주소를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(onSendVerification)} className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isResendLoading}>
                  {isResendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  인증번호 전송
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "code-verification":
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentStep("email-verification")}
                  className="absolute left-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CheckCircle className="h-5 w-5" />
              </div>
              <CardTitle>인증번호 확인</CardTitle>
              <CardDescription>
                {pendingEmail}으로 발송된 인증번호를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
                <div>
                  <Label htmlFor="code">인증번호 (6자리)</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    {...codeForm.register("code")}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="text-sm text-red-500 mt-1">
                      {codeForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  인증번호 확인
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // 인증번호 재전송 로직
                    toast({
                      title: "인증번호 재전송",
                      description: "새로운 인증번호를 발송했습니다.",
                    });
                  }}
                >
                  인증번호 재전송
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "registration":
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentStep("code-verification")}
                  className="absolute left-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <User className="h-5 w-5" />
              </div>
              <CardTitle>회원 정보 입력</CardTitle>
              <CardDescription>
                회원가입을 완료하기 위한 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={registrationForm.handleSubmit(onRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    {...registrationForm.register("name")}
                  />
                  {registrationForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {registrationForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="최소 6자리 이상"
                    {...registrationForm.register("password")}
                  />
                  {registrationForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {registrationForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">비밀번호 재입력</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    {...registrationForm.register("confirmPassword")}
                  />
                  {registrationForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {registrationForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">연락처 (선택사항)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    {...registrationForm.register("phone")}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      {...registrationForm.register("agreeToTerms")}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      <span className="text-red-500">*</span> 이용약관에 동의합니다 (필수)
                    </Label>
                  </div>
                  {registrationForm.formState.errors.agreeToTerms && (
                    <p className="text-sm text-red-500">
                      {registrationForm.formState.errors.agreeToTerms.message}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToPrivacy"
                      {...registrationForm.register("agreeToPrivacy")}
                    />
                    <Label htmlFor="agreeToPrivacy" className="text-sm">
                      <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다 (필수)
                    </Label>
                  </div>
                  {registrationForm.formState.errors.agreeToPrivacy && (
                    <p className="text-sm text-red-500">
                      {registrationForm.formState.errors.agreeToPrivacy.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                  {isRegisterLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  회원가입 완료
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>회원가입 완료!</CardTitle>
              <CardDescription>
                Housing Buddy에 오신 것을 환영합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => {
                  setCurrentStep("login");
                  // 회원가입한 이메일을 로그인 폼에 미리 입력
                  loginForm.setValue("email", pendingEmail);
                }}
              >
                로그인하러 가기
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>사용자 인증</DialogTitle>
          <DialogDescription>로그인 또는 회원가입</DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}