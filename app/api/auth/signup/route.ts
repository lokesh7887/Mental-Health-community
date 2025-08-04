import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { User } from "@/lib/models/User"


export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Generate a valid email format
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '')
    const email = `${sanitizedUsername}@mindspace.app`

    const user = new User({ 
      username,
      email,
      password 
    })
    await user.save()

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
