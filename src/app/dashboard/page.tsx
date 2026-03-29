import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import Link from "next/link"
import { Calendar, DollarSign, Package, Key as KeyIcon, CheckCircle2 } from "lucide-react"
import CopyKeyButton from "./CopyKeyButton"
import DiscordChatViewer from "./DiscordChatViewer"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  // @ts-ignore
  const userId = session.user.id

  // 取得會員的所有訂單，包含對應的商品項目
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的訂單</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hi, {session.user.name || session.user.email}！這裡是您的歷史訂單與序號提卡區。
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-medium mb-2">尚無訂單紀錄</h2>
            <p className="text-muted-foreground mb-6">您還沒有購買過任何商品哦！</p>
            <Link href="/catalog" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition">
              前往選購商品
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* 訂單標頭 */}
              <div className="bg-muted/30 p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">訂單編號：</span>
                    <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      {order.status === "COMPLETED" ? "已付款" : order.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span className="text-sm text-muted-foreground sm:mb-1">總金額</span>
                  <span className="text-xl font-bold flex items-center">
                    <DollarSign className="w-5 h-5 -mr-1 text-primary" />
                    {order.totalAmount}
                  </span>
                </div>
              </div>

              {/* 訂單內容 (卡密) */}
              <div className="p-4 sm:p-6 bg-background space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2 mb-3">
                  <KeyIcon className="w-4 h-4" /> 獲得的遊戲序號
                </h3>
                
                {order.items && order.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="border border-white/10 rounded-lg p-3 flex flex-col gap-2 bg-black/20">
                        <span className="font-semibold text-primary/80 text-sm">
                          {item.productName} ({item.planName}) x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {order.notes ? (
                  <div className="mt-4 border border-emerald-500/20 rounded-lg p-3 bg-emerald-500/10">
                    <p className="text-xs text-emerald-400 font-bold mb-1">📝 發貨內容 / 客服備註：</p>
                    <div className="flex items-center gap-2">
                       <code className="bg-black/40 px-3 py-2 rounded text-sm font-mono tracking-wider border border-white/5 select-all flex-1 text-slate-200 whitespace-pre-wrap">
                          {order.notes}
                        </code>
                        <CopyKeyButton keyValue={order.notes} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-cyan-400 bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                    {order.status === 'COMPLETED' ? '已完成，無需發貨或請查看歷史訊息。' : '此訂單正在等待客服人工發貨。'}
                  </p>
                )}

                {/* 顯示 Discord 同步聊天 */}
                {order.discordChannelId && (
                  <DiscordChatViewer orderId={order.id} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
