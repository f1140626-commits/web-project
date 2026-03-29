import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await req.json();

    if (name !== undefined && name.trim() === "") {
      return NextResponse.json({ error: "名稱不能為空" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;

    // @ts-ignore
    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: updateData
    });

    return NextResponse.json({ success: true, user: { name: updatedUser.name, image: updatedUser.image } }, { status: 200 });

  } catch (error) {
    console.error("更新名稱失敗:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}
