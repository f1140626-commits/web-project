import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.email) {
      return NextResponse.json({ error: "找不到綁定的電子信箱" }, { status: 400 });
    }

    // 產生 6 位數隨機驗證碼
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 儲存至 VerificationToken (有效期限 10 分鐘)
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
    // 如果之前有產生過驗證碼，先刪除舊的 (或直接 upsert)
    // 因 schema 中 unique key 是 @@unique([identifier, token])，直接刪除該 email 所有舊 token 最簡單
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: code,
        expires,
      },
    });

    // 透過 Nodemailer 寄送電子郵件
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
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "【安全驗證】HW 商城 - 密碼重置驗證碼",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-md mx-auto bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-2xl border border-white/10" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">變更您的密碼</h1>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">請使用以下 6 位數驗證碼來驗證您的身分</p>
          </div>
          
          <div style="background: linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
            <div style="letter-spacing: 0.5em; font-size: 40px; font-weight: 900; color: #a855f7; font-family: monospace;">${code}</div>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
            驗證碼將在 <strong style="color: #fff;">10 分鐘</strong> 後過期。<br/>
            如果您沒有請求變更密碼，請忽略此郵件，您的帳號仍然安全。
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "驗證碼已寄出" }, { status: 200 });

  } catch (error) {
    console.error("發送驗證碼失敗:", error);
    return NextResponse.json({ error: "伺服器內部錯誤，無法寄送郵件" }, { status: 500 });
  }
}
