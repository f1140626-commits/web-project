import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./components/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // @ts-ignore
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative z-10 overflow-hidden bg-black/20">
      {/* Background glow for admin area */}
      <div className="fixed top-20 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      {/* 獨立主要左側導覽列 (Client Component) */}
      <AdminSidebar />

      {/* 獨立主要內容區域 */}
      <main className="flex-1 overflow-auto p-6 pt-20 lg:p-10 relative z-10 custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  )
}
