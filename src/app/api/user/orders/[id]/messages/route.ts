import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    // @ts-ignore
    const userId = session.user.id;

    // 確認訂單是此用戶的
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
    }

    if (!order.discordChannelId) {
      return NextResponse.json({ messages: [] });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Bot Token not configured" }, { status: 500 });
    }

    // 從 Discord 取得最新的訊息 (最多50則)
    const res = await fetch(`https://discord.com/api/v10/channels/${order.discordChannelId}/messages?limit=50`, {
      headers: {
        "Authorization": `Bot ${botToken.trim()}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 404) {
        // 找不到頻道，可能已被關閉刪除
        return NextResponse.json({ messages: [], ticketClosed: true });
      }
      console.error("無法取得 Discord 訊息:", await res.text());
      return NextResponse.json({ error: "取得訊息失敗" }, { status: 500 });
    }

    const data = await res.json();
    
    // 過濾掉卡片訊息(初始機器人發的)，或者只傳回純文本對話
    // 或者傳回所有訊息供前端渲染
    const messages = data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      authorId: msg.author.id,
      authorName: msg.author.username,
      isBot: msg.author.bot || false,
      createdAt: msg.timestamp
    })).filter((m: any) => {
      // 1. 過濾空訊息
      if (!m.content || m.content.trim() === "") return false;
      // 2. 過濾系統通知(開票卡片、管理員結案等機器人自我發言)，只保留代買家發言的機器人訊息
      if (m.isBot && !m.content.includes('說：**\n')) return false;
      
      return true;
    });

    // Discord API 傳回是從新到舊，我們翻轉為從舊到新
    return NextResponse.json({ 
      messages: messages.reverse(),
      discordChannelId: order.discordChannelId 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    // @ts-ignore
    const userId = session.user.id;
    const body = await req.json();

    if (!body.content || body.content.trim() === "") {
      return NextResponse.json({ error: "內容不能為空" }, { status: 400 });
    }

    // 確認訂單是此用戶的
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== userId || !order.discordChannelId) {
      return NextResponse.json({ error: "找不到對應的票口" }, { status: 404 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Bot Token not configured" }, { status: 500 });
    }

    // 發送訊息到 Discord
    // 我們使用機器人的身分代為傳送，並且在訊息前方加上會員名字作為識別
    const discordMessage = {
      content: `**[買家 ${session.user.name || session.user.email}] 說：**\n${body.content}`
    };

    const res = await fetch(`https://discord.com/api/v10/channels/${order.discordChannelId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bot ${botToken.trim()}`
      },
      body: JSON.stringify(discordMessage)
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "票口已經關閉", ticketClosed: true }, { status: 400 });
      }
      console.error("發送 Discord 訊息失敗:", await res.text());
      return NextResponse.json({ error: "發送失敗" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
