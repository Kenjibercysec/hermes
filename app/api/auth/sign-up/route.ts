import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { signUpSchema } from "@/lib/auth-client"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const result = signUpSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
