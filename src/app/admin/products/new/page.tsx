// src/app/admin/products/new/page.tsx
import prisma from "@/lib/db"
import NewProductClient from "./NewProductClient"
import { redirect } from "next/navigation"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  if (categories.length === 0) {
    // 如果沒有分類，不允許建立商品
    redirect("/admin/categories?error=noclass")
  }

  return <NewProductClient categories={categories} />
}
