import { NextResponse } from "next/server"
import { getSessionRequestById, updateSessionStatus, deleteSessionRequest } from "@/lib/file-storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionRequestById(params.id)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    if (!data.status || !["pending", "approved", "rejected"].includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedSession = updateSessionStatus(params.id, data.status, data.adminNotes)

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = deleteSessionRequest(params.id)

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
