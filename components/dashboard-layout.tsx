"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { CalendarClock, FileUp, Home, LogOut, Menu, User, X, Users } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Upload PDF",
      href: "/dashboard/upload",
      icon: FileUp,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Manage Sessions",
      href: "/admin/sessions",
      icon: CalendarClock,
    },
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
    },
  ]

  const navItems = user?.role === "admin" ? adminNavItems : userNavItems

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarClock className="h-6 w-6" />
            <span>Schedule Handler</span>
          </div>
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex h-16 items-center border-b">
                  <CalendarClock className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Schedule Handler</span>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                        pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 justify-start" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <span className="text-sm">Welcome, {user?.name || "User"}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 justify-start mt-auto"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
