# Housing Buddy API Keys & External Services

## 🔑 Current API Keys (2025-07-11)

### 1. Resend Email Service
- **API Key**: `re_43imXPMR_EbrgwjB7zsWGLEUAmxBLX9XT`
- **Domain**: `onboarding@resend.dev`
- **Status**: ✅ Active
- **Usage**: 이메일 인증, 환영 이메일 발송

### 2. Neon PostgreSQL Database
- **Connection**: `DATABASE_URL` (환경변수로 관리)
- **Plan**: Free Tier (0.5GB)
- **Status**: ✅ Active
- **Current Usage**: 8.9MB / 512MB (1.7%)

### 3. Cloudinary Image Service
- **Status**: ❌ Not Configured
- **Required Environment Variables**:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- **Usage**: 이미지 업로드, 최적화, 저장

### 4. Google Services
- **Google Maps**: ✅ Active (iframe embedding)
- **Google Translate API**: ❌ Not Configured
  - Required: `GOOGLE_TRANSLATE_API_KEY`
  - Usage: 다국어 번역 기능

### 5. Session Management
- **Session Secret**: `housing-buddy-super-secret-key-for-sessions-2025`
- **Storage**: PostgreSQL (connect-pg-simple)
- **Status**: ✅ Active

## 🔒 Security Notes

### Environment Variables (.env)
```
RESEND_API_KEY=re_43imXPMR_EbrgwjB7zsWGLEUAmxBLX9XT
SESSION_SECRET=housing-buddy-super-secret-key-for-sessions-2025
DATABASE_URL=[AUTO_MANAGED_BY_REPLIT]
```

### Missing Keys (To Be Configured)
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
```

## 📋 Service Status Summary

| Service | Status | Monthly Limit | Current Usage |
|---------|---------|---------------|---------------|
| Resend Email | ✅ Active | 3,000 emails | < 10 emails |
| Neon DB | ✅ Active | 0.5GB | 8.9MB (1.7%) |
| Cloudinary | ❌ Needs Setup | 25GB bandwidth | Not used |
| Google Translate | ❌ Needs Setup | $300 free credits | Not used |

## 🚀 Next Steps

1. **Cloudinary 설정** - 이미지 업로드 기능 활성화
2. **Google Translate 설정** - 번역 기능 활성화
3. **도메인 구매** - 이메일 발송 도메인 개선
4. **SSL 인증서** - 보안 강화

## 📞 Contact & Support

- **Resend Support**: support@resend.com
- **Neon Support**: support@neon.tech
- **Cloudinary Support**: support@cloudinary.com
- **Google Cloud Support**: Google Cloud Console

---
*Last Updated: 2025-07-11*
*Project: Housing Buddy*