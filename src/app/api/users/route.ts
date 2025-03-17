import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define the user data structure
interface User {
  id: string
  name: string
  email: string
  password: string
  dob: string
  age: number
}

// Path to the user.json file
const dataFilePath = path.join(process.cwd(), "user.json")

// Helper function to ensure the file exists
function ensureFileExists() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ users: [] }), "utf8")
  }
}

// Helper function to read users from the file
function getUsers(): User[] {
  ensureFileExists()
  const fileData = fs.readFileSync(dataFilePath, "utf8")
  try {
    const data = JSON.parse(fileData)
    return data.users || []
  } catch (error) {
    console.error("Error parsing user data:", error)
    return []
  }
}

// Helper function to write users to the file
function saveUsers(users: User[]) {
  ensureFileExists()
  fs.writeFileSync(dataFilePath, JSON.stringify({ users }, null, 2), "utf8")
}

// Calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// GET endpoint to retrieve all users
export async function GET() {
  try {
    const users = getUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error retrieving users:", error)
    return NextResponse.json({ error: "Failed to retrieve users" }, { status: 500 })
  }
}

// POST endpoint to create a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, dob } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !dob) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const users = getUsers()

    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password,
      dob,
      age: calculateAge(dob),
    }

    // Add to users array and save
    users.push(newUser)
    saveUsers(users)

    // Return the new user without the password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

