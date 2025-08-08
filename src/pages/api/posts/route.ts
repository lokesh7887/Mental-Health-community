// import { type NextRequest, NextResponse } from "next/server"
// import { connectToDatabase } from "@/lib/database"
// import { Post } from "@/lib/models/Post"
// import { verifyToken } from "@/lib/auth"

// export async function GET() {
//   try {
//     await connectToDatabase()
//     const posts = await Post.find({ status: "published" }).sort({ createdAt: -1 }).limit(20)
//     return NextResponse.json({ posts })
//   } catch (error) {
//     console.error("Get posts error:", error)
//     return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase()

//     const authHeader = request.headers.get("authorization")
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Authorization required" }, { status: 401 })
//     }

//     const token = authHeader.split(" ")[1]
//     const payload = verifyToken(token)
//     if (!payload) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 })
//     }

//     const { title, content, category, tags } = await request.json()

//     if (!title || !content || !category) {
//       return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
//     }

//     const post = new Post({
//       title,
//       content,
//       category,
//       tags: tags || [],
//       author: payload.id,
//       authorName: payload.username,
//     })

//     await post.save()
//     return NextResponse.json({ post }, { status: 201 })
//   } catch (error) {
//     console.error("Create post error:", error)
//     return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
//   }
// }




// src/pages/api/posts/my-posts.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { connectToDatabase } from "@/lib/database"
import { Post } from "@/lib/models/Post"
import { verifyToken } from "@/lib/auth"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.setHeader("Allow", "GET").status(405).end("Method Not Allowed")
  }

  // Connect to MongoDB (or your DB)
  await connectToDatabase()

  // Extract & verify JWT
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization required" })
  }

  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  // Fetch only this user’s posts
  try {
    const posts = await Post.find({ author: payload.id })
      .sort({ createdAt: -1 })
      .lean()
    return res.status(200).json({ posts })
  } catch (err) {
    console.error("Fetch my-posts error:", err)
    return res.status(500).json({ error: "Failed to fetch your posts" })
  }
}
