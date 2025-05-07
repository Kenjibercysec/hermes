import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ message: "Image URL is required" }, { status: 400 })
    }

    // Update user
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: imageUrl,
      },
    })

    return NextResponse.json({ message: "Profile image updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
