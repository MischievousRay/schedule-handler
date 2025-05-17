import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/users"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = getUserByEmail(email)

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
