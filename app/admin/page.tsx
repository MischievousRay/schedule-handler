"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Download, FileUp, Users } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Session {
  id: string
  title: string
  userName: string
  requestedDate: string
  requestedTime: string
  status: "pending" | "approved" | "rejected"
  originalFileName: string
}

interface DashboardStats {
  sessions: {
    total: number
    pending: number
    approved: number
    rejected: number
    upcoming: number
  }
  users: {
    total: number
  }
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<Session[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    sessions: { total: 0, pending: 0, approved: 0, rejected: 0, upcoming: 0 },
    users: { total: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch("/api/stats")
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch dashboard statistics")
        }
        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch pending sessions
        const sessionsResponse = await fetch("/api/sessions")
        if (!sessionsResponse.ok) {
          throw new Error("Failed to fetch sessions")
        }
        const sessionsData = await sessionsResponse.json()

        // Filter pending sessions and sort by date (newest first)
        const pending = sessionsData
          .filter((session: Session) => session.status === "pending")
          .sort((a: Session, b: Session) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
          .slice(0, 3)

        setPendingRequests(pending)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update session status")
      }

      // Update the local state
      setPendingRequests((prev) => prev.filter((request) => request.id !== id))

      // Refresh stats
      const statsResponse = await fetch("/api/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (err) {
      console.error("Error updating session status:", err)
      setError("Failed to update session status. Please try again.")
    }
  }

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/download`)

      if (!response.ok) {
        throw new Error("Failed to download file")
      }

      const data = await response.json()

      // Create a blob from the base64 data
      const byteCharacters = atob(data.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading file:", err)
      setError("Failed to download file. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's an overview of the system.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.users.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.sessions.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.sessions.upcoming}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Session Requests</CardTitle>
            <CardDescription>Review and manage pending session requests from users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading requests...</div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Requested by: {request.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.requestedDate)} at {request.requestedTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(request.id, request.originalFileName)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {request.originalFileName}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                        onClick={() => handleStatusChange(request.id, "approved")}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                        onClick={() => handleStatusChange(request.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No pending requests.</div>
            )}
            <div className="mt-4 flex justify-end">
              <Link href="/admin/sessions">
                <Button variant="outline">View All Requests</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
