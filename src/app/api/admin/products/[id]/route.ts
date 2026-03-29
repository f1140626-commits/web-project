import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, description, status, categoryId, stock, pricePlans, imageUrl } = await req.json()
    const productId = params.id

    // Update product and recreate price plans in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update product base info
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          imageUrl,
          status,
          stock,
          categoryId
        }
      })

      // 2. Delete old price plans
      await tx.pricePlan.deleteMany({
        where: { productId }
      })

      // 3. Create new price plans
      if (pricePlans && pricePlans.length > 0) {
        await tx.pricePlan.createMany({
          data: pricePlans.map((p: any) => ({
            productId,
            name: p.name,
            durationDays: p.durationDays,
            price: p.price
          }))
        })
      }

      return product
    })

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error("Failed to update product:", error)
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const productId = params.id

    // First delete associated price plans, then the product
    await prisma.$transaction([
      prisma.pricePlan.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to delete product:", error)
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    )
  }
}