"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTour } from "@/components/tour-provider"

export function SiteHeader() {
  const { startTour } = useTour()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Kod Jobs</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={startTour} aria-label="Start tour">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <div className="theme-toggle">
            <ThemeToggle />
          </div>
          <div className="user-nav">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}

