import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { Comment } from "@/lib/models/Comment"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
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

    const comment = await Comment.findByIdAndUpdate(
      params.commentId,
      update,
      { new: true }
    )

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}