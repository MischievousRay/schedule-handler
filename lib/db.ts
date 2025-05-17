import type { User, SessionRequest } from "./models"

// Mock database functions
export const db = {
  // User functions
  getUser: (id: string): Promise<User | null> => {
    return new Promise((resolve) => {
      const storedUser = localStorage.getItem("user")
      if (storedUser && JSON.parse(storedUser).id === id) {
        resolve({
          ...JSON.parse(storedUser),
          createdAt: new Date(),
        })
      } else {
        resolve(null)
      }
    })
  },

  // Session functions
  createSessionRequest: (data: Omit<SessionRequest, "id" | "createdAt" | "updatedAt">): Promise<SessionRequest> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(2, 9)
      const now = new Date()

      const sessionRequest: SessionRequest = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      }

      // In a real app, this would save to a database
      // For demo, we'll store in localStorage
      const existingRequests = JSON.parse(localStorage.getItem("sessionRequests") || "[]")
      localStorage.setItem("sessionRequests", JSON.stringify([...existingRequests, sessionRequest]))

      resolve(sessionRequest)
    })
  },

  getUserSessionRequests: (userId: string): Promise<SessionRequest[]> => {
    return new Promise((resolve) => {
      const existingRequests = JSON.parse(localStorage.getItem("sessionRequests") || "[]")
      resolve(existingRequests.filter((req: SessionRequest) => req.userId === userId))
    })
  },

  getAllSessionRequests: (): Promise<SessionRequest[]> => {
    return new Promise((resolve) => {
      const existingRequests = JSON.parse(localStorage.getItem("sessionRequests") || "[]")
      resolve(existingRequests)
    })
  },

  updateSessionStatus: (
    id: string,
    status: "pending" | "approved" | "rejected",
    adminNotes?: string,
  ): Promise<SessionRequest> => {
    return new Promise((resolve, reject) => {
      const existingRequests = JSON.parse(localStorage.getItem("sessionRequests") || "[]")
      const requestIndex = existingRequests.findIndex((req: SessionRequest) => req.id === id)

      if (requestIndex === -1) {
        reject(new Error("Session request not found"))
        return
      }

      existingRequests[requestIndex] = {
        ...existingRequests[requestIndex],
        status,
        adminNotes,
        updatedAt: new Date(),
      }

      localStorage.setItem("sessionRequests", JSON.stringify(existingRequests))
      resolve(existingRequests[requestIndex])
    })
  },
}
