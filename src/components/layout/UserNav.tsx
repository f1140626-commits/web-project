"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
      >
        登入 / 註冊
      </Link>
    );
  }

  return (
    <div className="relative group inline-block">
      <button className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary overflow-hidden">
          {session.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        <span className="hidden sm:inline-block max-w-[100px] truncate">
          {session.user?.name || "會員"}
        </span>
      </button>

      {/* 下拉選單 */}
      <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <div className="px-4 py-2 border-b">
            <p className="text-sm text-foreground font-medium truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session.user?.email}
            </p>
          </div>
          {/* 加入管理員專區連結 */}
          {(session?.user as any)?.role === "ADMIN" && (
            <Link href="/admin" className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-bold text-primary">
              ⭐ 管理後台
            </Link>
          )}
          {/* 個人中心連結 */}
          <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-medium">
            👤 個人中心
          </Link>
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-medium">
            📦 我的訂單 (提卡)
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </button>
        </div>
      </div>
    </div>
  );
}
