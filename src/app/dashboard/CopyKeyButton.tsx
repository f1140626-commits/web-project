"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "react-hot-toast"

export default function CopyKeyButton({ keyValue }: { keyValue: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyValue)
      setCopied(true)
      toast.success("序號已複製")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("複製失敗")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-md transition-all duration-300 flex items-center justify-center border
        ${copied 
          ? 'bg-green-500/20 border-green-500/50 text-green-400' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white'
        }`}
      title="複製序號"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}
