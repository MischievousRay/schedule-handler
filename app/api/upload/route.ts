import { NextResponse } from "next/server"
import { savePdfFile } from "@/lib/file-storage"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const { fileName } = await savePdfFile(file)

    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
