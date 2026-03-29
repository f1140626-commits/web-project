import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, verificationCode } = await req.json();

    if (!currentPassword || !newPassword || !verificationCode) {
      return NextResponse.json({ error: "請提供當前密碼、新密碼與驗證碼" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密碼長度至少需6個字元" }, { status: 400 });
    }

    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.password || !user.email) {
      return NextResponse.json({ error: "用戶不存在或為第三方登入，無法修改密碼" }, { status: 400 });
    }

    // 驗證 郵件驗證碼
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: user.email,
        token: verificationCode,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "驗證碼不正確或已失效" }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "驗證碼已過期，請重新發送" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "當前密碼不正確" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密碼並刪除驗證碼
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: user.email,
            token: verificationCode
          }
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "密碼修改成功" }, { status: 200 });

  } catch (error) {
    console.error("修改密碼失敗:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}
