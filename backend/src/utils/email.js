import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo transporter cho nodemailer sử dụng SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465', // true cho port 465 (SSL), false cho các port khác (e.g. 587 TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email, otpCode, type = 'register') {
  let subject = 'Xác thực tài khoản - LiemResearch';
  let message = `Mã OTP xác thực đăng ký tài khoản của bạn là: <b style="font-size: 18px; color: #1e40af;">${otpCode}</b>. Mã này có hiệu lực trong vòng 15 phút.`;

  if (type === 'forgot') {
    subject = 'Khôi phục mật khẩu - LiemResearch';
    message = `Mã OTP khôi phục mật khẩu tài khoản của bạn là: <b style="font-size: 18px; color: #dc2626;">${otpCode}</b>. Mã này có hiệu lực trong vòng 15 phút. Vui lòng tuyệt đối không chia sẻ mã này với bất kỳ ai.`;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"LiemResearch Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">${subject}</h2>
        <p style="font-size: 15px; color: #334155;">Xin chào,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">${message}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Không thể gửi email OTP qua Nodemailer:', err);
    throw err;
  }
}

export async function sendVerificationEmail(email, verificationUrl) {
  const subject = 'Verify your LiemResearch account';

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"LiemResearch Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">Verify your account</h2>
        <p style="font-size: 15px; color: #334155;">Hello,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Please click the button below to verify your LiemResearch account.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #1e40af; color: #ffffff; text-decoration: none; font-weight: 700;">Verify email</a>
        </p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">This link expires in 24 hours. If the button does not work, copy and paste this URL into your browser:</p>
        <p style="font-size: 13px; color: #1e40af; word-break: break-all;">${verificationUrl}</p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Cannot send verification email via Nodemailer:', err);
    throw err;
  }
}
