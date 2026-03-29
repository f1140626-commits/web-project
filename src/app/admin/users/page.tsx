import prisma from "@/lib/db"
import { Users, Shield, User, Mail, Calendar, Hash, ListOrdered, DollarSign } from "lucide-react"
import SearchInput from "../components/SearchInput"
import Pagination from "../components/Pagination"

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string }
}) {
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  const whereClause = q ? {
    OR: [
      { email: { contains: q, mode: 'insensitive' as const } },
      { name: { contains: q, mode: 'insensitive' as const } }
    ]
  } : {};

  const totalUsers = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalUsers / pageSize);

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      orders: {
        where: { status: 'COMPLETED' },
        select: { totalAmount: true }
      },
      _count: {
        select: { orders: true }
      }
    }
  })

  // 計算每個使用者的總消費
  const usersWithSpent = users.map(user => ({
    ...user,
    totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  }))

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-400/20 rounded-xl border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Users className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-200 drop-shadow-sm">會員管理</h1>      
            <p className="text-slate-400 mt-1">管理所有註冊使用者與權限設定</p>
          </div>
        </div>
        <SearchInput placeholder="搜尋信箱或名稱..." />
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>                                                                           
              <tr className="bg-black/50 border-b border-white/10 text-slate-300">
                <th className="p-5 font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> 註冊時間</th>
                <th className="p-5 font-semibold"><Hash className="w-4 h-4 inline mr-1" />ID</th>
                <th className="p-5 font-semibold"><Mail className="w-4 h-4 inline mr-1" />信箱</th>
                <th className="p-5 font-semibold"><User className="w-4 h-4 inline mr-1" />名稱</th>
                <th className="p-5 font-semibold"><Shield className="w-4 h-4 inline mr-1" />權限</th>
                <th className="p-5 font-semibold"><ListOrdered className="w-4 h-4 inline mr-1" />總訂單數</th>
                <th className="p-5 font-semibold"><DollarSign className="w-4 h-4 inline mr-1" />累積消費</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersWithSpent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-12 h-12 text-slate-700 mb-2" />
                      <p>尚無會員註冊。</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usersWithSpent.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="p-5">       
                      <span className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">{user.id}</span>
                    </td>
                    <td className="p-5 font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {user.email}
                    </td>
                    <td className="p-5 text-slate-400 font-medium">
                      {user.name || <span className="text-slate-600 italic">未設定</span>}
                    </td>
                    <td className="p-5">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary/20 text-primary font-bold border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">                                                                         
                          <Shield className="w-3.5 h-3.5" /> 管理員
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-white/5 text-slate-400 border border-white/10">                                                                                     
                          <User className="w-3.5 h-3.5" /> 一般會員
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${user._count.orders > 0 ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-slate-500"}`}>
                          {user._count.orders}
                        </span>
                        <span className="text-slate-500 text-sm">筆</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {user.totalSpent > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]">
                            NT$ {user.totalSpent.toLocaleString()}
                          </span>
                          {user.totalSpent >= 5000 && (
                            <span className="text-[10px] text-amber-500/80 uppercase font-black tracking-widest">👑 VIP</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  )
}
