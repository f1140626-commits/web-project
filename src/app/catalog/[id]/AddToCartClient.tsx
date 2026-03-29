"use client"

import { useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"        
import { Label } from "@/components/ui/label"
import { ShoppingCart, CheckCircle2 } from "lucide-react"
import { toast } from "react-hot-toast"

type PricePlan = {
  id: string
  name: string
  price: number
  durationDays: number | null
}

type AddToCartClientProps = {
  product: {
    id: string
    name: string
    status: string
  }
  pricePlans: PricePlan[]
  inStock: boolean
}

export default function AddToCartClient({ product, pricePlans, inStock }: AddToCartClientProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(pricePlans[0]?.id || "")
  const [isAdded, setIsAdded] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    const plan = pricePlans.find(p => p.id === selectedPlanId)
    if (!plan) return

    addItem({
      productId: product.id,
      productName: product.name,
      planId: plan.id,
      planName: plan.name,
      price: plan.price
    })

    toast.success(`已將 ${product.name} 加入購物車`, {
      icon: '🛒',
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const isPurchasable = product.status === "NORMAL" && pricePlans.length > 0 && 
inStock

  if (pricePlans.length === 0) {
    return (
      <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center text-slate-400 backdrop-blur-md">
        目前無可購買的方案
      </div>
    )
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-200 flex items-center gap-2">
          選擇方案
        </h3>
        <RadioGroup
          value={selectedPlanId}
          onValueChange={setSelectedPlanId}
          className="grid gap-3"
        >
          {pricePlans.map((plan) => (
            <div key={plan.id} className="relative group">
              <RadioGroupItem
                value={plan.id}
                id={plan.id}
                className="peer sr-only"
                disabled={!isPurchasable}
              />
              <Label
                htmlFor={plan.id}
                className="flex items-center justify-between p-4 border border-white/10 rounded-xl cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:bg-white/5 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 transition-all duration-300 relative overflow-hidden bg-black/40 backdrop-blur-md"
              >
                {/* Active glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="space-y-1 relative z-10">
                  <div className="font-bold flex items-center gap-2 text-slate-200 group-hover:text-primary transition-colors">
                    {plan.name}
                    {selectedPlanId === plan.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.8)]" />
                    )}
                  </div>
                  {plan.durationDays && (
                    <div className="text-xs text-slate-400">效期 {plan.durationDays} 天</div>
                  )}
                </div>
                <div className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)] relative z-10">
                  NT$ {plan.price}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        size="lg"
        className={`w-full text-lg h-14 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 border-none ${isAdded ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white' : 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]'}`}
        disabled={!isPurchasable || isAdded}
        onClick={handleAddToCart}
      >
        {isAdded ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            已加入購物車
          </>
        ) : !inStock ? (
          "目前缺貨中"
        ) : product.status !== "NORMAL" ? (
          "維護中/更新中，暫停販售"
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            加入購物車
          </>
        )}
      </Button>
    </div>
  )
}