import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "禁止存取" }, { status: 403 });
    }

    const body = await req.json();
    const { name, categoryId, description, status, stock, pricePlans, imageUrl } = body;

    if (!name || !categoryId || !pricePlans || pricePlans.length === 0) {
      return NextResponse.json({ error: "必填資料缺失或尚未新增價格方案" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId,
        description,
        imageUrl,
        status,
        stock: stock || 0,
        pricePlans: {
          create: pricePlans.map((plan: any) => ({
            name: plan.name,
            durationDays: plan.durationDays > 0 ? plan.durationDays : null,
            price: Number(plan.price)
          }))
        }
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("建立商品失敗:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
