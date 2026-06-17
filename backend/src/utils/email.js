import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const fromAddress = process.env.EMAIL_FROM || `"LiemResearch Team" <${process.env.EMAIL_USER}>`;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465',
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('[Email Config]', {
  provider: process.env.RESEND_API_KEY ? 'resend' : 'smtp',
  resendKeySet: Boolean(process.env.RESEND_API_KEY),
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || '587',
  userSet: Boolean(process.env.EMAIL_USER),
  passSet: Boolean(process.env.EMAIL_PASS),
  fromSet: Boolean(process.env.EMAIL_FROM),
});

export function getEmailErrorDetails(error) {
  return {
    code: error?.code || null,
    command: error?.command || null,
    responseCode: error?.responseCode || null,
    response: error?.response || error?.message || 'Unknown email error',
  };
}

async function sendEmail(mailOptions) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailOptions.from,
        to: [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data?.message || data?.error || `Resend API error ${response.status}`);
      error.code = 'RESEND_API_ERROR';
      error.responseCode = response.status;
      error.response = JSON.stringify(data);
      throw error;
    }

    return data;
  }

  return transporter.sendMail(mailOptions);
}

export async function sendOTPEmail(email, otpCode, type = 'register') {
  let subject = 'Account verification - LiemResearch';
  let message = `Your account verification OTP is: <b style="font-size: 18px; color: #1e40af;">${otpCode}</b>. This code expires in 15 minutes.`;

  if (type === 'forgot') {
    subject = 'Password recovery - LiemResearch';
    message = `Your password recovery OTP is: <b style="font-size: 18px; color: #dc2626;">${otpCode}</b>. This code expires in 15 minutes. Do not share this code with anyone.`;
  }

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">${subject}</h2>
        <p style="font-size: 15px; color: #334155;">Hello,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">${message}</p>
      </div>
    `,
  };

  try {
    return await sendEmail(mailOptions);
  } catch (err) {
    console.error('Cannot send OTP email:', err);
    throw err;
  }
}

export async function sendVerificationEmail(email, verificationUrl) {
  const subject = 'Verify your LiemResearch account';

  const mailOptions = {
    from: fromAddress,
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
    return await sendEmail(mailOptions);
  } catch (err) {
    console.error('Cannot send verification email:', err);
    throw err;
  }
}
