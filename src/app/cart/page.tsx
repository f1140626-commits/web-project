"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Loader2, CreditCard, Landmark, MessageSquare } from "lucide-react";                                                                          import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("DISCORD");
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();                                                                            const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    if (!session) {
      toast.error("請先登入後才能結帳！");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (items.length === 0) return;

    setIsCheckingOut(true);
    const checkoutToast = toast.loading('處理中...');

    try {
      if (paymentMethod === "DISCORD") {
        const response = await fetch("/api/checkout/discord", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            totalAmount: totalPrice()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "通知發送失敗！", { id: checkoutToast, duration: 8000 });
          setIsCheckingOut(false);
          return;
        }

        clearCart();
        toast.success('已發送通知並建立訂單！即將跳轉到歷史訂單查看進度', { id: checkoutToast, duration: 5000 });
        
        setTimeout(() => {
          setIsCheckingOut(false);
          router.push("/dashboard"); 
        }, 1000);
        
        return;
      }

      // VIRTUAL_ATM 原有邏輯
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: totalPrice()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "結帳失敗！", { id: checkoutToast });
        setIsCheckingOut(false);
        return;
      }

      clearCart();
      toast.success('結帳成功！即將跳轉...', { id: checkoutToast });
      router.push(`/checkout/success/${data.orderId}`);

    } catch (error) {
      console.error(error);
      toast.error("網路異常，請稍後再試。", { id: checkoutToast });
      setIsCheckingOut(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
      
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12 text-gradient drop-shadow-md">購物車</h1>      

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 glass-card border-primary/20 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0 mix-blend-overlay opacity-50"></div>
          <ShoppingCart className="h-20 w-20 mb-6 text-primary/40 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] relative z-10" />
          <h2 className="text-2xl font-bold mb-3 text-slate-200 relative z-10">您的購物車是空的</h2>
          <p className="mb-8 text-slate-400 relative z-10">還沒有挑選任何商品，去商品總覽看看吧！</p>
          <Link
            href="/catalog"
            className="bg-primary/20 border border-primary/50 text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] relative z-10"
          >
            前往選購
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側商品清單 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl border-white/10 p-4 sm:p-6 space-y-6">    
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 border-b border-white/10 last:border-0 last:pb-0 first:pt-0 gap-4 group">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-200 group-hover:text-primary transition-colors">{item.productName}</h3>
                    <p className="text-slate-400 text-sm mt-1">方案：{item.planName}</p>
                    <p className="text-primary font-bold mt-2 drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]">NT$ {item.price}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* 數量控制 */}
                    <div className="flex items-center border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm overflow-hidden">       
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400/70 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                      title="移除商品"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={clearCart}
                className="text-sm font-medium text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"                                        >
                <Trash2 className="w-4 h-4" /> 清空購物車
              </button>
            </div>
          </div>

          {/* 右側結帳資訊 */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl border-primary/20 p-6 sticky top-24 space-y-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-[50px] -z-10 mix-blend-screen" />
              
              <h3 className="text-xl font-bold border-b border-white/10 pb-4 text-slate-100">訂單摘要</h3>  

              <div className="space-y-4 pb-5 border-b border-white/10">
                <div className="flex justify-between text-slate-300">    
                  <span>商品總數</span>
                  <span className="font-medium text-slate-200">{items.reduce((total, item) => total + item.quantity, 0)} 件</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>小計</span>
                  <span>NT$ {totalPrice()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl pt-2">       
                <span className="font-bold text-slate-200">總計金額</span>
                <span className="font-black text-primary text-3xl drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">NT$ {totalPrice()}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                {isCheckingOut ? (
                  <span className="relative z-10 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    處理中...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    {paymentMethod === 'DISCORD' ? "送出需求並前往官方 Discord" : "前往結帳"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              <p className="text-xs text-center text-slate-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                {paymentMethod === 'DISCORD' 
                  ? "送出後，請至我們的 Discord 頻道開啟客服票卡，將有專人為您保留庫存與手動發貨。" 
                  : "付款完成後，卡密將自動發送至您的信箱並可於訂單紀錄中查看。"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
