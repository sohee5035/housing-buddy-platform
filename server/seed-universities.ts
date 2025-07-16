import { db } from "./db";
import { universities } from "@shared/schema";

const universityData = [
  { 
    name: "서울대학교", 
    nameEn: "Seoul National University", 
    location: "관악구", 
    latitude: "37.4601", 
    longitude: "126.9521", 
    icon: "🏛️" 
  },
  { 
    name: "연세대학교", 
    nameEn: "Yonsei University", 
    location: "서대문구", 
    latitude: "37.5665", 
    longitude: "126.9388", 
    icon: "🎓" 
  },
  { 
    name: "고려대학교", 
    nameEn: "Korea University", 
    location: "성북구", 
    latitude: "37.5895", 
    longitude: "127.0282", 
    icon: "📚" 
  },
  { 
    name: "홍익대학교", 
    nameEn: "Hongik University", 
    location: "마포구", 
    latitude: "37.5510", 
    longitude: "126.9220", 
    icon: "🎨" 
  },
  { 
    name: "이화여자대학교", 
    nameEn: "Ewha Womans University", 
    location: "서대문구", 
    latitude: "37.5594", 
    longitude: "126.9463", 
    icon: "🌸" 
  },
  { 
    name: "서강대학교", 
    nameEn: "Sogang University", 
    location: "마포구", 
    latitude: "37.5509", 
    longitude: "126.9409", 
    icon: "⭐" 
  },
  { 
    name: "성균관대학교", 
    nameEn: "Sungkyunkwan University", 
    location: "종로구", 
    latitude: "37.5888", 
    longitude: "126.9921", 
    icon: "📖" 
  },
  { 
    name: "경희대학교", 
    nameEn: "Kyung Hee University", 
    location: "동대문구", 
    latitude: "37.5959", 
    longitude: "127.0515", 
    icon: "🌍" 
  },
];

export async function seedUniversities() {
  try {
    console.log("대학교 데이터 초기화 시작...");
    
    for (const uni of universityData) {
      await db.insert(universities).values(uni).onConflictDoNothing();
    }
    
    console.log("대학교 데이터 초기화 완료!");
  } catch (error) {
    console.error("대학교 데이터 초기화 오류:", error);
  }
}

// 직접 실행 시
if (require.main === module) {
  seedUniversities().then(() => {
    console.log("초기화 완료");
    process.exit(0);
  });
}