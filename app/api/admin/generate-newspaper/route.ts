import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { generateDailyNewspaper } from "@/lib/ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if newspaper already exists for today
    const existingNewspaper = await db.dailyNewspaper.findFirst({
      where: {
        date: {
          gte: today,
        },
      },
    })

    if (existingNewspaper) {
      return NextResponse.json({ message: "Newspaper already generated for today" }, { status: 400 })
    }

    // Get all published newsletters from today
    const newsletters = await db.newsletter.findMany({
      where: {
        published: true,
        createdAt: {
          gte: today,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (newsletters.length === 0) {
      return NextResponse.json({ message: "No newsletters available for today" }, { status: 400 })
    }

    // Generate newspaper using AI
    const newspaperData = await generateDailyNewspaper(newsletters)

    // Create newspaper
    const newspaper = await db.dailyNewspaper.create({
      data: {
        date: today,
        title: newspaperData.title,
        summary: newspaperData.summary,
        items: {
          create: newspaperData.categories.flatMap((category) =>
            category.newsletters.map((newsletter: any) => ({
              category: category.name,
              highlight: Math.random() < 0.3, // Randomly select some as highlights
              summary: `A ${category.name.toLowerCase()} newsletter by ${newsletter.author.name || "an author"}`,
              newsletterId: newsletter.id,
            })),
          ),
        },
      },
    })

    return NextResponse.json({ message: "Newspaper generated successfully", newspaper }, { status: 201 })
  } catch (error) {
    console.error("Error generating newspaper:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
