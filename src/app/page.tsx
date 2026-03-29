import Link from "next/link";
import prisma from "@/lib/db";
import { ArrowRight, ShieldCheck, Zap, Server, Crosshair, Cpu } from "lucide-react";

export default async function HomePage() {
  const latestProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      pricePlans: {
        orderBy: { price: 'asc' },   
        take: 1
      }
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-white/5">
        {/* Cyberpunk Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-4">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              系統全面穩定運行中
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1]">
              掌控遊戲主導權<br />
              <span className="text-gradient">
                釋放你的極限潛能
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance">
              全台最穩定、最安全的遊戲輔助平台。專人手動發卡服務，確保交易安全。獨家防封技術為您的遊戲體驗保駕護航。
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalog"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(109,40,217,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative flex items-center gap-2">
                  瀏覽商品目錄 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-foreground glass rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                免費註冊會員
              </Link>
              <a
                href="https://discord.gg/xsta7YDn8E"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-[#5865F2] rounded-xl hover:bg-[#4752C4] transition-all shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_30px_rgba(88,101,242,0.5)] border border-transparent flex gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                加入 Discord
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Grid on the right side on large screens */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center md:text-left mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">為什麼選擇 <span className="text-primary">HW-Shop</span></h2>
            <p className="text-muted-foreground max-w-2xl">我們致力於提供最頂級的硬體級輔助方案，讓您在戰場上無往不利。</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 card-glow">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">專人審核 手動發卡</h3>
              <p className="text-muted-foreground leading-relaxed">
                結帳完成後，由客服人員為您手動確認並發送商品序號，確保每筆訂單的準確性與您的帳號安全。
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 card-glow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">獨家底層防封監督</h3>
              <p className="text-muted-foreground leading-relaxed">
                開發團隊掌握最新核心技術，繞過現代主流反作弊系統，大幅降低封號風險，保障您的帳號安全。
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 card-glow">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">雲端實時更新</h3>
              <p className="text-muted-foreground leading-relaxed">
                當遊戲更新時我們的伺服器會即時同步，並將狀態標記為維護中。維護完畢自動生效，無須手動下載大檔。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-24 relative border-t border-white/5 bg-black/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">最新上架 <span className="text-gradient">無敵配備</span></h2>
              <p className="text-muted-foreground text-lg">探索本站最新引進的強力輔助工具</p>
            </div>
            <Link href="/catalog" className="hidden md:flex text-foreground hover:text-primary font-bold items-center gap-2 pb-2 transition-colors">
              查看全部武器 <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestProducts.map((product) => (
              <Link href={`/catalog/${product.id}`} key={product.id} className="group flex flex-col glass rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(109,40,217,0.15)] relative">
                
                <div className="h-56 bg-background/50 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Crosshair className="absolute text-white/5 w-64 h-64 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
                  
                  <span className="relative z-10 font-bold text-3xl text-foreground/40 tracking-widest uppercase drop-shadow-xl group-hover:text-foreground/80 transition-colors">
                    {product.category.name}
                  </span>

                  {product.status === "NORMAL" ? (
                    <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                      正常運作
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                      遊戲更新中
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1 relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded">
                      {product.category.name}
                    </span>
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                    {product.description || "提供最新的透視、自瞄等功能，安全穩定，搭載最強內核驅動保護。"}
                  </p>

                  <div className="pt-5 border-t border-white/10 flex justify-between items-end mt-auto">
                    <div className="text-xl font-black text-foreground">
                      {product.pricePlans.length > 0 ? (
                        <>NT$ {product.pricePlans[0].price} <span className="text-sm font-normal text-muted-foreground ml-1">起</span></>
                      ) : (
                        "暫無定價"
                      )}
                    </div>
                    <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/catalog" className="inline-flex glass px-8 py-4 rounded-xl text-foreground font-bold w-full justify-center items-center gap-2 border-white/10">
              探索全目錄 <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}