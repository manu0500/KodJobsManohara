"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import JobCard from "@/components/job-card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useUserData } from "@/hooks/use-user-data"

interface Job {
  id: number
  name: string
  company: {
    name: string
    short_name: string
  }
  locations: { name: string }[]
  levels: { name: string }[]
  publication_date: string
  refs: {
    landing_page: string
  }
  categories: { name: string }[]
}

export default function AppliedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { appliedJobs, bookmarkedJobs, withdrawApplication, toggleBookmark } = useUserData()
  const router = useRouter()

  const jobsPerSlide = 6

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchJobs = async () => {
      try {
        const response = await fetch("https://www.themuse.com/api/public/jobs?page=0")
        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const data = await response.json()
        setJobs(data.results || [])
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load job listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [toast, isAuthenticated, user, router])

  const appliedJobsList = jobs.filter((job) => appliedJobs.includes(job.id))
  const totalSlides = Math.ceil(appliedJobsList.length / jobsPerSlide)

  const currentJobs = appliedJobsList.slice(currentPage * jobsPerSlide, (currentPage + 1) * jobsPerSlide)

  const handleApply = (jobId: number) => {
    // Withdraw application
    withdrawApplication(jobId)
    toast({
      title: "Application Withdrawn",
      description: "Your job application has been withdrawn.",
    })
  }

  const handleBookmark = (jobId: number) => {
    toggleBookmark(jobId)

    if (bookmarkedJobs.includes(jobId)) {
      toast({
        title: "Bookmark Removed",
        description: "Job has been removed from your bookmarks.",
      })
    } else {
      toast({
        title: "Job Bookmarked",
        description: "Job has been added to your bookmarks.",
      })
    }
  }

  const nextPage = () => {
    if (currentPage < totalSlides - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Applied Jobs</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to All Jobs
        </Button>
      </div>

      {appliedJobsList.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No applied jobs</h2>
          <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
          <Button onClick={() => router.push("/")}>Browse Jobs</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={true}
                isBookmarked={bookmarkedJobs.includes(job.id)}
                onApply={() => handleApply(job.id)}
                onBookmark={() => handleBookmark(job.id)}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {currentPage + 1} of {Math.max(1, totalSlides)}
            </span>
            <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage >= totalSlides - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

