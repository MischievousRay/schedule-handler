import { NextResponse } from "next/server"
import {
  createSessionRequest,
  getAllSessionRequests,
  getSessionRequestsByUserId,
  ensureStorageDirs,
} from "@/lib/file-storage"

// Initialize storage
ensureStorageDirs()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let sessions
    if (userId) {
      sessions = getSessionRequestsByUserId(userId)
    } else {
      sessions = getAllSessionRequests()
    }

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      !data.title ||
      !data.userId ||
      !data.userName ||
      !data.userEmail ||
      !data.pdfPath ||
      !data.originalFileName ||
      !data.requestedDate ||
      !data.requestedTime
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newSession = createSessionRequest({
      title: data.title,
      description: data.description || "",
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      pdfPath: data.pdfPath,
      originalFileName: data.originalFileName,
      fileSize: data.fileSize,
      requestedDate: data.requestedDate,
      requestedTime: data.requestedTime,
      status: "pending",
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
