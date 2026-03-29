import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Missing token", { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!verificationToken) {
      return new NextResponse("Token does not exist", { status: 400 });
    }

    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) {
      return new NextResponse("Token has expired", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      return new NextResponse("User does not exist", { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
        // Just in case it was a change email request, confirm it's updating appropriately
        email: verificationToken.identifier,
      },
    });

    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '') || "http://hw-cloud.org";
    return NextResponse.redirect(new URL("/login?verified=true", baseUrl));
  } catch (error) {
    console.error("Verification error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
