import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const userUpdateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().optional(),
  customLink: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const result = userUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { name, bio, customLink } = result.data

    // Check if custom link is already taken
    if (customLink) {
      const existingUser = await db.user.findFirst({
        where: {
          customLink,
          id: {
            not: user.id,
          },
        },
      })

      if (existingUser) {
        return NextResponse.json({ message: "Custom link is already taken" }, { status: 409 })
      }
    }

    // Update user
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        bio,
        customLink,
      },
    })

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
