import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // @ts-ignore
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const json = await request.json()
    const { notes, status } = json

    const orderId = params.id

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        notes,
        status: status || 'COMPLETED',
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error('Error dispatching order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
