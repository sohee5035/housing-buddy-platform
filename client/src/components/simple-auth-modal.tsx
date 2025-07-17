import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2, Mail, User, Lock, Phone } from "lucide-react";

// Login Schema
const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

// One-page Registration Schema
const registrationSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  phone: z.string().optional(),
  verificationCode: z.string().min(6, "인증번호 6자리를 입력해주세요").max(6, "인증번호 6자리를 입력해주세요"),
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
type RegistrationForm = z.infer<typeof registrationSchema>;

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleAuthModal({ isOpen, onClose }: SimpleAuthModalProps) {
  const [currentTab, setCurrentTab] = useState<"login" | "register">("login");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  
  const { login, register, resendVerification, isLoginLoading, isRegisterLoading } = useAuth();
  const { toast } = useToast();
  const { getTranslatedText, isTranslated, translatedData } = useTranslation();
  
  // 디버깅: 번역 상태 확인
  console.log('Simple Auth Modal - 번역 상태:', { 
    isTranslated, 
    hasTranslatedData: Object.keys(translatedData).length > 0,
    sampleKeys: Object.keys(translatedData).slice(0, 5),
    hasEmailKey: translatedData['email'],
    hasPasswordKey: translatedData['password'],
    hasLoginKey: translatedData['login']
  });

  // Forms
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registrationForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { 
      email: "",
      password: "", 
      confirmPassword: "", 
      name: "", 
      phone: "",
      verificationCode: "",
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const resetModal = () => {
    setCurrentTab("login");
    setIsCodeSent(false);
    setPendingEmail("");
    loginForm.reset();
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

  // Send Verification Code
  const sendVerificationCode = async () => {
    const email = registrationForm.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: "이메일 오류",
        description: "유효한 이메일을 먼저 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 이메일 중복 확인 후 인증 코드 발송
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setPendingEmail(email);
      setIsCodeSent(true);
      toast({
        title: "인증번호 발송",
        description: `${email}으로 인증번호를 발송했습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "인증번호 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // Registration Handler
  const onRegister = async (data: RegistrationForm) => {
    if (!isCodeSent) {
      toast({
        title: "인증번호 필요",
        description: "먼저 이메일 인증번호를 받아주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 인증번호 확인 후 회원가입
      const response = await fetch("/api/auth/verify-and-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          verificationCode: data.verificationCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: "회원가입 완료",
        description: "환영합니다! 이제 로그인해주세요.",
      });
      setCurrentTab("login");
      registrationForm.reset();
      setIsCodeSent(false);
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTranslatedText("Housing Buddy", "housing-buddy")}</DialogTitle>
          <DialogDescription>
            {getTranslatedText("한국의 외국인을 위한 부동산 플랫폼에 오신 것을 환영합니다", "auth-welcome")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{getTranslatedText("로그인", "login")}</TabsTrigger>
            <TabsTrigger value="register">{getTranslatedText("회원가입", "signup")}</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{getTranslatedText("이메일", "email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">{getTranslatedText("비밀번호", "password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register("password")}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoginLoading}>
                {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getTranslatedText("로그인", "login")}
              </Button>
            </form>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={registrationForm.handleSubmit(onRegister)} className="space-y-4">
              {/* 이메일 + 인증번호 발송 */}
              <div className="space-y-2">
                <Label htmlFor="register-email">{getTranslatedText("이메일", "email")}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      {...registrationForm.register("email")}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={isCodeSent}
                  >
                    {isCodeSent ? getTranslatedText("발송완료", "code-sent") : getTranslatedText("인증번호", "verification-code")}
                  </Button>
                </div>
                {registrationForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* 인증번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="verification-code">{getTranslatedText("인증번호 (6자리)", "verification-code-6digit")}</Label>
                <Input
                  id="verification-code"
                  placeholder="123456"
                  maxLength={6}
                  {...registrationForm.register("verificationCode")}
                />
                {registrationForm.formState.errors.verificationCode && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.verificationCode.message}</p>
                )}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="register-password">{getTranslatedText("비밀번호", "password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="최소 6자 이상"
                    className="pl-10"
                    {...registrationForm.register("password")}
                  />
                </div>
                {registrationForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{getTranslatedText("비밀번호 확인", "password-confirm")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="비밀번호 재입력"
                    className="pl-10"
                    {...registrationForm.register("confirmPassword")}
                  />
                </div>
                {registrationForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">{getTranslatedText("이름", "name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="홍길동"
                    className="pl-10"
                    {...registrationForm.register("name")}
                  />
                </div>
                {registrationForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* 전화번호 (선택사항) */}
              <div className="space-y-2">
                <Label htmlFor="phone">{getTranslatedText("전화번호 (선택사항)", "phone-optional")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    className="pl-10"
                    {...registrationForm.register("phone")}
                  />
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={registrationForm.watch("agreeToTerms")}
                    onCheckedChange={(checked) => 
                      registrationForm.setValue("agreeToTerms", checked as boolean)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    {getTranslatedText("이용약관에 동의합니다 (필수)", "agree-terms-required")}
                  </Label>
                </div>
                {registrationForm.formState.errors.agreeToTerms && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.agreeToTerms.message}</p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={registrationForm.watch("agreeToPrivacy")}
                    onCheckedChange={(checked) => 
                      registrationForm.setValue("agreeToPrivacy", checked as boolean)
                    }
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    {getTranslatedText("개인정보처리방침에 동의합니다 (필수)", "agree-privacy-required")}
                  </Label>
                </div>
                {registrationForm.formState.errors.agreeToPrivacy && (
                  <p className="text-sm text-destructive">{registrationForm.formState.errors.agreeToPrivacy.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                {isRegisterLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getTranslatedText("회원가입", "signup")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}