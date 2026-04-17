import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendPasswordResetOtpEmail({ to, fullName, otp, expiresMinutes = 15 }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("SMTP is not configured. Skipping password reset email.");
    return false;
  }

  const appName = process.env.APP_NAME || "MediClinic";
  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;

  await transporter.sendMail({
    from,
    to,
    subject: `${appName} password reset OTP`,
    text: `Hi ${fullName || "there"},\n\nUse this OTP to reset your password: ${otp}\n\nThis OTP expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `
      <p>Hi ${fullName || "there"},</p>
      <p>Use the OTP below to reset your password:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 3px;">${otp}</p>
      <p>This OTP expires in ${expiresMinutes} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });

  return true;
}
