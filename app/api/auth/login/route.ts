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

    const user = await User.findOne({ username }).select("+password")
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = user.generateJWT()

    return NextResponse.json({
      token,
      username: user.username,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
