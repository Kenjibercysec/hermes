import { db } from "@/lib/db"
import { createSession, signInSchema, verifyPassword } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const result = signInSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { email, password } = result.data

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    await createSession(user.id)

    return NextResponse.json({ message: "Signed in successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error signing in:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
