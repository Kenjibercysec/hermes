import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, content } = await req.json()

    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 })
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
    })

    return NextResponse.json(newsletter)
  } catch (error) {
    console.error("[NEWSLETTERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const authorId = searchParams.get("authorId")

    const newsletters = await prisma.newsletter.findMany({
      where: {
        ...(authorId ? { authorId } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(newsletters)
  } catch (error) {
    console.error("[NEWSLETTERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
