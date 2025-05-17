import { NextResponse } from "next/server"
import { getSessionRequestById, getPdfAsBase64 } from "@/lib/file-storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionRequestById(params.id)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Extract filename from path
    const fileName = session.pdfPath.split("/").pop()

    if (!fileName) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const base64Data = getPdfAsBase64(fileName)

    if (!base64Data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json({
      fileName: session.originalFileName,
      data: base64Data,
      mimeType: "application/pdf",
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
