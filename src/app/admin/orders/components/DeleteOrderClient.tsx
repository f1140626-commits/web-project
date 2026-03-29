"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DeleteOrderClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆訂單嗎？此操作無法還原。")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("刪除失敗");
      }

      toast.success("訂單刪除成功");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("刪除訂單發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {isLoading ? "刪除中..." : "刪除訂單"}
    </button>
  );
}
