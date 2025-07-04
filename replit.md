# 부동산 매물 플랫폼

## 프로젝트 개요
한국어 부동산 임대 매물 등록 및 관리 플랫폼입니다. 보증금/월세/관리비 형태의 한국 부동산 가격 체계를 지원하며, 다국어 번역, 휴지통 기능, 관리자 인증 등의 기능을 제공합니다.

## 최근 변경사항 (2025-01-04)
- ✅ 5개 복제 문제 해결 (새 웹 주소 배포)
- ✅ PostgreSQL 데이터베이스 구현으로 영구 데이터 저장
- ✅ 서버 재시작 후 데이터 유지 확인
- ✅ 상단 로고 클릭으로 메인 화면 이동 기능 추가
- 📝 현재 상태를 "부동산임대 백업본" 프로젝트로 백업 진행중

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