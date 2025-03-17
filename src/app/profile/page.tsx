"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading profile...</h1>
        </div>
      </div>
    )
  }

  // Format the date of birth
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Date of Birth</h3>
              <p className="text-lg">{formatDate(user.dob)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Age</h3>
              <p className="text-lg">{user.age} years old</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">User ID</h3>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Activity</CardTitle>
            <CardDescription>Your job applications and bookmarks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Applied Jobs</h3>
              <JobActivityCounter userId={user.id} storageKey="appliedJobs" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Bookmarked Jobs</h3>
              <JobActivityCounter userId={user.id} storageKey="bookmarkedJobs" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function JobActivityCounter({ userId, storageKey }: { userId: string; storageKey: string }) {
  const count = (() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(`${storageKey}_${userId}`)
      if (data) {
        try {
          return JSON.parse(data).length
        } catch (e) {
          return 0
        }
      }
    }
    return 0
  })()

  return (
    <div className="flex items-center justify-between">
      <p className="text-lg">{count}</p>
      <div className="text-sm text-muted-foreground">
        {count === 0 ? "No activity yet" : count === 1 ? "1 job" : `${count} jobs`}
      </div>
    </div>
  )
}

