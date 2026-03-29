"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layers } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminCategoriesClient({
  categories
}: {
  categories: { id: string; name: string }[]
}) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const toastId = toast.loading("新增中...")
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      if (res.ok) {
        setName("")
        toast.success("分類新增成功", { id: toastId })
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "新增失敗", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("網路連線錯誤", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個分類嗎？（如果有商品綁定此分類將無法刪除）")) return

    const toastId = toast.loading("刪除中...")
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success("分類已刪除", { id: toastId })
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "刪除失敗", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("網路連線錯誤", { id: toastId })
    }
  }

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <Layers className="w-8 h-8 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">分類管理</h1>
            <p className="text-slate-400 mt-1">管理遊戲分類標籤與組合</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-xl font-semibold mb-2 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">新增分類</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            placeholder="輸入新分類名稱 (例如：Valorant, Apex...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
            required
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "新增中..." : "新增"}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 font-semibold text-slate-300 uppercase tracking-wider text-sm">ID</th>
              <th className="p-4 font-semibold text-slate-300 uppercase tracking-wider text-sm">分類名稱</th>
              <th className="p-4 font-semibold text-slate-300 uppercase tracking-wider text-sm w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  沒有任何分類
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs font-mono text-slate-500">{cat.id}</td>
                  <td className="p-4 font-medium text-white">{cat.name}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-rose-400 hover:text-rose-300 hover:drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] transition-all text-sm font-semibold"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
