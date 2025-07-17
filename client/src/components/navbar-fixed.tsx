import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Languages, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import SimpleAuthModal from '@/components/simple-auth-modal';
import AdminLogin from '@/components/admin-login';

export default function NavbarFixed() {
  const { user, logout } = useAuth();
  const { translatedData, isTranslated, isTranslating, targetLanguage, setTranslatedData, setIsTranslated, setIsTranslating, updateTargetLanguage, getTranslatedText } = useTranslation();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [location] = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = React.useState(false);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭' }
  ];

  const currentLanguage = (isTranslated && targetLanguage !== 'ko') 
    ? languages.find(lang => lang.code === targetLanguage) || languages[0]
    : languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    console.log('🔥🔥🔥 언어 변경 시작:', languageCode);
    
    if (languageCode === 'ko') {
      updateTargetLanguage('ko');
      return;
    }
    
    // 번역 상태 완전 초기화
    setTranslatedData({});
    setIsTranslated(false);
    updateTargetLanguage(languageCode);
    setIsTranslating(true);
    
    try {
      const textsToTranslate = [
        { key: 'home', text: '홈' },
        { key: 'favorites', text: '관심 매물' },
        { key: 'inquiries', text: '문의 내역' },
        { key: 'login-signup', text: '로그인 / 회원가입' },
        { key: 'logout', text: '로그아웃' },
        { key: 'account-settings', text: '계정 설정' },
        { key: 'greeting-suffix', text: '님 안녕하세요!' },
        { key: 'admin-login', text: '관리자 로그인' },
        { key: 'housing-buddy', text: 'Housing Buddy' },
        { key: 'admin', text: '관리자' },
        { key: 'new-property', text: '새 매물 등록' },
        { key: 'category-management', text: '카테고리 관리' },
        { key: 'login-required', text: '로그인이 필요합니다...' },
        { key: 'login', text: '로그인' },
        // 메인 페이지 텍스트
        { key: 'main-title-1', text: '한국에서 찾는' },
        { key: 'main-title-2', text: '나의 첫 집' },
        { key: 'main-desc-new', text: '외국인을 위한 편리한 주거 솔루션' },
        { key: 'housing-buddy-name', text: '하우징버디' },
        { key: 'meet-housing-buddy', text: '를 만나보세요' },
        { key: 'university', text: '대학교' },
        { key: 'university-select', text: '대학교 선택' },
        { key: 'monthly-rent', text: '월세' },
        { key: '10k-won', text: '만원' },
        { key: 'include-maintenance', text: '관리비 포함하여 계산' },
        { key: 'search-properties', text: '매물 찾기' },
        { key: 'university-property-search', text: '대학교별 매물 찾기' },
        { key: 'university-property-desc', text: '내가 다닐 대학교 근처의 안전하고 편리한 매물을 확인해보세요' },
        { key: 'recommended-properties', text: '추천 매물' },
        { key: 'recommended-desc', text: '하우징버디가 추천하는 매물' },
        { key: 'new-badge', text: '신규' },
        { key: 'deposit', text: '보증금' },
        { key: 'won', text: '원' },
        { key: 'view-details', text: '자세히 보기' },
        { key: 'view-all', text: '전체보기' },
        // 대학교 이름들
        { key: 'seoul-national-university', text: '서울대학교' },
        { key: 'yonsei-university', text: '연세대학교' },
        { key: 'korea-university', text: '고려대학교' },
        { key: 'hongik-university', text: '홍익대학교' },
        { key: 'ewha-womans-university', text: '이화여자대학교' },
        { key: 'sogang-university', text: '서강대학교' },
        { key: 'sungkyunkwan-university', text: '성균관대학교' },
        { key: 'hanyang-university', text: '한양대학교' },
        // 지역 이름들
        { key: 'gwanak-gu', text: '관악구' },
        { key: 'seodaemun-gu', text: '서대문구' },
        { key: 'seongbuk-gu', text: '성북구' },
        { key: 'mapo-gu', text: '마포구' },
        { key: 'jongno-gu', text: '종로구' },
        { key: 'jangan-gu', text: '장안구' },
        // 내 페이지 텍스트들
        { key: 'ui-관심 매물이 없습니다', text: '관심 매물이 없습니다' },
        { key: 'ui-마음에 드는 매물을 찾아 하트를 눌러보세요.', text: '마음에 드는 매물을 찾아 하트를 눌러보세요.' },
        { key: 'ui-매물 둘러보기', text: '매물 둘러보기' },
        { key: 'ui-문의 내역이 없습니다', text: '문의 내역이 없습니다' },
        { key: 'ui-매물에 문의를 남겨보세요.', text: '매물에 문의를 남겨보세요.' },
        { key: 'ui-매물 둘러보기', text: '매물 둘러보기' },
        { key: 'ui-아직 관리자 답변이 없습니다. 곧 답변드리겠습니다.', text: '아직 관리자 답변이 없습니다. 곧 답변드리겠습니다.' },
        { key: 'ui-로그인이 필요합니다', text: '로그인이 필요합니다' },
        { key: 'ui-문의 내역을 확인하려면 로그인해주세요.', text: '문의 내역을 확인하려면 로그인해주세요.' },
        { key: 'ui-로그인하기', text: '로그인하기' },
        { key: 'ui-관심 매물을 확인하려면 로그인해주세요.', text: '관심 매물을 확인하려면 로그인해주세요.' },
        // 인증 모달 텍스트들 - 새로 추가된 키들
        { key: 'auth-welcome', text: '한국의 외국인을 위한 부동산 플랫폼에 오신 것을 환영합니다' },
        { key: 'email', text: '이메일' },
        { key: 'password', text: '비밀번호' },
        { key: 'signup', text: '회원가입' },
        { key: 'verification-code', text: '인증번호' },
        { key: 'code-sent', text: '발송완료' },
        { key: 'verification-code-6digit', text: '인증번호 (6자리)' },
        { key: 'password-confirm', text: '비밀번호 확인' },
        { key: 'name', text: '이름' },
        { key: 'phone-optional', text: '전화번호 (선택사항)' },
        { key: 'agree-terms-required', text: '이용약관에 동의합니다 (필수)' },
        { key: 'agree-privacy-required', text: '개인정보처리방침에 동의합니다 (필수)' }
      ];

      console.log('🔥🔥🔥 번역 요청 키 목록:', textsToTranslate.map(t => t.key));
      console.log('🔥🔥🔥 총 번역 키 개수:', textsToTranslate.length);
      
      const response = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLang: languageCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔥🔥🔥 번역 결과:', Object.keys(result.translations));
        setTranslatedData(result.translations);
        setIsTranslated(true);
        
        toast({
          title: "번역 완료",
          description: `${languages.find(l => l.code === languageCode)?.name}로 번역되었습니다.`
        });
      } else {
        throw new Error('번역 API 오류');
      }
    } catch (error) {
      console.error('번역 실패:', error);
      toast({
        title: "번역 실패",
        description: "번역 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다."
    });
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">
                {getTranslatedText('Housing Buddy', 'housing-buddy')}
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-sm">
                {getTranslatedText('홈', 'home')}
              </Button>
            </Link>
            <Link href="/favorites">
              <Button variant="ghost" className="text-sm">
                {getTranslatedText('관심 매물', 'favorites')}
              </Button>
            </Link>
            <Link href="/my-inquiries">
              <Button variant="ghost" className="text-sm">
                {getTranslatedText('문의 내역', 'inquiries')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* 언어 선택 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isTranslating}>
                <Languages className="h-4 w-4 mr-2" />
                <span>{currentLanguage.flag}</span>
                <span className="ml-2">{currentLanguage.name}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {currentLanguage.code === lang.code && (
                    <span className="text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 사용자 메뉴 */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.username}{getTranslatedText('님 안녕하세요!', 'greeting-suffix')}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {getTranslatedText('로그아웃', 'logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)} variant="default">
              {getTranslatedText('로그인 / 회원가입', 'login-signup')}
            </Button>
          )}

          {/* 관리자 버튼 */}
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                {getTranslatedText('관리자', 'admin')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <SimpleAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AdminLogin isOpen={isAdminLoginModalOpen} onOpenChange={setIsAdminLoginModalOpen} />
    </nav>
  );
}