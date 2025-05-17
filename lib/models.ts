export type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: Date
}

export type SessionRequest = {
  id: string
  title: string
  description?: string
  userId: string
  user?: User
  pdfUrl: string
  fileName: string
  fileSize: number
  requestedDate: Date
  requestedTime: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

export type SessionStatus = "pending" | "approved" | "rejected"
