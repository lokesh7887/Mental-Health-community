import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { Post } from "@/lib/models/Post"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { type } = await request.json()
    const update = type === "up" 
      ? { $inc: { upvotes: 1 } }
      : { $inc: { downvotes: 1 } }

    const post = await Post.findByIdAndUpdate(
      params.postId,
      update,
      { new: true }
    )

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}