// 伺服器端元件 - 讀取資料庫然後傳遞給 Client Component
import prisma from "@/lib/db"
import AdminCategoriesClient from "./CategoriesClient"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <AdminCategoriesClient categories={categories} />
}
