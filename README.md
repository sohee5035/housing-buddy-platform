# Housing Buddy Platform

한국 부동산 임대 매물 등록 및 관리 플랫폼

## 🏠 프로젝트 소개
Housing Buddy는 한국어 부동산 임대 매물을 등록하고 관리할 수 있는 웹 플랫폼입니다. 보증금/월세/관리비 형태의 한국 부동산 가격 체계를 지원하며, 다국어 번역, 휴지통 기능, 관리자 인증 등의 기능을 제공합니다.

## 🚀 주요 기능
- 매물 등록/편집/삭제
- 구글 번역 API 연동 (다국어 지원)
- 휴지통 기능 (소프트 삭제/복원)
- 이미지 업로드 (붙여넣기 지원)
- 카테고리 관리 (동적 생성)
- 지도 연동 (Google Maps iframe)
- 부동산 용어 툴팁
- 댓글 시스템 (비밀번호 보호, 관리자 전용 댓글)
- 관리자 인증 시스템

## 🛠 기술 스택
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + React Context
- **Authentication**: 관리자 비밀번호 인증

## 📱 모바일 지원
- 반응형 디자인
- 모바일 최적화된 댓글 시스템
- 터치 친화적인 UI/UX

## 🌐 다국어 지원
- Google Translate API 연동
- 부동산 용어 한-영 번역
- 다양한 언어 지원

## 💾 데이터 보호
- 소프트 삭제 (휴지통 기능)
- 데이터 복원 기능
- 관리자 전용 영구 삭제

## 🔧 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 데이터베이스 마이그레이션
npm run db:push
```

## 📝 환경 변수
```
DATABASE_URL=your_postgresql_url
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 📊 데이터베이스 스키마
- **properties**: 매물 정보 (제목, 주소, 가격, 이미지 등)
- **comments**: 댓글 시스템 (작성자, 내용, 비밀번호 등)

## 🎨 UI 컴포넌트
- shadcn/ui 기반 컴포넌트
- 다크 모드 지원
- 모바일 최적화

## 📱 반응형 디자인
- 데스크톱, 태블릿, 모바일 완전 지원
- 터치 제스처 지원
- 모바일 전용 UI 최적화

## 🔐 관리자 기능
- 관리자 로그인 시스템
- 매물 관리 (CRUD)
- 댓글 관리 및 메모 기능
- 휴지통 관리
- 카테고리 관리

---

**개발자**: sohee5035  
**최종 업데이트**: 2025-07-09