const nodemailer = require("nodemailer");

const sendotp = async (Email, otp) => {
  const googlePass = process.env.GOOGLE_PASS ? process.env.GOOGLE_PASS.trim() : "";
  if (!googlePass) {
    throw new Error("GOOGLE_PASS environment variable is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "jeelgor10@gmail.com",
      pass: googlePass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"Tours & Travels" <jeelgor10@gmail.com>`,
    to: Email,
    subject: `Your Login OTP: ${otp} - Tours & Travels`,
    text: `Your One-Time Password (OTP) for Tours & Travels is: ${otp}. It is valid for 5 minutes. Please do not share this OTP with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Tours & Travels</h2>
        <p style="color: #475569; font-size: 15px; margin-bottom: 20px;">Use the following One-Time Password (OTP) to complete your login:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code is valid for <strong>5 minutes</strong>. If you did not request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">Tours & Travels Platform &bull; Secure Authentication</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendotp;
