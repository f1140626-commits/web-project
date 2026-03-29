"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, ShieldAlert, Layers, Menu, X, ChevronRight, LogOut, Home } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "總覽儀表板", color: "text-primary", baseColor: "primary" },
  { href: "/admin/categories", icon: Layers, label: "分類管理", color: "text-fuchsia-400", baseColor: "fuchsia-400" },
  { href: "/admin/products", icon: Package, label: "商品管理", color: "text-secondary", baseColor: "secondary" },
  { href: "/admin/orders", icon: ShoppingCart, label: "訂單管理", color: "text-emerald-400", baseColor: "emerald-400" },
  { href: "/admin/users", icon: Users, label: "會員管理", color: "text-cyan-400", baseColor: "cyan-400" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden absolute top-5 left-6 z-[60] p-2.5 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-out
        w-72 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0a0a0e]/95 backdrop-blur-3xl shadow-[10px_0_30px_rgba(0,0,0,0.5)]
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
      `}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50"></div>
          <ShieldAlert className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)] relative z-10" />
          <h2 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative z-10">
            管理後台
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group border
                  ${isActive 
                    ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}
                `}>
                  <Icon className={`w-5 h-5 transition-transform ${item.color} ${isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : 'opacity-70 group-hover:opacity-100'}`} />
                </div>
                <span className={`font-bold flex-1 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className={`w-4 h-4 ${item.color}`} />
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <Link 
            href="/catalog" 
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/20 text-sm font-bold"
          >
            <Home className="w-4 h-4" /> 返回商城首頁
          </Link>
          <div className="text-xs text-center text-slate-500 font-medium mt-2">
            HW Store Admin &copy; 2026
          </div>
        </div>
      </aside>
    </>
  );
}