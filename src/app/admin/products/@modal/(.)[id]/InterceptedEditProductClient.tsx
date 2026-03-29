"use client";
import SlideOver from "../../../components/SlideOver";
import EditProductClient from "../../[id]/EditProductClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InterceptedEditProductClient({ product, categories }: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => router.back(), 300);
  };

  return (
    <SlideOver title={`編輯商品：${product.name}`} isOpen={isOpen} onClose={handleClose}>
      <EditProductClient product={product} categories={categories} />
    </SlideOver>
  );
}