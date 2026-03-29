import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import EditProductClient from "./EditProductClient"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      pricePlans: { orderBy: { price: 'asc' } }
    }
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <EditProductClient product={product} categories={categories} />
}