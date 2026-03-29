import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "請輸入信箱" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if the user exists or not for security, just pretend it sent
      return NextResponse.json({ message: "若信箱存在，驗證碼已發送" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
        from: `"系統通知" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "🔒 忘記密碼 - 驗證碼",
        html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-md mx-auto bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-2xl border border-white/10" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">重設您的密碼</h1>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">請使用以下 6 位數驗證碼來重設密碼</p>
          </div>
          
          <div style="background: linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
            <div style="letter-spacing: 0.5em; font-size: 40px; font-weight: 900; color: #a855f7; font-family: monospace;">${otp}</div>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
            驗證碼將在 <strong style="color: #fff;">15 分鐘</strong> 後過期。<br/>
            如果您沒有請求重設密碼，請忽略此郵件。
          </p>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "若信箱存在，驗證碼已發送" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "系統錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
