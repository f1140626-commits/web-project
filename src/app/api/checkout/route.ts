import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-ignore
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "請先登入後再進行結帳" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;
    
    // 檢查使用者是否已驗證電子郵件
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    });

    if (!user?.emailVerified) {
      return NextResponse.json({ error: "請先驗證您的電子郵件後才能進行結帳" }, { status: 403 });
    }

    const body = await req.json();
    const { items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "購物車是空的" }, { status: 400 });
    }

    // 1. 驗證庫存並將商品分組 (同一商品可能有多個方案)
    const productQuantities: Record<string, number> = {};
    for (const item of items) {
      if (!productQuantities[item.productId]) {
        productQuantities[item.productId] = 0;
      }
      productQuantities[item.productId] += item.quantity;
    }

    // 檢查每個商品的庫存
    for (const [productId, requiredQty] of Object.entries(productQuantities)) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "無效的商品" }, { status: 400 });
      }
      if (product.stock < requiredQty) {
        return NextResponse.json({ 
          error: `[庫存不足] ${product.name} 目前庫存僅剩 ${product.stock}，請減少購買數量。` 
        }, { status: 400 });
      }
    }

    // 2. 使用 Prisma Transaction 建立訂單與扣除庫存
    const order = await prisma.$transaction(async (tx) => {
      
      // 扣除庫存
      for (const [productId, requiredQty] of Object.entries(productQuantities)) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: requiredQty } }
        });
      }

      // 建立訂單與訂單項目
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PAID", // 已付款但待發貨
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              planName: item.planName,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      return newOrder;
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: "結帳成功！請等待管理員發配序號。"
    }, { status: 200 });

  } catch (error) {
    console.error("結帳失敗:", error);
    return NextResponse.json({ error: "伺服器發生錯誤，無法完成結帳" }, { status: 500 });
  }
}
