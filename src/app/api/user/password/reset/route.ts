import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "所有欄位皆為必填" },
        { status: 400 }
      );
    }

    const unexpiredToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
        expires: { gt: new Date() },
      },
    });

    if (!unexpiredToken) {
      return NextResponse.json(
        { message: "驗證碼無效或已過期" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "無法重設密碼" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete token so it can't be reused
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ message: "密碼重設成功" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "系統錯誤，請確認輸入資訊" },
      { status: 500 }
    );
  }
}
