"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ email: "", otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email) {
      setError("請輸入信箱");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      startCountdown();
      setSuccess("驗證碼已發送到您的信箱");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "無法發送驗證碼");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.otp || !data.newPassword) {
      setError("所有欄位皆為必填");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      setSuccess("密碼重設成功，將跳轉至登入頁面...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "驗證碼錯誤或失效");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] border border-primary/30 relative">
          <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-secondary animate-pulse" />
        </div>
        <h2 className="text-center text-4xl font-black tracking-tight text-gradient drop-shadow-sm">
          忘記密碼
        </h2>
        <p className="mt-3 text-center text-sm text-slate-400">
          記起密碼了嗎？{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-white transition-colors relative group"
          >
            返回登入
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="glass-card shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-3xl border border-white/10 p-8 sm:px-10 relative overflow-hidden">
          {/* Internal glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          <form className="space-y-6 relative z-10" onSubmit={step === 1 ? requestOTP : resetPassword}>
            {step === 1 ? (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  輸入您的註冊信箱
                </label>
                <div className="mt-1 relative group">
                  <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 group-hover:border-white/20"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      6 位數驗證碼
                    </label>
                    <div className="mt-1 relative group">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={data.otp}
                        onChange={(e) => setData({ ...data, otp: e.target.value })}
                        className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 group-hover:border-white/20 tracking-widest text-center text-xl"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      新密碼
                    </label>
                    <div className="mt-1 relative group">
                      <input
                        type="password"
                        required
                        value={data.newPassword}
                        onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                        className="block w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 group-hover:border-white/20"
                        placeholder="輸入新密碼"
                      />
                    </div>
                  </div>
                </div>
            )}

            {error && (
              <div className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                {success}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10">
                  {loading ? "處理中..." : step === 1 ? "發送驗證碼" : "重設密碼"}
                </span>
              </button>
              
              {step === 2 && (
                  <button
                    type="button"
                    onClick={requestOTP}
                    disabled={countdown > 0 || loading}
                    className="flex w-full justify-center rounded-xl bg-white/5 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                  >
                    {countdown > 0 ? `${countdown}秒後可重新發送` : "重新發送驗證碼"}
                  </button>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
