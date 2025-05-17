"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Clock, FileUp } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Session {
  id: string
  title: string
  requestedDate: string
  requestedTime: string
  status: "pending" | "approved" | "rejected"
  originalFileName: string
  updatedAt: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/sessions?userId=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch sessions")
        }

        const data = await response.json()
        setSessions(data)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        setError("Failed to load your sessions. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [user])

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  // Get upcoming sessions (approved and date is in the future)
  const upcomingSessions = sortedSessions
    .filter((session) => {
      const sessionDate = new Date(session.requestedDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return sessionDate >= today && session.status === "approved"
    })
    .slice(0, 3)

  // Get recent uploads
  const recentUploads = sortedSessions.slice(0, 3)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Here's an overview of your activity.</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">Upcoming Sessions</CardTitle>
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading sessions...</div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDate(session.requestedDate)} at {session.requestedTime}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Approved</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4">No upcoming sessions.</p>
              )}
              <div className="mt-4">
                <Link href="/dashboard/upload">
                  <Button variant="outline" className="w-full">
                    Book New Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">Recent Uploads</CardTitle>
              <FileUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading uploads...</div>
              ) : recentUploads.length > 0 ? (
                <div className="space-y-4">
                  {recentUploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{upload.title}</p>
                        <p className="text-sm text-muted-foreground">Uploaded on {formatDate(upload.updatedAt)}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          upload.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : upload.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4">No recent uploads.</p>
              )}
              <div className="mt-4">
                <Link href="/dashboard/upload">
                  <Button variant="outline" className="w-full">
                    Upload New PDF
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
