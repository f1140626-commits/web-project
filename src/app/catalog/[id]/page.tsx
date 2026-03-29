export const dynamic = 'force-dynamic';

import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, Cpu, Gamepad2, Info, ArrowLeft, Zap, Crosshair, Sparkles } from "lucide-react"      
import AddToCartClient from "./AddToCartClient"

export default async function ProductDetails({ params }: { params: { id: string } }) {
  const { id } = params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      pricePlans: {
        orderBy: { price: 'asc' }
      }
    }
  })

  if (!product) {
    notFound()
  }

  const inStock = product.stock > 0

  const badgeVariant =
    product.status === "NORMAL" ? "default" :
    product.status === "UPDATING" ? "secondary" : "destructive";

  const statusText =
    product.status === "NORMAL" ? "正常運作" :
    product.status === "UPDATING" ? "更新中" : "維護中";

  // 解析來自資料庫的動態特性標籤
  const features = product.features && typeof product.features === 'object' 
    ? product.features as { os?: string; processor?: string; customTags?: string[] }
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px] relative z-10">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      <nav className="flex items-center text-sm font-medium text-muted-foreground mb-8">
        <Link href="/catalog" className="hover:text-primary transition-colors flex items-center hover:-translate-x-1 duration-300">
          <ArrowLeft className="w-4 h-4 mr-1" />
          所有商品
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog?category=${product.category.id}`} className="hover:text-primary transition-colors">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 左側：商品圖片與屬性 */}
        <div className="space-y-6 flex flex-col">
          {/* 商品標題移至圖片上方 */}
          <div className="flex justify-between items-start gap-4 flex-wrap pb-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-gradient drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {product.name}
            </h1>
            <div className="flex flex-col items-end gap-2 shrink-0 mt-1 md:mt-0">
              <Badge variant={badgeVariant} className={`text-sm px-4 py-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] border ${product.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}`}>
                {statusText}
              </Badge>
              {product.stock > 0 && product.stock <= 5 && (
                <Badge className="bg-orange-500/80 hover:bg-orange-500 text-white border-orange-400 text-xs px-2 py-0.5">
                  🔥 庫存僅剩 {product.stock} 件
                </Badge>
              )}
            </div>
          </div>

          <div className="aspect-[16/10] w-full glass-card rounded-3xl overflow-hidden relative shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] border border-primary/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/50 to-secondary/10 flex flex-col items-center justify-center relative z-10">
              <Gamepad2 className="w-24 h-24 mb-6 text-primary/80 drop-shadow-[0_0_15px_rgba(263,70%,50%,0.8)] group-hover:scale-110 transition-transform duration-500" />
              <span className="font-black text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white/20 to-white/5 uppercase tracking-widest">
                {product.category.name}
              </span>
            </div>

            <div className="absolute top-4 left-4 z-20">
              <Badge variant="outline" className="bg-background/40 backdrop-blur-md font-semibold shadow-[0_0_10px_rgba(0,0,0,0.5)] border-primary/30 text-primary-foreground py-1.5 px-3">
                {product.category.name}
              </Badge>
            </div>
            
            {/* Cyberpunk grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0 mix-blend-overlay opacity-30"></div>
          </div>

          {(features?.os || features?.processor) && (
            <div className="grid grid-cols-2 gap-4">
              {features.os && (
                <Card className="glass-card border-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-primary/20 text-primary p-3 rounded-2xl border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1">系統環境</div>
                      <div className="text-sm font-bold text-slate-200">{features.os}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {features.processor && (
                <Card className="glass-card border-secondary/10 hover:border-secondary/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--secondary-rgb),0.2)]">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-secondary/20 text-secondary p-3 rounded-2xl border border-secondary/30 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.3)]">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1">處理器支援</div>
                      <div className="text-sm font-bold text-slate-200">{features.processor}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* 右側：商品資訊與加購區塊 */}
        <div className="flex flex-col h-full">
          <div className="text-muted-foreground leading-relaxed glass-card border-primary/10 p-6 rounded-2xl flex-1 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-slate-200 font-bold text-lg">
              <Zap className="w-5 h-5 text-secondary drop-shadow-[0_0_5px_rgba(var(--secondary-rgb),0.8)]" /> 產品簡介
            </div>

            {product.description ? (
              <p className="whitespace-pre-wrap relative z-10 text-slate-300">{product.description}</p>
            ) : (
               <p className="relative z-10 text-slate-300">為您帶來最強大的輔助體驗，搭載最先進的反作弊繞過技術。高閃避、低風險，幫助您在戰場上無往不利。</p>
            )}

            {features?.customTags && features.customTags.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300 font-medium relative z-10">
                {features.customTags.map((tag: string, i: number) => {
                  const colors = [
                    "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
                    "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]",
                    "bg-secondary shadow-[0_0_10px_rgba(var(--secondary-rgb),0.8)]",
                    "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  ];
                  const colorClass = colors[i % colors.length];
                  return (
                    <div key={i} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-black/60 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
                      {tag}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Crosshair className="w-48 h-48 -mr-10 -mb-10 text-primary" />
            </div>
          </div>

          {/* 購買面板 */}
          <div className="mt-auto">
            <div className="glass-card border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px] -z-10 mix-blend-screen"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-[50px] -z-10 mix-blend-screen"></div>
              <AddToCartClient
                product={{ id: product.id, name: product.name, status: product.status }}
                pricePlans={product.pricePlans}
                inStock={inStock}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}