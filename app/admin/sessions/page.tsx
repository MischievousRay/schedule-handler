"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

interface Session {
  id: string
  title: string
  description: string
  userName: string
  userEmail: string
  requestedDate: string
  requestedTime: string
  originalFileName: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/sessions")

      if (!response.ok) {
        throw new Error("Failed to fetch sessions")
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      console.error("Error fetching sessions:", err)
      setError("Failed to load sessions. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update session status")
      }

      // Update the local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, status, adminNotes: adminNotes || session.adminNotes } : session,
        ),
      )

      setSuccess(`Session ${status === "approved" ? "approved" : "rejected"} successfully`)
      setDialogOpen(false)
      setSelectedSession(null)
      setAdminNotes("")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
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

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session)
    setAdminNotes(session.adminNotes || "")
    setDialogOpen(true)
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || session.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingSessions = filteredSessions.filter((session) => session.status === "pending")
  const approvedSessions = filteredSessions.filter((session) => session.status === "approved")
  const rejectedSessions = filteredSessions.filter((session) => session.status === "rejected")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
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
          <h1 className="text-3xl font-bold">Manage Sessions</h1>
          <p className="text-muted-foreground">Review and manage all session requests from users</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Session Requests</CardTitle>
            <CardDescription>View, download, and manage all session requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, user, or file name"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({filteredSessions.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingSessions.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedSessions.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedSessions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {renderSessionsList(filteredSessions)}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {renderSessionsList(pendingSessions)}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {renderSessionsList(approvedSessions)}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {renderSessionsList(rejectedSessions)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedSession && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedSession.title}</DialogTitle>
              <DialogDescription>Session request details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                {getStatusBadge(selectedSession.status)}
              </div>
              <div>
                <span className="font-medium">Requested by:</span>
                <p>
                  {selectedSession.userName} ({selectedSession.userEmail})
                </p>
              </div>
              <div>
                <span className="font-medium">Scheduled for:</span>
                <p>
                  {formatDate(selectedSession.requestedDate)} at {selectedSession.requestedTime}
                </p>
              </div>
              <div>
                <span className="font-medium">Document:</span>
                <p>{selectedSession.originalFileName}</p>
              </div>
              {selectedSession.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground">{selectedSession.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Admin Notes:</span>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this session request"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleDownload(selectedSession.id, selectedSession.originalFileName)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {selectedSession.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                    onClick={() => handleStatusChange(selectedSession.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleStatusChange(selectedSession.id, "rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  )

  function renderSessionsList(sessions: Session[]) {
    if (isLoading) {
      return <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
    }

    if (sessions.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No sessions found matching your criteria.</div>
    }

    return sessions.map((session) => (
      <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{session.title}</h3>
            {getStatusBadge(session.status)}
          </div>
          <p className="text-sm text-muted-foreground">Requested by: {session.userName}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(session.requestedDate)} at {session.requestedTime}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => handleDownload(session.id, session.originalFileName)}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(session)}>
            View Details
          </Button>
          {session.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => handleStatusChange(session.id, "approved")}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={() => handleStatusChange(session.id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    ))
  }
}
