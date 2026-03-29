"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Edit, X, Save } from "lucide-react"

export default function DispatchOrderClient({ 
  orderId, 
  initialNotes, 
  status 
}: { 
  orderId: string, 
  initialNotes: string | null,
  status: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (complete: boolean) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes,
          status: complete ? 'COMPLETED' : status
        })
      })

      if (!res.ok) {
        throw new Error('儲存失敗')
      }

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("儲存失敗，請重試")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2 max-w-xs bg-black/40 p-3 rounded-xl border border-white/10">
        <textarea
          className="w-full bg-black/60 border border-white/20 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 min-h-[100px] resize-y"
          placeholder="請輸入卡密、序號、連結或發貨備註..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 font-medium disabled:opacity-50"
            title="儲存內容並標記為已發貨"
          >
            <Check className="w-3.5 h-3.5" /> 完成發貨
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 font-medium disabled:opacity-50"
            title="僅儲存草稿不改變狀態"
          >
            <Save className="w-3.5 h-3.5" /> 暫存草稿
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
            className="px-3 bg-slate-500/20 text-slate-400 hover:bg-slate-500 hover:text-white border border-slate-500/30 text-xs py-2 rounded-lg transition-all duration-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
        notes 
        ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border-blue-500/20" 
        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      }`}
    >
      <Edit className="w-3.5 h-3.5" />
      {notes ? "修改發貨內容" : "點此手動發貨 / 填寫內容"}
    </button>
  )
}
