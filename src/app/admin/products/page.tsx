import prisma from "@/lib/db"
import Link from "next/link"
import { Package, Plus, FolderTree, Edit, KeyRound, AlertTriangle } from "lucide-react"
import SearchInput from "../components/SearchInput"
import Pagination from "../components/Pagination"

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string }
}) {
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  const whereClause = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } }
    ]
  } : {};

  const totalProducts = await prisma.product.count({ where: whereClause });
  const totalPages = Math.ceil(totalProducts / pageSize);

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/20 rounded-xl border border-secondary/30 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)]">
            <Package className="w-8 h-8 text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary-rgb),0.8)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">商品管理</h1>      
            <p className="text-slate-400 mt-1">管理所有遊戲輔助與上架狀態</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchInput placeholder="搜尋商品名稱..." />
          <div className="flex gap-4">
            <Link href="/admin/categories" className="flex items-center gap-2 px-5 py-2.5 bg-black/40 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 shadow-sm backdrop-blur-md whitespace-nowrap">
              <FolderTree className="w-4 h-4" /> 分類管理
            </Link>
            <Link href="/admin/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all duration-300 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.4)] hover:shadow-[0_0_25px_rgba(var(--secondary-rgb),0.6)] font-bold whitespace-nowrap">
              <Plus className="w-4 h-4" /> 新增商品
            </Link>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-white/10 text-slate-300">
                <th className="p-5 font-semibold">商品名稱</th> 
                <th className="p-5 font-semibold">分類</th>       
                <th className="p-5 font-semibold">狀態</th>       
                <th className="p-5 font-semibold">手動發貨庫存</th>
                <th className="p-5 font-semibold text-right">操作</th>      
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">     
                    <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                      <Package className="w-12 h-12 text-slate-700 mb-2" />
                      <p className="text-lg">目前還沒有任何商品，點擊右上角「+ 新增商品」來建立一個吧！</p>
                      <p className="text-sm text-slate-600">(如果還沒有分類，請先前往「分類管理」建立分類)</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 font-bold text-slate-200 group-hover:text-primary transition-colors">{product.name}</td>
                    <td className="p-5 text-slate-400">
                      <span className="bg-white/5 px-3 py-1 rounded-full text-xs border border-white/10">{product.category.name}</span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-md border flex inline-items-center w-fit ${
                        product.status === "NORMAL" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                        product.status === "UPDATING" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                        "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      }`}>
                        {product.status === "NORMAL" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse inline-block self-center"></span>}
                        {product.status}
                      </span>
                    </td>
                    <td className="p-5 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg border ${
                          product.stock === 0 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : product.stock < 5 
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                              : 'bg-black/40 border-white/10'
                        }`}>
                          {product.stock} 件
                        </span>
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="flex items-center text-xs text-amber-400 animate-pulse" title="庫存低於安全值(5件)，建議補貨">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            庫存告急
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="flex items-center text-xs text-red-400 animate-pulse" title="已無庫存，前台將顯示缺貨">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            缺貨中
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 space-x-3 text-right">
                      <Link href={`/admin/products/${product.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-300 font-medium border border-primary/30">
                        <Edit className="w-4 h-4" /> 編輯
                      </Link>
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