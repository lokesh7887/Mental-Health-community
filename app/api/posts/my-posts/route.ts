// app/api/posts/my-posts/route.ts
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { Post } from "@/lib/models/Post"
import { verifyToken } from "@/lib/auth"   // or wherever your server JWT logic lives

export async function GET(request: Request) {
  await connectToDatabase()

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const posts = await Post.find({ author: payload.id }).sort({ createdAt: -1 })
  return NextResponse.json({ posts })
}
