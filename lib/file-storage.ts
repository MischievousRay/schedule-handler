import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define paths for storage
const DATA_DIR = path.join(process.cwd(), "data")
const UPLOADS_DIR = path.join(DATA_DIR, "uploads")
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json")

// Ensure directories exist
export function ensureStorageDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }

  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]))
  }
}

// Types
export interface SessionRequest {
  id: string
  title: string
  description: string
  userId: string
  userName: string
  userEmail: string
  pdfPath: string
  originalFileName: string
  fileSize: number
  requestedDate: string
  requestedTime: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

// Save uploaded PDF file
export async function savePdfFile(file: File): Promise<{ path: string; fileName: string }> {
  ensureStorageDirs()

  const fileId = uuidv4()
  const fileExtension = file.name.split(".").pop() || "pdf"
  const fileName = `${fileId}.${fileExtension}`
  const filePath = path.join(UPLOADS_DIR, fileName)

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Write file to disk
  fs.writeFileSync(filePath, buffer)

  return {
    path: filePath,
    fileName,
  }
}

// Get PDF file as base64
export function getPdfAsBase64(fileName: string): string | null {
  const filePath = path.join(UPLOADS_DIR, fileName)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileBuffer = fs.readFileSync(filePath)
  return fileBuffer.toString("base64")
}

// Create a new session request
export function createSessionRequest(data: Omit<SessionRequest, "id" | "createdAt" | "updatedAt">): SessionRequest {
  ensureStorageDirs()

  const sessions = getAllSessionRequests()

  const newSession: SessionRequest = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  sessions.push(newSession)
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))

  return newSession
}

// Get all session requests
export function getAllSessionRequests(): SessionRequest[] {
  ensureStorageDirs()

  try {
    const data = fs.readFileSync(SESSIONS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading sessions file:", error)
    return []
  }
}

// Get session requests by user ID
export function getSessionRequestsByUserId(userId: string): SessionRequest[] {
  const sessions = getAllSessionRequests()
  return sessions.filter((session) => session.userId === userId)
}

// Get session request by ID
export function getSessionRequestById(id: string): SessionRequest | undefined {
  const sessions = getAllSessionRequests()
  return sessions.find((session) => session.id === id)
}

// Update session request status
export function updateSessionStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string,
): SessionRequest | null {
  const sessions = getAllSessionRequests()
  const sessionIndex = sessions.findIndex((session) => session.id === id)

  if (sessionIndex === -1) {
    return null
  }

  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    status,
    adminNotes: adminNotes || sessions[sessionIndex].adminNotes,
    updatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))

  return sessions[sessionIndex]
}

// Delete session request
export function deleteSessionRequest(id: string): boolean {
  const sessions = getAllSessionRequests()
  const sessionIndex = sessions.findIndex((session) => session.id === id)

  if (sessionIndex === -1) {
    return false
  }

  // Get the file name to delete
  const fileName = sessions[sessionIndex].pdfPath.split("/").pop()
  if (fileName) {
    const filePath = path.join(UPLOADS_DIR, fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  sessions.splice(sessionIndex, 1)
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))

  return true
}

// Get dashboard statistics
export function getDashboardStats(userId?: string) {
  const sessions = getAllSessionRequests()

  // Filter by user if userId is provided
  const userSessions = userId ? sessions.filter((session) => session.userId === userId) : sessions

  return {
    total: userSessions.length,
    pending: userSessions.filter((session) => session.status === "pending").length,
    approved: userSessions.filter((session) => session.status === "approved").length,
    rejected: userSessions.filter((session) => session.status === "rejected").length,
    upcoming: userSessions.filter((session) => {
      const sessionDate = new Date(session.requestedDate)
      const today = new Date()
      return sessionDate >= today && session.status === "approved"
    }).length,
  }
}
