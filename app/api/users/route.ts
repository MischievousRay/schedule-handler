import { NextResponse } from "next/server"
import { getAllUsersWithoutPasswords, addUser, type UserRole } from "@/lib/users"
import { ensureDataDir } from "@/lib/users"

// Initialize data directory and files
ensureDataDir()

export async function GET() {
  try {
    const users = getAllUsersWithoutPasswords()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Default role to 'user' if not specified
    const role: UserRole = userData.role === "admin" ? "admin" : "user"

    const newUser = addUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role,
    })

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: error.message === "Email already exists" ? 409 : 500 },
    )
  }
}
