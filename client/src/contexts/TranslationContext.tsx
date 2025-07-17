import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface TranslationContextType {
  translatedData: Record<string, string>;
  isTranslated: boolean;
  isTranslating: boolean;
  targetLanguage: string;
  setTranslatedData: (data: Record<string, string>) => void;
  setIsTranslated: (translated: boolean) => void;
  setIsTranslating: (translating: boolean) => void;
  setTargetLanguage: (language: string) => void;
  updateTargetLanguage: (language: string) => void;
  getTranslatedText: (originalText: string, key?: string) => string;
  clearTranslations: () => void;
  saveTranslatedData: (data: Record<string, string>) => void;
  saveIsTranslated: (translated: boolean) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translatedData, setTranslatedData] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('translatedData');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isTranslated, setIsTranslated] = useState(() => {
    try {
      const saved = localStorage.getItem('isTranslated');
      const language = localStorage.getItem('selectedLanguage') || 'ko';
      const savedData = localStorage.getItem('translatedData');
      console.log('번역 상태 복원:', { saved, language, hasData: !!savedData });
      return saved === 'true' && language !== 'ko' && !!savedData;
    } catch {
      return false;
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(() => {
    try {
      return localStorage.getItem('selectedLanguage') || 'ko';
    } catch {
      return 'ko';
    }
  });

  const getTranslatedText = (originalText: string, key?: string) => {
    console.log('getTranslatedText 호출:', {
      originalText: originalText?.substring(0, 30) + '...',
      key,
      isTranslated,
      hasData: Object.keys(translatedData).length > 0,
      translatedValue: translatedData[key || ''],
      allKeys: Object.keys(translatedData).slice(0, 5)
    });
    
    if (!isTranslated || !originalText) return originalText;
    
    const lookupKey = key || originalText;
    const result = translatedData[lookupKey] || originalText;
    
    if (key && translatedData[key]) {
      console.log(`번역 성공: ${key} → ${result}`);
    }
    
    return result;
  };

  const clearTranslations = () => {
    setTranslatedData({});
    setIsTranslated(false);
    localStorage.removeItem('translatedData');
    localStorage.removeItem('isTranslated');
  };

  const updateTargetLanguage = (language: string) => {
    setTargetLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    if (language === 'ko') {
      clearTranslations();
    } else {
      // 한국어가 아닌 언어로 변경 시, 기존 번역 데이터가 있다면 번역 상태 유지
      const savedData = localStorage.getItem('translatedData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (Object.keys(parsedData).length > 0) {
            saveIsTranslated(true);
          }
        } catch (e) {
          console.error('번역 데이터 파싱 오류:', e);
        }
      }
    }
  };

  // 번역 데이터 저장 시 로컬 스토리지에도 저장
  const saveTranslatedData = (data: Record<string, string>) => {
    setTranslatedData(data);
    localStorage.setItem('translatedData', JSON.stringify(data));
  };

  const saveIsTranslated = (translated: boolean) => {
    setIsTranslated(translated);
    localStorage.setItem('isTranslated', translated.toString());
  };

  // 페이지 로딩 시 번역 상태 복원
  useEffect(() => {
    const restoreTranslationState = () => {
      try {
        const saved = localStorage.getItem('isTranslated');
        const language = localStorage.getItem('selectedLanguage') || 'ko';
        const savedData = localStorage.getItem('translatedData');
        
        console.log('번역 상태 복원 시도:', { saved, language, hasData: !!savedData });
        
        if (saved === 'true' && language !== 'ko' && savedData) {
          const parsedData = JSON.parse(savedData);
          if (Object.keys(parsedData).length > 0) {
            setTranslatedData(parsedData);
            setIsTranslated(true);
            setTargetLanguage(language);
            console.log('번역 상태 복원 성공:', Object.keys(parsedData).length, '개 키');
          }
        }
      } catch (error) {
        console.error('번역 상태 복원 실패:', error);
      }
    };

    restoreTranslationState();
  }, []);

  return (
    <TranslationContext.Provider value={{
      translatedData,
      isTranslated,
      isTranslating,
      targetLanguage,
      setTranslatedData,
      setIsTranslated,
      setIsTranslating,
      setTargetLanguage,
      updateTargetLanguage,
      getTranslatedText,
      clearTranslations,
      saveTranslatedData,
      saveIsTranslated
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}