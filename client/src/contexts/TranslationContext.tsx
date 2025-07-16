import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translatedData, setTranslatedData] = useState<Record<string, string>>({});
  const [isTranslated, setIsTranslated] = useState(false);
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
  };

  const updateTargetLanguage = (language: string) => {
    setTargetLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    // 언어 변경 시 기존 번역 데이터 초기화
    clearTranslations();
  };

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
      clearTranslations
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