"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface TourStep {
  title: string
  content: string
  target: string
  placement: "top" | "bottom" | "left" | "right"
}

interface TourContextType {
  startTour: () => void
  endTour: () => void
  isActive: boolean
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  endTour: () => {},
  isActive: false,
})

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Kod Jobs!",
    content: "This is a simplified job board where you can find and apply for jobs. Let's take a quick tour!",
    target: "body",
    placement: "top",
  },
  {
    title: "Job Listings",
    content: "Browse through available jobs. Each card shows the job title, company, location, and more.",
    target: ".job-card",
    placement: "bottom",
  },
  {
    title: "Apply for Jobs",
    content:
      "Click 'Apply Now' to submit your application for a job. You can withdraw your application later if needed.",
    target: ".apply-button",
    placement: "bottom",
  },
  {
    title: "Bookmark Jobs",
    content: "Save interesting jobs by clicking the bookmark icon. You can view your bookmarked jobs later.",
    target: ".bookmark-button",
    placement: "left",
  },
  {
    title: "Navigation",
    content: "Use these buttons to navigate between all jobs, bookmarked jobs, and applied jobs.",
    target: ".nav-buttons",
    placement: "bottom",
  },
  {
    title: "Search Jobs",
    content: "Search for specific jobs by title, company, or location.",
    target: ".search-input",
    placement: "bottom",
  },
  {
    title: "Theme Toggle",
    content: "Switch between light and dark mode using this button.",
    target: ".theme-toggle",
    placement: "bottom",
  },
  {
    title: "User Profile",
    content: "Access your profile, view your applications, and manage your account.",
    target: ".user-nav",
    placement: "bottom",
  },
  {
    title: "That's it!",
    content: "You're all set to start using Kod Jobs. Happy job hunting!",
    target: "body",
    placement: "top",
  },
]

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  const startTour = () => {
    setIsActive(true)
    setCurrentStep(0)
    // Check if this is the first visit
    if (!localStorage.getItem("tourShown")) {
      localStorage.setItem("tourShown", "true")
    }
  }

  const endTour = () => {
    setIsActive(false)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Find target element for current step
  useEffect(() => {
    if (!isActive) return

    const step = tourSteps[currentStep]
    let element: HTMLElement | null = null

    if (step.target === "body") {
      element = document.body
    } else {
      element = document.querySelector(step.target)
    }

    setTargetElement(element)
  }, [currentStep, isActive])

  // Show tour automatically on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("tourShown")
    if (!hasSeenTour) {
      // Delay the tour start to ensure the page is fully loaded
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <TourContext.Provider value={{ startTour, endTour, isActive }}>
      {children}
      {isActive && targetElement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{tourSteps[currentStep].title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={endTour}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>{tourSteps[currentStep].content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentStep + 1} / {tourSteps.length}
              </div>
              <Button onClick={nextStep}>{currentStep === tourSteps.length - 1 ? "Finish" : "Next"}</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </TourContext.Provider>
  )
}

export const useTour = () => useContext(TourContext)

