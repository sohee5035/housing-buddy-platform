import PropertyTermTooltip from "./property-term-tooltip";
import { findPropertyTerms } from "@/lib/property-terms";

interface SmartTextWithTooltipsProps {
  text: string;
  originalText?: string;
  isTranslated?: boolean;
  className?: string;
}

export default function SmartTextWithTooltips({ 
  text, 
  originalText, 
  isTranslated = false, 
  className 
}: SmartTextWithTooltipsProps) {
  // 텍스트에서 부동산 용어 찾기
  const terms = findPropertyTerms(text);
  const originalTerms = originalText ? findPropertyTerms(originalText) : [];
  const allTerms = [...terms, ...originalTerms];
  
  if (allTerms.length === 0) {
    // 용어가 없어도 줄바꿈 처리
    const parts = text.split('\n');
    if (parts.length === 1) {
      return <span className={className}>{text}</span>;
    }
    return (
      <span className={className}>
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 && <br />}
            {part}
          </span>
        ))}
      </span>
    );
  }

  // 텍스트를 부분으로 나누고 용어가 있는 부분에 툴팁 적용
  const renderTextWithTooltips = (inputText: string) => {
    let result: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // 모든 용어를 찾아서 위치 정보와 함께 정렬
    const termMatches: Array<{
      term: string;
      start: number;
      end: number;
      isKorean: boolean;
    }> = [];
    
    allTerms.forEach(termObj => {
      // 한국어 용어 찾기
      const koreanIndex = inputText.indexOf(termObj.korean);
      if (koreanIndex !== -1) {
        termMatches.push({
          term: termObj.korean,
          start: koreanIndex,
          end: koreanIndex + termObj.korean.length,
          isKorean: true
        });
      }
      
      // 영어 용어 찾기 (대소문자 구분 없이)
      const englishLower = termObj.english.toLowerCase();
      const textLower = inputText.toLowerCase();
      const englishIndex = textLower.indexOf(englishLower);
      if (englishIndex !== -1) {
        termMatches.push({
          term: inputText.substring(englishIndex, englishIndex + termObj.english.length),
          start: englishIndex,
          end: englishIndex + termObj.english.length,
          isKorean: false
        });
      }
    });
    
    // 중복 제거 및 위치순 정렬
    const uniqueMatches = termMatches
      .filter((match, index, array) => 
        array.findIndex(m => m.start === match.start && m.end === match.end) === index
      )
      .sort((a, b) => a.start - b.start);
    
    uniqueMatches.forEach((match, index) => {
      // 이전 용어와 현재 용어 사이의 텍스트 추가
      if (match.start > lastIndex) {
        const textBetween = inputText.substring(lastIndex, match.start);
        // 줄바꿈을 React 요소로 변환
        const parts = textBetween.split('\n');
        parts.forEach((part, partIndex) => {
          if (partIndex > 0) result.push(<br key={`br-${lastIndex}-${partIndex}`} />);
          if (part) result.push(part);
        });
      }
      
      // 툴팁이 적용된 용어 추가
      result.push(
        <PropertyTermTooltip
          key={`${match.start}-${match.end}-${index}`}
          text={match.term}
          originalText={originalText}
          isTranslated={isTranslated}
        >
          {match.term}
        </PropertyTermTooltip>
      );
      
      lastIndex = match.end;
    });
    
    // 마지막 용어 이후의 텍스트 추가
    if (lastIndex < inputText.length) {
      const remainingText = inputText.substring(lastIndex);
      // 줄바꿈을 React 요소로 변환
      const parts = remainingText.split('\n');
      parts.forEach((part, partIndex) => {
        if (partIndex > 0) result.push(<br key={`br-final-${partIndex}`} />);
        if (part) result.push(part);
      });
    }
    
    return result;
  };

  return (
    <span className={className}>
      {renderTextWithTooltips(text)}
    </span>
  );
}