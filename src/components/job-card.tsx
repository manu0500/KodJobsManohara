"use client"

import { Bookmark, BookmarkCheck, Building2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  job: {
    id: number
    name: string
    company: {
      name: string
    }
    locations: { name: string }[]
    levels: { name: string }[]
    publication_date: string
  }
  isApplied: boolean
  isBookmarked: boolean
  onApply: () => void
  onBookmark: () => void
}

export default function JobCard({ job, isApplied, isBookmarked, onApply, onBookmark }: JobCardProps) {
  // Format the publication date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className="h-full flex flex-col max-w-sm job-card">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-2">{job.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 bookmark-button"
            onClick={onBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground text-sm">
            <Building2 className="h-3 w-3 mr-1 shrink-0" />
            <span>{job.company.name}</span>
          </div>

          {job.locations.length > 0 && (
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1 shrink-0" />
              <span className="line-clamp-1">{job.locations.map((loc) => loc.name).join(", ")}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {job.levels.map((level, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {level.name}
              </Badge>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">Posted: {formatDate(job.publication_date)}</div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 px-3 pb-3">
        <Button
          className="w-full text-sm py-1 h-8 apply-button"
          variant={isApplied ? "outline" : "default"}
          style={isApplied ? { backgroundColor: "#e6ffee", borderColor: "#d1ffd1", color: "#2c7a2c" } : {}}
          onClick={onApply}
        >
          {isApplied ? "Withdraw Application" : "Apply Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}

