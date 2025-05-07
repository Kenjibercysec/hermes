import { improveText } from "@/lib/ai"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { text } = await req.json()

    if (!text || typeof text !== "string" || text.length < 50) {
      return NextResponse.json({ message: "Text must be at least 50 characters" }, { status: 400 })
    }

    const improvedText = await improveText(text)

    return NextResponse.json({ improvedText })
  } catch (error) {
    console.error("Error improving text:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
