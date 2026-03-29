"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export function NavbarCart() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
        <ShoppingCart className="w-5 h-5 text-foreground" />
      </div>
    );
  }

  return (
    <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors group">
      <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
