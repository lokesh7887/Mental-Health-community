import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { Comment } from "@/lib/models/Comment"
import { Post } from "@/lib/models/Post"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase()
    const comments = await Comment.find({ post: params.postId })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: payload.id,
      authorName: payload.username,
      post: params.postId,
    })

    await Post.findByIdAndUpdate(params.postId, {
      $inc: { comments: 1 },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}