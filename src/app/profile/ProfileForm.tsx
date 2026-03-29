"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { User, Lock, Save, Loader2, Camera } from "lucide-react";
import Image from "next/image";

interface ProfileFormProps {
  initialName: string | null;
  initialImage: string | null;
}

export default function ProfileForm({ initialName, initialImage }: ProfileFormProps) {
  const [name, setName] = useState(initialName || "");
  const [image, setImage] = useState(initialImage || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendVerificationCode = async () => {
    if (countdown > 0) return;
    try {
      setIsSendingCode(true);
      const res = await fetch("/api/user/password/send-code", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");
      toast.success("驗證碼已寄送到您的電子信箱");
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("請上傳圖片檔案");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片大小不能超過 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setImage(base64Image);

      try {
        toast.loading("更新頭像中...", { id: "avatarUpdate" });
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, image: base64Image }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "更新失敗");

        toast.success("頭像已更新", { id: "avatarUpdate" });
      } catch (error: any) {
        toast.error(error.message, { id: "avatarUpdate" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("顯示名稱不能為空");
      return;
    }

    try {
      setIsUpdatingName(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新失敗");

      toast.success("顯示名稱已更新");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword || !verificationCode) {
      toast.error("請填寫所有密碼欄位與信箱驗證碼");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("新密碼與確認密碼不一致");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("新密碼長度至少需6個字元");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, verificationCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "修改密碼失敗");

      toast.success("密碼修改成功");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 mt-0">
      {/* 修改大頭貼區塊 */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background shadow-md relative bg-muted flex-shrink-0">
            {image ? (
              <Image src={image} alt="User Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary uppercase text-3xl font-bold">
                {name?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-xl font-bold mb-2">個人頭像</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            設定您的公開頭像。支援 <span className="text-foreground font-medium">JPG, PNG</span> 格式，檔案大小請勿超過 <span className="text-foreground font-medium">5MB</span>。
          </p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-xl hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            上傳新頭像
          </button>
        </div>
      </div>

      {/* 修改名稱表單 */}
      <form onSubmit={handleUpdateName} className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            顯示名稱
          </h2>
          <p className="text-sm text-muted-foreground mt-1">這將是其他使用者與管理員看到您的名稱。</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-1 px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            placeholder="請輸入新的顯示名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={isUpdatingName || name === initialName}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 transition-opacity"
          >
            {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            儲存名稱
          </button>
        </div>
      </form>

      {/* 修改密碼表單 */}
      <form onSubmit={handleUpdatePassword} className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            變更密碼
          </h2>
          <p className="text-sm text-muted-foreground mt-1">定期更新密碼以保持您的帳號安全。</p>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">當前密碼</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="請輸入當前密碼"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">新密碼</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="至少 6 個字元"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">確認新密碼</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="請再次輸入新密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">信箱驗證碼</label>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="6位數驗證碼"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || countdown > 0}
                className="px-4 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 disabled:opacity-50 transition-colors whitespace-nowrap min-w-[120px]"
              >
                {isSendingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : countdown > 0 ? (
                  `${countdown} 秒後重試`
                ) : (
                  "發送驗證碼"
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 transition-opacity"
          >
            {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            更新密碼
          </button>
        </div>
      </form>
    </div>
  );
}