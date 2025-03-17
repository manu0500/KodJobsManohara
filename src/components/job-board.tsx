"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showBookmarked, setShowBookmarked] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const { appliedJobs, bookmarkedJobs, applyToJob, withdrawApplication, toggleBookmark } = useUserData()
  const router = useRouter()

  const jobsPerSlide = 6

  const filteredJobs = jobs.filter((job) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      job.name.toLowerCase().includes(searchLower) ||
      job.company.name.toLowerCase().includes(searchLower) ||
      job.locations.some((loc) => loc.name.toLowerCase().includes(searchLower))
    )
  })

  const displayedJobs = showBookmarked ? filteredJobs.filter((job) => bookmarkedJobs.includes(job.id)) : filteredJobs

  const totalSlides = Math.ceil(displayedJobs.length / jobsPerSlide)

  useEffect(() => {
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
  }, [toast])

  const currentJobs = displayedJobs.slice(currentPage * jobsPerSlide, (currentPage + 1) * jobsPerSlide)

  const handleApply = (jobId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (appliedJobs.includes(jobId)) {
      // Withdraw application
      withdrawApplication(jobId)
      toast({
        title: "Application Withdrawn",
        description: "Your job application has been withdrawn.",
      })
    } else {
      // Apply for job
      applyToJob(jobId)
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully.",
      })
    }
  }

  const handleBookmark = (jobId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark jobs.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Kod Jobs</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto nav-buttons">
          <div className="relative flex-1 sm:w-64 search-input">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, locations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowBookmarked(!showBookmarked)}>
            {showBookmarked ? "All Jobs" : "Bookmarked"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/applied")}>
            Applied
          </Button>
        </div>
      </div>

      {displayedJobs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
          <p className="text-muted-foreground">
            {showBookmarked ? "You haven't bookmarked any jobs yet." : "No jobs match your search criteria."}
          </p>
          {showBookmarked && (
            <Button className="mt-4" onClick={() => setShowBookmarked(false)}>
              View All Jobs
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={appliedJobs.includes(job.id)}
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

