import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return new NextResponse("Missing data", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (exist) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token and expiration (24 hours)
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // 在 .env 是用 SMTP_PASSWORD
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '') || "http://hw-cloud.org";
    const verificationLink = `${baseUrl}/api/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "【帳號驗證】歡迎加入 HW 商城 - 請驗證您的電子信箱",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-md mx-auto bg-slate-900 text-slate-200 p-8 rounded-2xl shadow-2xl border border-white/10" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fff; font-size: 24px; font-weight: bold; margin: 0;">歡迎加入 HW 商城 🎉</h1>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">您好 ${name || '新會員'}，請點擊下方按鈕驗證您的電子信箱，以啟用完整會員功能：</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(to right, #8b5cf6, #d946ef); color: #ffffff !important; text-decoration: none; font-weight: bold; padding: 16px 32px; border-radius: 12px; font-size: 16px; transition: opacity 0.2s; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);">驗證帳號</a>
          </div>

          <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 13px; margin: 0; word-break: break-all; text-align: center;">
              如果上方的按鈕無法點擊，請複製以下連結並貼上至您的瀏覽器網址列：<br><br>
              <a href="${verificationLink}" style="color: #a855f7; text-decoration: none;">${verificationLink}</a>
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            如果您沒有註冊本網站，請忽略此郵件。
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Registration successful. Please check your email to verify your account." });

  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
