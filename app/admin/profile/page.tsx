"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from "lucide-react"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError("")
    setSuccess(false)

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false)
      setSuccess(true)
    }, 1000)
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError("")
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsUpdating(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false)
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin account settings</p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">Your changes have been saved successfully.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>Update your admin account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Admin Password</CardTitle>
              <CardDescription>Update your admin password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemEmail">System Email</Label>
                <Input id="systemEmail" type="email" defaultValue="system@schedulehandler.com" />
                <p className="text-sm text-muted-foreground">This email will be used for system notifications</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDuration">Default Session Duration (minutes)</Label>
                <Input id="sessionDuration" type="number" defaultValue="60" min="15" step="15" />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoApprove"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="autoApprove">Auto-approve session requests from verified users</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  defaultChecked
                />
                <Label htmlFor="emailNotifications">Send email notifications for new session requests</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
