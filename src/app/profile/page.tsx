import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { User, Mail, Shield, Calendar, Settings, Key, Fingerprint } from "lucide-react";
import ProfileForm from "./ProfileForm";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  // @ts-ignore
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">個人中心</h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理您的公開個人檔案與帳號資訊
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:items-start">
        {/* 左側：側邊選單與資訊 */}
        <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24">
          {/* 選單 */}
          <nav className="flex flex-col gap-1 hidden md:flex">
             <div className="px-4 py-3 bg-primary/10 text-primary font-medium rounded-xl flex items-center gap-3">
               <User className="w-5 h-5" />
               帳號設定
             </div>
             <Link href="/dashboard" className="px-4 py-3 text-muted-foreground hover:bg-muted font-medium rounded-xl flex items-center gap-3 transition-colors">
               <Key className="w-5 h-5" />
               我的訂單
             </Link>
          </nav>

          {/* 行動版選單 (水平滾動) */}
          <nav className="flex gap-2 overflow-x-auto pb-2 md:hidden">
             <div className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-full flex items-center gap-2 whitespace-nowrap">
               <User className="w-4 h-4" />
               帳號設定
             </div>
             <Link href="/dashboard" className="px-4 py-2 text-muted-foreground hover:bg-muted bg-card border font-medium rounded-full flex items-center gap-2 whitespace-nowrap transition-colors">
               <Key className="w-4 h-4" />
               我的訂單
             </Link>
          </nav>

          {/* 帳號唯讀資訊卡片 */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> 註冊信箱
              </p>
              <p className="text-sm font-medium break-all bg-muted/50 p-2.5 rounded-lg border border-border/50">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 系統權限
              </p>
              <div className="flex items-center">
                {user.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                    <Fingerprint className="w-4 h-4" />
                    管理員 (ADMIN)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-bold border border-emerald-500/20">
                    <User className="w-4 h-4" />
                    一般會員
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 註冊時間
              </p>
              <p className="text-sm font-medium pl-1">
                {new Date(user.createdAt).toLocaleDateString('zh-TW', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 右側：可編輯表單區域 */}
        <div className="flex-1 w-full min-w-0">
          <ProfileForm initialName={user.name} initialImage={user.image} />
        </div>
      </div>
    </div>
  );
}
