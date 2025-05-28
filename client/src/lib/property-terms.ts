// 부동산 용어 사전
export interface PropertyTerm {
  korean: string;
  english: string;
  explanation: string;
  category: 'room_type' | 'location' | 'facility' | 'price' | 'general';
}

export const propertyTerms: PropertyTerm[] = [
  // 방 종류
  {
    korean: '원룸',
    english: 'One-room',
    explanation: 'A single room apartment where the bedroom and living area are combined, with a separate bathroom',
    category: 'room_type'
  },
  {
    korean: '투룸',
    english: 'Two-room',
    explanation: 'An apartment with two separate rooms - typically one bedroom and one living room',
    category: 'room_type'
  },
  {
    korean: '오피스텔',
    english: 'Officetel',
    explanation: 'A mixed-use building that can function as both office space and residential accommodation',
    category: 'room_type'
  },
  {
    korean: '복층',
    english: 'Duplex',
    explanation: 'A two-story apartment unit within a building',
    category: 'room_type'
  },
  
  // 지역/위치
  {
    korean: '강남구',
    english: 'Gangnam-gu',
    explanation: 'An affluent district in Seoul, known for business, shopping, and entertainment',
    category: 'location'
  },
  {
    korean: '홍대',
    english: 'Hongdae',
    explanation: 'University area known for nightlife, clubs, and young culture near Hongik University',
    category: 'location'
  },
  {
    korean: '잠실',
    english: 'Jamsil',
    explanation: 'District in Seoul known for Lotte World Tower and sports facilities',
    category: 'location'
  },
  {
    korean: '이태원',
    english: 'Itaewon',
    explanation: 'International district in Seoul popular with foreigners and expats',
    category: 'location'
  },
  {
    korean: '성수동',
    english: 'Seongsu-dong',
    explanation: 'Trendy neighborhood known for cafes, art galleries, and creative spaces',
    category: 'location'
  },
  
  // 시설/편의
  {
    korean: '엘리베이터',
    english: 'Elevator',
    explanation: 'Essential facility in Korean apartments, especially important for higher floors',
    category: 'facility'
  },
  {
    korean: '주차장',
    english: 'Parking',
    explanation: 'Parking space availability, often limited and valuable in Korean cities',
    category: 'facility'
  },
  {
    korean: '24시간 보안',
    english: '24-hour security',
    explanation: 'Round-the-clock security service common in newer apartment complexes',
    category: 'facility'
  },
  {
    korean: '헬스장',
    english: 'Gym',
    explanation: 'Fitness facility within the apartment complex',
    category: 'facility'
  },
  {
    korean: '수영장',
    english: 'Swimming pool',
    explanation: 'Pool facility, usually found in luxury apartment complexes',
    category: 'facility'
  },
  {
    korean: '루프탑',
    english: 'Rooftop',
    explanation: 'Rooftop terrace or space, popular for city views and outdoor activities',
    category: 'facility'
  },
  
  // 가격/계약
  {
    korean: '보증금',
    english: 'Deposit',
    explanation: 'Large lump sum paid upfront, returned at the end of lease (Jeonse system)',
    category: 'price'
  },
  {
    korean: '월세',
    english: 'Monthly rent',
    explanation: 'Monthly rental payment in addition to deposit',
    category: 'price'
  },
  {
    korean: '관리비',
    english: 'Maintenance fee',
    explanation: 'Monthly fee for building maintenance, utilities, and common area upkeep',
    category: 'price'
  },
  
  // 일반
  {
    korean: '신축',
    english: 'Newly built',
    explanation: 'Recently constructed building, usually within 1-2 years',
    category: 'general'
  },
  {
    korean: '감성',
    english: 'Emotional/Sentimental',
    explanation: 'Korean term describing stylish, aesthetic interior design with emotional appeal',
    category: 'general'
  },
  {
    korean: '한강뷰',
    english: 'Han River view',
    explanation: 'View of the Han River, considered premium and desirable in Seoul real estate',
    category: 'general'
  }
];

// 텍스트에서 용어 찾기
export function findPropertyTerms(text: string): PropertyTerm[] {
  return propertyTerms.filter(term => 
    text.includes(term.korean) || text.includes(term.english)
  );
}

// 특정 용어 찾기
export function findTermByText(text: string): PropertyTerm | undefined {
  return propertyTerms.find(term => 
    term.korean === text || term.english.toLowerCase() === text.toLowerCase()
  );
}