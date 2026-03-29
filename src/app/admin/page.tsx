import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Users, Package, KeyRound, ShoppingCart, Activity } from "lucide-react"
import { DashboardCharts } from "./components/DashboardCharts"
import { CountUp } from "@/components/ui/count-up"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // 取得統計數據
  const userCount = await prisma.user.count()
  const productCount = await prisma.product.count()
  const orderCount = await prisma.order.count()

  // 計算所有商品庫存總和
  const products = await prisma.product.findMany({ select: { stock: true } })
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0)

  // 取得近七天營業額與訂單真實數據
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
      status: {
        not: "CANCELLED" // 表單計算排除取消的訂單
      }
    },
    select: {
      createdAt: true,
      totalAmount: true,
    }
  });

  const chartDataMap = new Map<string, { sales: number, orders: number }>();
  
  // 初始化近七天的日期為 0
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
    chartDataMap.set(dateString, { sales: 0, orders: 0 });
  }

  // 將資料庫的訂單資訊整合進 Map 中
  recentOrders.forEach((order) => {
    const d = new Date(order.createdAt);
    const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
    if (chartDataMap.has(dateString)) {
      const current = chartDataMap.get(dateString)!;
      current.sales += order.totalAmount;
      current.orders += 1;
      chartDataMap.set(dateString, current);
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => ({
    date,
    sales: data.sales,
    orders: data.orders
  }));

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="p-3 bg-cyan-400/20 rounded-xl border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Activity className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">儀表板總覽</h1>
          <p className="text-slate-400 mt-1">
            歡迎回來，管理員 <span className="text-cyan-400 font-bold">{session?.user?.name || session?.user?.email}</span>。這是您的控制中心。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 會員統計 */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-500 mr-5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">總會員數</p>
              <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                <CountUp end={userCount} />
              </p>
            </div>
          </div>
        </div>

        {/* 商品統計 */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-500 mr-5 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">上架商品</p>
              <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                <CountUp end={productCount} />
              </p>
            </div>
          </div>
        </div>

        {/* 商品庫存統計 */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-amber-500/20 transition-colors"></div>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-500 mr-5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">總庫存件數</p>
              <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                <CountUp end={totalStock} />
              </p>
            </div>
          </div>
        </div>

        {/* 訂單統計 */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -z-10 group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="flex items-center">
            <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-500 mr-5 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">歷史訂單</p>
              <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                <CountUp end={orderCount} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts data={chartData} />
    </div>
  )
}
