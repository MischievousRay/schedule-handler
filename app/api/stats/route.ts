import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/file-storage"
import { getAllUsersWithoutPasswords } from "@/lib/users"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const stats = getDashboardStats(userId || undefined)
    const users = getAllUsersWithoutPasswords()

    return NextResponse.json({
      sessions: {
        total: stats.total,
        pending: stats.pending,
        approved: stats.approved,
        rejected: stats.rejected,
        upcoming: stats.upcoming,
      },
      users: {
        total: users.length,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
