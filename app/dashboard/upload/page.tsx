"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FileUp, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"

export default function UploadPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [date, setDate] = useState<Date | undefined>()
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      } else {
        setError("Please upload a PDF file")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file || !date || !timeSlot || !title) {
      setError("Please fill in all required fields")
      return
    }

    if (!user) {
      setError("You must be logged in to upload files")
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Upload the file
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || "Failed to upload file")
      }

      const uploadData = await uploadResponse.json()

      // Step 2: Create the session request
      const sessionResponse = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          pdfPath: uploadData.fileName,
          originalFileName: uploadData.originalName,
          fileSize: uploadData.size,
          requestedDate: date.toISOString().split("T")[0],
          requestedTime: timeSlot,
          status: "pending",
        }),
      })

      if (!sessionResponse.ok) {
        const sessionError = await sessionResponse.json()
        throw new Error(sessionError.error || "Failed to create session request")
      }

      setSuccess(true)

      // Reset form
      setFile(null)
      setDate(undefined)
      setTimeSlot("")
      setTitle("")
      setDescription("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      console.error("Error submitting form:", err)
      setError(err.message || "An error occurred while submitting your request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Upload PDF & Book Session</h1>
        <p className="text-muted-foreground">Upload your PDF document and select your preferred session time.</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <FileUp className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Upload Successful!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your PDF has been uploaded and your session request has been submitted. You will be notified when an admin
              reviews your request.
            </AlertDescription>
            <Button className="mt-4" onClick={() => setSuccess(false)}>
              Upload Another PDF
            </Button>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Document</CardTitle>
              <CardDescription>Please upload your PDF document and select your preferred session time.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your session"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf-upload">Upload PDF</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                    >
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span>{file ? file.name : "Click to upload PDF"}</span>
                      {file && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today || date.getDay() === 0 || date.getDay() === 6
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Time</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Notes</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any additional information about your session request"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Upload and Book Session"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
