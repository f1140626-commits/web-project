"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "註冊失敗，請稍後再試");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--secondary-rgb),0.3)] border border-secondary/30 relative">
          <UserPlus className="w-8 h-8 text-secondary drop-shadow-[0_0_10px_rgba(var(--secondary-rgb),0.8)]" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-pulse" />
        </div>
        <h2 className="text-center text-4xl font-black tracking-tight text-gradient drop-shadow-sm">
          建立新帳號
        </h2>
        <p className="mt-3 text-center text-sm text-slate-400">
          已經有帳號了嗎？{" "}
          <Link
            href="/login"
            className="font-bold text-secondary hover:text-white transition-colors relative group"
          >
            立即登入
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="glass-card shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-3xl border border-white/10 p-8 sm:px-10 relative overflow-hidden">
          {/* Internal glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

          <form className="space-y-6 relative z-10" onSubmit={registerUser}>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                使用者暱稱名稱
              </label>
              <div className="mt-1 relative group">
                <input
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all duration-300 group-hover:border-white/20"
                  placeholder="Neon Rider"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Email 信箱
              </label>
              <div className="mt-1 relative group">
                <input
                  type="email"
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all duration-300 group-hover:border-white/20"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                密碼
              </label>
              <div className="mt-1 relative group">
                <input
                  type="password"
                  required
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all duration-300 group-hover:border-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-secondary px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(var(--secondary-rgb),0.4)] hover:shadow-[0_0_30px_rgba(var(--secondary-rgb),0.6)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10">
                  {loading ? "處理中..." : "註冊帳號"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
