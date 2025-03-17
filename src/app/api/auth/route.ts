import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Path to the user.json file
const dataFilePath = path.join(process.cwd(), "user.json")

// Helper function to read users from the file
function getUsers() {
  if (!fs.existsSync(dataFilePath)) {
    return []
  }

  const fileData = fs.readFileSync(dataFilePath, "utf8")
  try {
    const data = JSON.parse(fileData)
    return data.users || []
  } catch (error) {
    console.error("Error parsing user data:", error)
    return []
  }
}

// POST endpoint for user login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const users = getUsers()

    // Find user with matching email and password
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

