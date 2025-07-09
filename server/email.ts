import { Resend } from 'resend';

// Resend 인스턴스를 lazy하게 생성
let resend: Resend | null = null;

function getResendInstance(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not properly configured. Email functionality may not work.");
      throw new Error("RESEND_API_KEY is required");
    }
    console.log("✅ Resend API key configured");
    resend = new Resend(apiKey);
  }
  return resend;
}

interface EmailVerificationParams {
  to: string;
  verificationCode: string;
  verificationLink: string;
}

export async function sendEmailVerification({
  to,
  verificationCode,
  verificationLink
}: EmailVerificationParams): Promise<boolean> {
  try {
    console.log('🔄 Attempting to send email verification to:', to);
    console.log('📧 Verification code:', verificationCode);
    const resendInstance = getResendInstance();
    const { data, error } = await resendInstance.emails.send({
      from: 'Housing Buddy <onboarding@resend.dev>',
      to: [to],
      subject: '🏠 Housing Buddy 이메일 인증',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .code { background: #e2e8f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px; margin: 20px 0; letter-spacing: 3px; }
            .button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Housing Buddy</h1>
              <p>이메일 인증을 완료해주세요</p>
            </div>
            <div class="content">
              <h2>안녕하세요!</h2>
              <p>Housing Buddy에 가입해주셔서 감사합니다. 계정 활성화를 위해 이메일 인증이 필요합니다.</p>
              
              <p><strong>인증 코드:</strong></p>
              <div class="code">${verificationCode}</div>
              
              <p>또는 아래 버튼을 클릭하여 인증을 완료하세요:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">이메일 인증 완료</a>
              </div>
              
              <p><small>이 링크는 24시간 후 만료됩니다. 인증 코드나 링크가 작동하지 않으면 새로운 인증을 요청해주세요.</small></p>
            </div>
            <div class="footer">
              <p>이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.</p>
              <p>© 2025 Housing Buddy. 한국의 외국인을 위한 부동산 플랫폼</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    console.log('Email verification sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send email verification:', error);
    return false;
  }
}

interface WelcomeEmailParams {
  to: string;
  userName: string;
}

export async function sendWelcomeEmail({
  to,
  userName
}: WelcomeEmailParams): Promise<boolean> {
  try {
    const resendInstance = getResendInstance();
    const { data, error } = await resendInstance.emails.send({
      from: 'Housing Buddy <onboarding@resend.dev>',
      to: [to],
      subject: '🎉 Housing Buddy에 오신 것을 환영합니다!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
            .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 15px 0; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 환영합니다!</h1>
              <p>Housing Buddy 가족이 되어주셔서 감사합니다</p>
            </div>
            <div class="content">
              <h2>안녕하세요, ${userName}님!</h2>
              <p>이메일 인증이 완료되었습니다. 이제 Housing Buddy의 모든 기능을 이용하실 수 있습니다.</p>
              
              <div class="features">
                <h3>🏠 이용 가능한 기능들:</h3>
                <div class="feature">✅ <strong>부동산 매물 탐색</strong> - 한국 전역의 임대 매물 검색</div>
                <div class="feature">✅ <strong>다국어 번역</strong> - 매물 정보를 여러 언어로 번역</div>
                <div class="feature">✅ <strong>매물 문의</strong> - 관심 있는 매물에 직접 문의</div>
                <div class="feature">✅ <strong>즐겨찾기</strong> - 마음에 드는 매물을 저장하고 관리</div>
                <div class="feature">✅ <strong>부동산 용어 도움말</strong> - 한국 부동산 용어 설명</div>
              </div>
              
              <p>궁금한 점이 있으시면 언제든 문의해주세요. 한국에서의 새로운 시작을 응원합니다!</p>
            </div>
            <div class="footer">
              <p>© 2025 Housing Buddy. 한국의 외국인을 위한 부동산 플랫폼</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend welcome email error:', error);
      return false;
    }

    console.log('Welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}