import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarClock, FileUp, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarClock className="h-6 w-6 suppressHydrationWarning" />
            <span>Schedule Handler</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Schedule Handler Web App
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Upload PDFs and book sessions with our easy-to-use platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <FileUp className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Upload PDFs</h3>
                <p className="text-gray-500">Easily upload your PDF documents for review and scheduling.</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CalendarClock className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Book Sessions</h3>
                <p className="text-gray-500">Choose your preferred time slots for your sessions.</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">User Management</h3>
                <p className="text-gray-500">Separate dashboards for users and administrators.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Schedule Handler. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
