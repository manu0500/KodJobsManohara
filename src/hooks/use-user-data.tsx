"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface UserDataContextType {
  appliedJobs: number[]
  bookmarkedJobs: number[]
  applyToJob: (jobId: number) => Promise<void>
  withdrawApplication: (jobId: number) => Promise<void>
  toggleBookmark: (jobId: number) => Promise<void>
  isLoading: boolean
  clearUserData: () => void
}

const UserDataContext = createContext<UserDataContextType>({
  appliedJobs: [],
  bookmarkedJobs: [],
  applyToJob: async () => {},
  withdrawApplication: async () => {},
  toggleBookmark: async () => {},
  isLoading: true,
  clearUserData: () => {},
})

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [appliedJobs, setAppliedJobs] = useState<number[]>([])
  const [bookmarkedJobs, setBookmarkedJobs] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  // Clear user data function
  const clearUserData = () => {
    setAppliedJobs([])
    setBookmarkedJobs([])
  }

  // Reset data when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      clearUserData()
    }
  }, [isAuthenticated])

  // Load user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user-data?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setAppliedJobs(data.appliedJobs || [])
          setBookmarkedJobs(data.bookmarkedJobs || [])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isAuthenticated, user])

  // Save user data to the server
  const saveUserData = async () => {
    if (!isAuthenticated || !user?.id) return

    try {
      await fetch("/api/user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          appliedJobs,
          bookmarkedJobs,
        }),
      })
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  // Save data whenever it changes
  useEffect(() => {
    if (isAuthenticated && user?.id && !isLoading) {
      saveUserData()
    }
  }, [appliedJobs, bookmarkedJobs, isAuthenticated, user, isLoading])

  const applyToJob = async (jobId: number) => {
    if (!isAuthenticated) return
    setAppliedJobs((prev) => [...prev, jobId])
  }

  const withdrawApplication = async (jobId: number) => {
    if (!isAuthenticated) return
    setAppliedJobs((prev) => prev.filter((id) => id !== jobId))
  }

  const toggleBookmark = async (jobId: number) => {
    if (!isAuthenticated) return

    if (bookmarkedJobs.includes(jobId)) {
      setBookmarkedJobs((prev) => prev.filter((id) => id !== jobId))
    } else {
      setBookmarkedJobs((prev) => [...prev, jobId])
    }
  }

  return (
    <UserDataContext.Provider
      value={{
        appliedJobs,
        bookmarkedJobs,
        applyToJob,
        withdrawApplication,
        toggleBookmark,
        isLoading,
        clearUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export const useUserData = () => useContext(UserDataContext)

