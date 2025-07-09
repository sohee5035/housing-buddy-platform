import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

const registerSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { login, register, resendVerification, isLoginLoading, isRegisterLoading, isResendLoading } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data);
      toast({
        title: "로그인 성공",
        description: "Housing Buddy에 오신 것을 환영합니다!",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...registerData } = data;
      const result = await register(registerData);
      
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      
      toast({
        title: "회원가입 완료",
        description: "이메일 인증을 위해 메일함을 확인해주세요.",
      });
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification(registeredEmail);
      toast({
        title: "인증 이메일 재발송",
        description: "인증 이메일을 다시 발송했습니다.",
      });
    } catch (error: any) {
      toast({
        title: "재발송 실패",
        description: error.message || "이메일 재발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setRegistrationSuccess(false);
    setRegisteredEmail("");
    loginForm.reset();
    registerForm.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>🏠 Housing Buddy</DialogTitle>
          <DialogDescription>
            한국의 외국인을 위한 부동산 플랫폼
          </DialogDescription>
        </DialogHeader>

        {registrationSuccess ? (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-green-600">이메일 인증 필요</CardTitle>
              <CardDescription>
                <strong>{registeredEmail}</strong>로 인증 이메일을 발송했습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 이메일함을 확인하여 인증 링크를 클릭해주세요</p>
                <p>• 인증 완료 후 로그인이 가능합니다</p>
                <p>• 스팸함도 확인해주세요</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleResendVerification}
                  disabled={isResendLoading}
                  className="flex-1"
                >
                  {isResendLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  재발송
                </Button>
                <Button onClick={() => setActiveTab("login")} className="flex-1">
                  로그인하기
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoginLoading}>
                  {isLoginLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  로그인
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">이름</Label>
                  <Input
                    id="register-name"
                    placeholder="이름을 입력하세요"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">이메일</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">비밀번호</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">비밀번호 확인</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    {...registerForm.register("confirmPassword")}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                  {isRegisterLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  회원가입
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}