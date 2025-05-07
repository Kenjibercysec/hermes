import { db } from "@/lib/db"
import { compare, hash } from "bcrypt"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Session management
export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  // Temporary admin access
  if (userId === "admin") {
    return {
      id: "admin",
      name: "Admin User",
      email: "admin@example.com",
      image: null,
      bio: "System Administrator",
      customLink: "admin",
      role: "ADMIN"
    }
  }

  if (!userId) {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        customLink: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error("Database error:", error)
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  redirect("/sign-in")
}

// Auth helpers
export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}
