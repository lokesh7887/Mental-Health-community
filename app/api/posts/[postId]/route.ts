import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { Post } from "@/lib/models/Post"
import { Comment } from "@/lib/models/Comment"
import { verifyToken } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Find the post
    const post = await Post.findById(params.postId)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if the user is the post owner
    if (post.author.toString() !== payload.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 }
      )
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: params.postId })

    // Delete the post
    await Post.findByIdAndDelete(params.postId)

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}