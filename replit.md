# 부동산 매물 플랫폼

## 프로젝트 개요
한국어 부동산 임대 매물 등록 및 관리 플랫폼입니다. 보증금/월세/관리비 형태의 한국 부동산 가격 체계를 지원하며, 다국어 번역, 휴지통 기능, 관리자 인증 등의 기능을 제공합니다.

## 최근 변경사항 (2025-01-07)
- ✅ 모바일 환경 최적화 이미지 갤러리 완성
- ✅ 터치 스와이프 제스처로 이미지 전환 기능
- ✅ 모바일/PC 구분 UI (풀스크린 vs 모달)
- ✅ 모바일 헤더 UI 개선 (두 줄 배치로 화면 넘침 방지)
- ✅ 서버 성능 최적화 (30초 TTL 캐시, DB 연결 풀, Keep-Alive)
- ✅ 데이터베이스 웜업 및 캐시 프리로딩으로 첫 로딩 속도 개선
- 🎯 고객 데모용 매물 등록 준비 완료

## 사용자 선호사항
- 한국어로 소통
- 간단하고 직관적인 인터페이스
- 데이터 영구 보존 중요
- 실험하기 전 백업 필요

## 프로젝트 아키텍처
- Frontend: React + TypeScript + Vite
- Backend: Express.js + Node.js
- Database: PostgreSQL (Neon)
- UI: Tailwind CSS + shadcn/ui
- State: TanStack Query + React Context
- Auth: 관리자 비밀번호 인증 (1234)

## 주요 기능
1. 매물 등록/편집/삭제
2. 구글 번역 API 연동
3. 휴지통 (소프트 삭제/복원)
4. 이미지 업로드 (붙여넣기 지원)
5. 카테고리 관리 (동적 생성)
6. 지도 연동 (Google Maps iframe)
7. 부동산 용어 툴팁

## 개발 환경
- Node.js + npm
- PostgreSQL 데이터베이스
- Google Translate API 키 필요