export const dynamic = 'force-dynamic';

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import prisma from "@/lib/db"
import { MotionDiv } from "@/components/ui/motion-div"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const currentCategory = searchParams.category || ""
  const searchQuery = searchParams.search || ""

  // ==========================
  // 1. 抓取所有分類與數量供側邊欄使用
  // ==========================
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // ==========================
  // 2. 根據目前網址的篩選條件抓取商品
  // ==========================
  const products = await prisma.product.findMany({
    where: {
      // 如果有選擇分類，就篩選該分類下的商品
      ...(currentCategory ? { categoryId: currentCategory } : {}),
      // 如果有搜尋關鍵字，就用名稱模糊比對
      ...(searchQuery ? { name: { contains: searchQuery, mode: 'insensitive' } } : {})
    },
    include: {
      category: true,
      pricePlans: {
        orderBy: { price: 'asc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 計算所有商品的總數 (用來顯示在側邊欄上方)
  const totalProductsCount = categories.reduce((acc, curr) => acc + curr._count.products, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* 左側分類 Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-6">
            
            {/* 搜尋框 */}
            <div className="relative group">
              <form action="/catalog" method="GET">
                {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  name="search" 
                  defaultValue={searchQuery}
                  placeholder="搜尋遊戲名稱或輔助..." 
                  className="w-full pl-11 pr-4 py-3 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm shadow-sm"
                />
              </form>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <h3 className="text-sm font-bold p-5 bg-background/50 border-b border-white/5">遊戲分類</h3>
              <ul className="p-3 space-y-1.5">
                <li>
                  <Link 
                    href={searchQuery ? `/catalog?search=${searchQuery}` : "/catalog"}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                      !currentCategory 
                        ? "bg-primary/20 text-primary font-bold shadow-sm border border-primary/20" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <span>全部商品</span>
                    <span className="text-xs bg-background/80 px-2 py-1 rounded-md font-mono">{totalProductsCount}</span>
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/catalog?category=${cat.id}${searchQuery ? `&search=${searchQuery}` : ''}`}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                        currentCategory === cat.id 
                          ? "bg-primary/20 text-primary font-bold shadow-sm border border-primary/20" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                      }`}
                    >
                      <span className="truncate mr-2">{cat.name}</span>
                      <span className="text-xs bg-background/80 px-2 py-1 rounded-md font-mono">{cat._count.products}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* 右側商品列表 (Product Grid) */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {currentCategory 
                  ? categories.find(c => c.id === currentCategory)?.name || "分類商品"
                  : "所有商品"}
              </h1>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  包含 "{searchQuery}" 的搜尋結果
                </p>
              )}
            </div>
            
            <span className="text-sm px-3 py-1 bg-muted rounded-full font-medium">
              共找到 {products.length} 款產品
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const badgeVariant =
                product.status === "NORMAL" ? "success" :
                product.status === "UPDATING" ? "warning" : "destructive";

              const statusText =
                product.status === "NORMAL" ? "正常運作" :
                product.status === "UPDATING" ? "更新中" : "維護中";

              const startingPrice = product.pricePlans.length > 0 ? product.pricePlans[0].price : "缺貨中";
              const rawStock = product.stock;
              const isOutOfStock = startingPrice === "缺貨中" || rawStock === 0;

              return (
              <MotionDiv 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full overflow-hidden flex flex-col hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(109,40,217,0.15)] transition-all bg-card/60 backdrop-blur-md border-white/5 relative">
                  
                  {/* 缺貨或熱銷提示 Badge */}
                {isOutOfStock ? (
                  <div className="absolute -right-12 top-6 bg-red-600/90 text-white text-xs font-bold px-12 py-1 rotate-45 z-20 shadow-lg backdrop-blur-sm">
                    已售完
                  </div>
                ) : rawStock <= 5 ? (
                  <div className="absolute -right-12 top-6 bg-orange-500/90 text-white text-xs font-bold px-10 py-1 rotate-45 z-20 shadow-lg backdrop-blur-sm flex items-center gap-1">
                    🔥 剩 {rawStock} 組
                  </div>
                ) : null}

                <div className="aspect-video w-full bg-background/50 flex flex-col items-center border-b border-white/5 justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-105 transition-transform duration-500"></div>
                  <span className="relative z-10 font-black text-2xl text-foreground/30 uppercase tracking-widest drop-shadow-xl group-hover:text-foreground/70 transition-colors">
                    {product.category.name}
                  </span>
                  
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <Badge variant={badgeVariant} className="shadow-md backdrop-blur-md border-white/10">
                      {statusText}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-5 pb-3">
                  <div className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {product.category.name}
                  </div>
                  <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors" title={product.name}>{product.name}</CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" title={product.description || ""}>
                    {product.description || "提供高穩定性、低封號率的優質體驗。"}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 flex items-end justify-between border-t border-border mt-auto">
                  <div className="flex flex-col pt-4">
                     {startingPrice !== "缺貨中" && <span className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">起始價格</span>}
                     <span className="text-2xl font-black text-foreground">
                      {startingPrice !== "缺貨中" ? `NT$ ${startingPrice}` : startingPrice}
                     </span>
                  </div>
                  <Link href={`/catalog/${product.id}`} className="group/btn inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-11 px-5 border border-primary/20 active:scale-[0.98]">
                    查看詳情
                  </Link>
                </CardFooter>
                </Card>
              </MotionDiv>
            )})}
          </div>

          {products.length === 0 && (
             <div className="text-center py-20 bg-muted/20 border border-dashed rounded-2xl mt-8">
               <div className="text-muted-foreground mb-3">
                 <Search className="w-12 h-12 mx-auto opacity-20" />
               </div>
               <h3 className="text-xl font-bold mb-2">找不到符合的商品</h3>
               <p className="text-muted-foreground mb-6">目前此分類或關鍵字下沒有任何商品。</p>
               <Link href="/catalog" className="text-primary font-medium hover:underline">
                 清除篩選條件
               </Link>
             </div>
          )}
        </main>
      </div>
    </div>
  )
}