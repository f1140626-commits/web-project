import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;
    const body = await req.json();
    const { items, totalAmount } = body;

    // 改為使用 Discord Bot Token 與指定的 Channel ID 來發送請求
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_TICKET_CHANNEL_ID;
    
    if (!botToken || !channelId) {
      console.warn("DISCORD_BOT_TOKEN 或 DISCORD_TICKET_CHANNEL_ID 尚未設定！無法發送 Discord API 請求。");
      return NextResponse.json({ error: "系統尚未設定 Discord 機器人，請聯絡管理員。" }, { status: 500 });
    }

    // 1. 驗證庫存並將商品分組 (同一商品可能有多個方案)
    const productQuantities: Record<string, number> = {};
    for (const item of items) {
      if (!productQuantities[item.productId]) {
        productQuantities[item.productId] = 0;
      }
      productQuantities[item.productId] += item.quantity;
    }

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

    // 將商品與方案格式化，確保符合 用戶名 商品 時效 數量
    const itemsListStr = items.map((i: any, index: number) => {
      return `**商品**：${i.productName}\n**時效**：${i.planName}\n**數量**：${i.quantity}`;
    }).join('\n\n------------------------\n\n');

    // 呼叫 Discord REST API 的 Payload
    const payload = {
        content: `🎫 **有全新的開票訂單！** 請客服人員注意查收。`,
        embeds: [
            {
                title: "🎫 新的開票請求 (專人處理發卡)",
                description: `有用戶使用了 Discord 客服開票，等待專人為您服務發卡。`,
                color: 5814783, // 淺紫色
                fields: [
                    {
                        name: "👤 用戶名",
                        value: `${session.user.name || '未設定名稱'} (${session.user.email})`,
                        inline: false
                    },
                    {
                        name: "📦 購買內容",
                        value: itemsListStr || "無",
                        inline: false
                    },
                    {
                        name: "💰 總計金額",
                        value: `**NT$ ${totalAmount}**`,
                        inline: false
                    }
                ],
                footer: {
                    text: "系統自動開票",
                },
                timestamp: new Date().toISOString()
            }
        ],
        components: [
            {
                type: 1, // Action Row
                components: [
                    {
                        type: 2, // Button
                        label: "關閉票口",
                        style: 4, // Danger/Red
                        custom_id: `close_ticket`
                    }
                ]
            }
        ]
    };

    // 發送 POST 請求至 Discord 的 REST API
    // 1. 先取得類別頻道資訊以獲取 Guild ID
    const categoryRes = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers: { "Authorization": `Bot ${botToken.trim()}` }
    });
    
    if (!categoryRes.ok) {
        const errorText = await categoryRes.text();
        console.error("無法取得分類頻道資訊:", errorText);
        return NextResponse.json({ error: "設定的 Discord 分類 ID 無效" }, { status: 500 });
    }
    
    const categoryData = await categoryRes.json();
    const guildId = categoryData.guild_id;

    // 2. 創建新的文字頻道 (在該分類底下)
    const safeUserName = (session.user.name || '用戶').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').slice(0, 10).toLowerCase() || 'guest';
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const channelName = `ticket-${safeUserName}-${randomSuffix}`;
    
    const newChannelRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bot ${botToken.trim()}`
        },
        body: JSON.stringify({
            name: channelName,
            type: 0, // 0 = GUILD_TEXT
            parent_id: channelId, // 放在分類底下
            topic: `會員 ${session.user.email} 的開票訂單`
        })
    });

    if (!newChannelRes.ok) {
        const errorText = await newChannelRes.text();
        console.error("創建頻道失敗:", errorText);
        return NextResponse.json({ error: "無法在 Discord 創建開票頻道" }, { status: 500 });
    }

    const newChannelData = await newChannelRes.json();
    const newTicketChannelId = newChannelData.id;

    // 將訂單存入資料庫
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
          discordChannelId: newTicketChannelId, // 儲存票務頻道ID
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

    // 3. 發送卡片訊息到剛建立的新頻道 (加入訂單編號顯示)
    payload.embeds[0].title = `🎫 新的開票請求 [訂單: ${order.id.slice(-6)}]`;
    
    const res = await fetch(`https://discord.com/api/v10/channels/${newTicketChannelId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bot ${botToken.trim()}`
        },
        body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    if (!res.ok) {
        console.error("發送卡片訊息錯誤:", responseText);
        return NextResponse.json({ error: "無法發送 Discord 通知，請聯絡管理員" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "已通知 Discord 客服！" });

  } catch (err: any) {
    console.error("Discord checkout error:", err);
    return NextResponse.json({ error: `伺服器內部錯誤: ${err.message}` }, { status: 500 });
  }
}
