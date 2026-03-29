import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import Link from "next/link"
import { CheckCircle2, Copy } from "lucide-react"

export default async function CheckoutSuccessPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  // 取得訂單與對應的商品項目 (確認訂單擁有者是當前使用者)
  const order = await prisma.order.findUnique({
    where: { 
      id: params.id,
      // @ts-ignore
      userId: session.user.id 
    },
    include: {
      items: true
    }
  })

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">找不到訂單</h1>
        <p className="text-muted-foreground mb-8">此訂單不存在或者您沒有權限查看。</p>
        <Link href="/" className="bg-primary text-primary-foreground px-6 py-2 rounded-md">回到首頁</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-card border rounded-2xl shadow-sm p-8 flex flex-col items-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">付款成功！</h1>
        <p className="text-muted-foreground mb-8">感謝您的購買，我們已收到您的訂單。</p>
        
        <div className="w-full bg-muted/30 rounded-xl p-6 mb-8 text-left border">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <span className="text-sm text-muted-foreground">訂單編號: {order.id}</span>
            <span className="font-semibold">總計: NT$ {order.totalAmount}</span>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-2">🛒 您的購買項目</h3>
            {order.items.length === 0 && (
              <p className="text-sm text-orange-500">訂單內無商品紀錄，請聯絡客服。</p>
            )}
            
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.id} className="bg-background border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-primary">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">方案: {item.planName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">x {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t bg-black/20 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-md text-amber-400 mb-2">⚠️ 序號發放說明</h4>
              {order.status === 'COMPLETED' ? (
                <div className="space-y-2">
                  <p className="text-sm text-emerald-400 font-bold">訂單已完成！您的序號/說明如下：</p>
                  <pre className="bg-black/50 p-4 rounded-md text-slate-200 whitespace-pre-wrap font-mono text-sm border border-emerald-500/30 select-all">
                    {order.notes || "管理員未提供額外資訊，如有問題請聯繫客服。"}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  本商店為<strong className="text-white">專人手動發貨</strong>，您的訂單狀態目前為 <strong className="text-blue-400">{order.status}</strong>。<br/>
                  請稍待管理員確認並配發商品，發配後將會顯示在此處。若您有使用 Discord 開票，請至頻道內等待客服人員為您服務！
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/catalog" className="px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-md transition-colors">
            繼續購買
          </Link>
          <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-md transition-colors">
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  )
}
