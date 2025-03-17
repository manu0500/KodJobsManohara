"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  dob: string
  age: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, dob: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Load user from sessionStorage on initial render
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        sessionStorage.removeItem("currentUser")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const userData = await response.json()
      setUser(userData)
      setIsAuthenticated(true)
      sessionStorage.setItem("currentUser", JSON.stringify(userData))
      return true
    } catch (error) {
      console.error("Error during login:", error)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string, dob: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, dob }),
      })

      if (!response.ok) {
        return false
      }

      const userData = await response.json()
      setUser(userData)
      setIsAuthenticated(true)
      sessionStorage.setItem("currentUser", JSON.stringify(userData))
      return true
    } catch (error) {
      console.error("Error during signup:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

