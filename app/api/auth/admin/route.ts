import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set("userId", "admin", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  redirect("/admin")
} 