import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Please click on the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
