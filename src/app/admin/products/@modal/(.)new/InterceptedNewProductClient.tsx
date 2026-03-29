"use client";
import SlideOver from "../../../components/SlideOver";
import NewProductClient from "../../new/NewProductClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InterceptedNewProductClient({ categories }: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => router.back(), 300);
  };

  return (
    <SlideOver title="新增商品" isOpen={isOpen} onClose={handleClose}>
      <NewProductClient categories={categories} />
    </SlideOver>
  );
}