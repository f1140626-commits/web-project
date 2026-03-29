"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

type PricePlan = {
  name: string
  durationDays: number | null
  price: number
}

type Product = {
  id: string
  name: string
  categoryId: string
  description: string | null
  imageUrl: string | null
  status: string
  features?: any
  stock: number
  pricePlans: PricePlan[]
}

type Category = {
  id: string
  name: string
}

export default function EditProductClient({ product, categories }: { product: Product, categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: product.name,
    categoryId: product.categoryId,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    status: product.status,
    stock: product.stock || 0,
  })

  const [pricePlans, setPricePlans] = useState<PricePlan[]>(
    product.pricePlans.map(p => ({ ...p }))
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handlePricePlanChange = (index: number, field: string, value: string | number) => {
    const newPlans = [...pricePlans]
    newPlans[index] = { ...newPlans[index], [field]: value }
    setPricePlans(newPlans)
  }

  const addPricePlan = () => {
    setPricePlans([...pricePlans, { name: "自訂", durationDays: 0, price: 0 }])
  }

  const removePricePlan = (index: number) => {
    setPricePlans(pricePlans.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const validPlans = pricePlans.filter(p => p.name.trim() !== "" && p.price > 0)
    const toastId = toast.loading("更新商品中...")

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePlans: validPlans
        })
      })

      if (res.ok) {
        toast.success("更新成功！", { id: toastId })
        router.push("/admin/products")
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || "更新失敗", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("網路連線錯誤", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("確定要刪除此商品嗎？所有相關的庫存卡號也會一併被刪除！這無法復原。")) {
      return
    }

    setIsDeleting(true)
    const toastId = toast.loading("刪除商品中...")
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("商品已刪除！", { id: toastId })
        router.push("/admin/products")
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || "刪除失敗", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("網路連線錯誤", { id: toastId })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card flex justify-between items-center p-6 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-white/5">
        <h1 className="text-2xl font-bold text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          編輯商品：<span className="text-cyan-400">{product.name}</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="text-sm font-medium text-slate-400 hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            取消並返回
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/30 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] disabled:opacity-50"
          >
            {isDeleting ? "刪除中..." : "刪除此商品"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl border border-white/10 space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-white/10 pb-3 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            基本資訊
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">商品名稱</label>
              <input
                type="text"
                name="name" required value={formData.name} onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">所屬分類</label>
              <select
                name="categoryId" required value={formData.categoryId} onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 appearance-none"
              >
                {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">商品狀態</label>
              <select
                name="status" required value={formData.status} onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 appearance-none"
              >
                <option value="NORMAL" className="bg-slate-900">正常販售</option>
                <option value="UPDATING" className="bg-slate-900">更新維護中</option>
                <option value="MAINTENANCE" className="bg-slate-900">暫停販售</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">商品庫存</label>
              <input
                type="number"
                name="stock" min="0" required value={formData.stock} onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                商品圖片連結 (選填)
              </label>
              <input
                type="url"
                name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
              />
              {formData.imageUrl && (
                <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image' }} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">商品描述</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
              placeholder="支援的功能、注意事項等等..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/10 pb-3">
            <h2 className="text-2xl font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">價格方案</h2>
            <button type="button" onClick={addPricePlan} className="text-sm text-emerald-400 hover:text-emerald-300 font-bold hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all">
              + 新增方案
            </button>
          </div>

          <div className="space-y-4">
            {pricePlans.map((plan, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-white/5 p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex-1 space-y-1 min-w-[120px]">
                  <label className="block text-xs uppercase tracking-wider text-slate-400">方案名稱</label>
                  <input
                    type="text" value={plan.name} required
                    onChange={e => handlePricePlanChange(idx, "name", e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="例如：天卡"
                  />
                </div>
                <div className="w-1/4 min-w-[100px] space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-slate-400">時長 (天)</label>
                  <input
                    type="number" value={plan.durationDays === null ? 0 : plan.durationDays} min={0}
                    onChange={e => handlePricePlanChange(idx, "durationDays", parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="1"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">填 0 則為永久</p>
                </div>
                <div className="w-1/4 min-w-[100px] space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-slate-400">價格 (TWD)</label>
                  <input
                    type="number" value={plan.price} min={0} required
                    onChange={e => handlePricePlanChange(idx, "price", parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="150"
                  />
                </div>
                <button
                  type="button" onClick={() => removePricePlan(idx)}
                  className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/30 rounded-lg transition-all text-sm font-semibold"
                >
                  刪除
                </button>
              </div>
            ))}
            {pricePlans.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6 glass-card rounded-xl border border-white/5">沒有價格方案，商品將無法被購買！</p>
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit" disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "儲存中..." : "儲存變更"}
          </button>
        </div>
      </form>
    </div>
  )
}