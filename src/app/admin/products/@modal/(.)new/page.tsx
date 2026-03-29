import prisma from "@/lib/db";
import InterceptedNewProductClient from "./InterceptedNewProductClient";

export default async function ProductNewModal() {
  const categories = await prisma.category.findMany();

  return <InterceptedNewProductClient categories={categories} />;
}