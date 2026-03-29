import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import InterceptedEditProductClient from "./InterceptedEditProductClient";

export default async function ProductEditModal({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      pricePlans: true,
      category: true,
    }
  });

  const categories = await prisma.category.findMany();

  if (!product) {
    notFound();
  }

  return <InterceptedEditProductClient product={product} categories={categories} />;
}