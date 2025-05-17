import { NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser, changeUserRole, type UserRole } from "@/lib/users"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userData = await request.json()
    const updatedUser = updateUser(params.id, userData)

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: error.message === "User not found" ? 404 : 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    deleteUser(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: error.message === "User not found" ? 404 : 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role } = await request.json()

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: 'Invalid role. Must be "admin" or "user"' }, { status: 400 })
    }

    const updatedUser = changeUserRole(params.id, role as UserRole)

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    console.error("Error changing user role:", error)
    return NextResponse.json(
      { error: error.message || "Failed to change user role" },
      { status: error.message === "User not found" ? 404 : 500 },
    )
  }
}
