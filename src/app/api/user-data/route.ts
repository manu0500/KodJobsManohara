import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Path to the user-data.json file for storing applied and bookmarked jobs
const dataFilePath = path.join(process.cwd(), "user-data.json")

// Helper function to ensure the file exists
function ensureFileExists() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ userData: [] }), "utf8")
  }
}

// Helper function to read user data from the file
function getUserData() {
  ensureFileExists()
  const fileData = fs.readFileSync(dataFilePath, "utf8")
  try {
    const data = JSON.parse(fileData)
    return data.userData || []
  } catch (error) {
    console.error("Error parsing user data:", error)
    return []
  }
}

// Helper function to write user data to the file
function saveUserData(userData: any[]) {
  ensureFileExists()
  fs.writeFileSync(dataFilePath, JSON.stringify({ userData }, null, 2), "utf8")
}

// GET endpoint to retrieve user data by userId
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const allUserData = getUserData()
    const userData = allUserData.find((data) => data.userId === userId) || {
      userId,
      appliedJobs: [],
      bookmarkedJobs: [],
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error retrieving user data:", error)
    return NextResponse.json({ error: "Failed to retrieve user data" }, { status: 500 })
  }
}

// POST endpoint to update user data
export async function POST(request: NextRequest) {
  try {
    const { userId, appliedJobs, bookmarkedJobs } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const allUserData = getUserData()
    const userDataIndex = allUserData.findIndex((data) => data.userId === userId)

    if (userDataIndex >= 0) {
      // Update existing user data
      allUserData[userDataIndex] = {
        userId,
        appliedJobs: appliedJobs || allUserData[userDataIndex].appliedJobs,
        bookmarkedJobs: bookmarkedJobs || allUserData[userDataIndex].bookmarkedJobs,
      }
    } else {
      // Add new user data
      allUserData.push({
        userId,
        appliedJobs: appliedJobs || [],
        bookmarkedJobs: bookmarkedJobs || [],
      })
    }

    saveUserData(allUserData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user data:", error)
    return NextResponse.json({ error: "Failed to update user data" }, { status: 500 })
  }
}

