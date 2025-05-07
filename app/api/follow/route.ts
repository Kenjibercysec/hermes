import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { followingId, action } = await req.json()

    if (!followingId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (user.id === followingId) {
      return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 })
    }

    // Check if the user to follow exists
    const userToFollow = await db.user.findUnique({
      where: {
        id: followingId,
      },
    })

    if (!userToFollow) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (action === "follow") {
      // Check if already following
      const existingFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId,
          },
        },
      })

      if (existingFollow) {
        return NextResponse.json({ message: "Already following this user" }, { status: 400 })
      }

      // Create follow
      await db.follow.create({
        data: {
          followerId: user.id,
          followingId,
        },
      })

      return NextResponse.json({ message: "Successfully followed user" }, { status: 200 })
    } else if (action === "unfollow") {
      // Check if following
      const existingFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId,
          },
        },
      })

      if (!existingFollow) {
        return NextResponse.json({ message: "Not following this user" }, { status: 400 })
      }

      // Delete follow
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId,
          },
        },
      })

      return NextResponse.json({ message: "Successfully unfollowed user" }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
