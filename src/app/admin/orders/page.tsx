import prisma from "@/lib/db"
import { ShoppingCart, DollarSign, ListOrdered, Calendar, Hash, User, CreditCard, CheckCircle2 } from "lucide-react"
import OrderSearch from "./OrderSearch"
import DispatchOrderClient from "./components/DispatchOrderClient"
import DeleteOrderClient from "./components/DeleteOrderClient"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams.query || ""

  const orders = await prisma.order.findMany({
    where: query ? {
      OR: [
        { id: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } },
        { user: { name: { contains: query, mode: "insensitive" } } }
      ]
    } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true, name: true }
      },
      items: true
    }
  })

  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((acc, curr) => acc + curr.totalAmount, 0)

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShoppingCart className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-sm">訂單管理</h1>
            <p className="text-slate-400 mt-1">追蹤所有銷售紀錄與卡密派發情況</p>
          </div>
        </div>
        <OrderSearch />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-cyan-400 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-[40px] -z-10 group-hover:bg-cyan-400/20 transition-colors"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 mb-1">總訂單數</p>
              <p className="text-3xl font-black text-white">{orders.length} <span className="text-lg font-medium text-slate-400">筆</span></p>
            </div>
            <div className="p-3 bg-cyan-400/10 rounded-xl text-cyan-400 border border-cyan-400/20">
              <ListOrdered className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-400 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px] -z-10 group-hover:bg-emerald-400/20 transition-colors"></div>
          <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-bold text-slate-400 mb-1">總銷售額</p>
               <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">NT$ {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-400 border border-emerald-400/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>                                                                           
              <tr className="bg-black/50 border-b border-white/10 text-slate-300">
                <th className="p-5 font-semibold flex items-center gap-2"><Calendar className="w-4 h-4"/> 訂單時間</th> 
                <th className="p-5 font-semibold"><Hash className="w-4 h-4 inline mr-1"/>訂單 ID</th> 
                <th className="p-5 font-semibold"><User className="w-4 h-4 inline mr-1"/>購買人</th>  
                <th className="p-5 font-semibold"><CreditCard className="w-4 h-4 inline mr-1"/>總金額</th>  
                <th className="p-5 font-semibold"><CheckCircle2 className="w-4 h-4 inline mr-1"/>狀態</th>     
                <th className="p-5 font-semibold">配發卡密</th>                                                                                             
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">   
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ListOrdered className="w-12 h-12 text-slate-700 mb-2" />
                      <p>目前尚未有任何訂單。</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">                                                                                      
                    <td className="p-5 text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleString('zh-TW')}       
                    </td>
                    <td className="p-5">       
                       <span className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">{order.id}</span>
                    </td>
                    <td className="p-5">
                      {order.user ? (
                        <div className="text-sm">
                          <p className="font-bold text-slate-200 group-hover:text-primary transition-colors">{order.user.name || "未設定名稱"}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{order.user.email}</p>                                                                                                  
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm italic bg-white/5 px-2 py-1 rounded border border-white/5">訪客建立或帳號已刪除</span>
                      )}
                    </td>
                    <td className="p-5 font-black text-secondary drop-shadow-[0_0_5px_rgba(var(--secondary-rgb),0.5)]">
                      NT$ {order.totalAmount}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-md border inline-flex items-center w-fit ${       
                        order.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse"
                      }`}>
                        {order.status === "COMPLETED" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 inline-block self-center"></span>}
                        {order.status === "COMPLETED" ? "已發貨 / 已完成" : "等待處理"}
                      </span>
                    </td>                                                                       
                    <td className="p-5 align-top">
                      <details className="text-sm group/details mb-2">
                        <summary className="text-primary hover:text-white cursor-pointer outline-none select-none font-medium flex items-center gap-1 transition-colors">                                                                                      
                          查看購買項目 ({order.items.length})
                        </summary>
                        <div className="mt-3 space-y-2 max-w-xs relative z-10">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-black/60 border border-primary/20 p-3 rounded-xl text-xs backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">                                                                                                      
                              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                {item.productName} ({item.planName}) x {item.quantity}
                              </p>                                                                                                             
                            </div>
                          ))}
                        </div>
                      </details>
                      
                      {order.notes && (
                        <details className="mb-3 max-w-xs p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg group/notes cursor-pointer">
                          <summary className="text-xs text-emerald-400 font-bold mb-1 select-none flex items-center justify-between outline-none">
                            <span>當前發貨內容 (點擊展開)</span>
                          </summary>
                          <p className="text-[11px] text-slate-300 break-all whitespace-pre-wrap mt-1">{order.notes}</p>
                        </details>
                      )}
                      
                      <div className="flex flex-wrap items-start gap-2">
                        <DispatchOrderClient 
                          orderId={order.id} 
                          initialNotes={order.notes} 
                          status={order.status} 
                        />
                        <DeleteOrderClient orderId={order.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
