import { generateTitleSuggestions } from "@/lib/ai"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || typeof content !== "string" || content.length < 50) {
      return NextResponse.json({ message: "Content must be at least 50 characters" }, { status: 400 })
    }

    const titles = await generateTitleSuggestions(content)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error("Error generating titles:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
