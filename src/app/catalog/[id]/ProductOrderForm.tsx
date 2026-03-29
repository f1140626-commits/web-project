"use client";

import { useState } from "react";
import { Zap, ShoppingCart } from "lucide-react";
import type { PricePlan } from "@prisma/client";
import { useCartStore } from "@/store/useCartStore";

interface ProductOrderFormProps {
  productId: string;
  productName: string;
  pricePlans: PricePlan[];
}

export default function ProductOrderForm({ productId, productName, pricePlans }: ProductOrderFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(pricePlans[0] || null);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!selectedPlan) return;
    addItem({
      productId: productId,
      productName: productName,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      price: selectedPlan.price,
    });
    alert(`已將 ${productName} (${selectedPlan.name}) 加入購物車！`);
  };

  if (!selectedPlan) {
    return <div className="text-muted-foreground mt-8">目前無可用方案</div>;
  }

  return (
    <div className="mb-8 space-y-4 shadow-sm border rounded-xl p-6 bg-card">
      <h3 className="text-lg font-semibold flex items-center">
        <Zap className="mr-2 h-5 w-5 text-primary" />
        選擇授權時長
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {pricePlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedPlan.id === plan.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted"
            }`}
          >
            <span className="font-semibold">{plan.name}</span>
            <span className="mt-1 text-xl font-bold text-primary">NT$ {plan.price}</span>
          </button>
        ))}
      </div>

      <div className="pt-4 mt-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">合計金額</p>
          <p className="text-3xl font-black text-foreground">
            NT$ {selectedPlan.price}
          </p>
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full sm:w-auto flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-md font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          加入購物車
        </button>
      </div>
    </div>
  );
}
