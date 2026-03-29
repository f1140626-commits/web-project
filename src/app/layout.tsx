import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavbarCart } from '@/components/layout/NavbarCart'
import AuthProvider from '@/components/layout/AuthProvider'
import { UserNav } from '@/components/layout/UserNav'
import { cn } from "@/lib/utils";
import { Toaster } from 'react-hot-toast';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: '遊戲輔助工具 | 專業外掛商店',
  description: '專業又安全的遊戲輔助工具商店',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="zh-tw" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider session={session}>
          {/* Navbar placeholder */}
          <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 justify-between">
              <div className="mr-4 flex items-center">
                <a className="mr-8 flex items-center space-x-2 group" href="/">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                    <span className="text-white font-black text-xs">HW</span>
                  </div>
                  <span className="hidden font-bold sm:inline-block tracking-wide text-lg">
                    HW-Shop
                  </span>
                </a>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a className="transition-colors hover:text-primary text-foreground/90 font-semibold" href="/">
                    首頁
                  </a>
                  <a className="transition-colors hover:text-primary text-foreground/70" href="/catalog">
                    商品總覽
                  </a>
                  <a className="transition-colors hover:text-[#5865F2] text-foreground/70 flex items-center gap-1" href="https://discord.gg/xsta7YDn8E" target="_blank" rel="noopener noreferrer">
                    Discord群組
                  </a>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <UserNav />
                <div className="w-px h-6 bg-white/10 dark:bg-white/10 bg-black/10"></div>
                <NavbarCart />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px'
              },
            }} 
          />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}