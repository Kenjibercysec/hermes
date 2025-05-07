import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { categorizeNewsletter } from "@/lib/ai"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const newsletter = await db.newsletter.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!newsletter) {
      return NextResponse.json({ message: "Newsletter not found" }, { status: 404 })
    }

    if (newsletter.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ message: "You are not authorized to delete this newsletter" }, { status: 403 })
    }

    await db.newsletter.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Newsletter deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting newsletter:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const newsletter = await db.newsletter.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!newsletter) {
      return NextResponse.json({ message: "Newsletter not found" }, { status: 404 })
    }

    if (newsletter.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ message: "You are not authorized to update this newsletter" }, { status: 403 })
    }

    const { title, subtitle, content, category, published, scheduledFor, imageUrl } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    // If no category is provided, use AI to categorize the content
    let finalCategory = category
    if (!finalCategory) {
      finalCategory = await categorizeNewsletter(content)
    }

    const updatedNewsletter = await db.newsletter.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        subtitle,
        content,
        category: finalCategory,
        published,
        scheduledFor,
        imageUrl,
      },
    })

    return NextResponse.json(
      { message: "Newsletter updated successfully", newsletter: updatedNewsletter },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating newsletter:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const newsletter = await db.newsletter.findUnique({
      where: {
        id: params.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    })

    if (!newsletter) {
      return NextResponse.json({ message: "Newsletter not found" }, { status: 404 })
    }

    return NextResponse.json({ newsletter })
  } catch (error) {
    console.error("Error fetching newsletter:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
