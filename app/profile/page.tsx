// app/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/clientAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import axios from "axios"

interface Post {
  _id: string
  title: string
  content: string
  author: string
  authorName: string
  category: string
  upvotes: number
  downvotes: number
  comments: number
  createdAt: string
  tags: string[]
}

export default function ProfilePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace("/auth/login")
      return
    }

    fetch("/api/posts/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Unauthorized")
        return res.json()
      })
      .then((data) => setPosts(data.posts || []))
      .catch(() => router.replace("/auth/login"))
  }, [router])

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      setIsDeleting(postId)
      const token = getToken()
      if (!token) {
        router.push("/auth/login")
        return
      }

      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Remove the post from the state
      setPosts((prev) => prev.filter((post) => post._id !== postId))
    } catch (error) {
      console.error("Error deleting post:", error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/auth/login")
      }
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6">My Posts</h2>
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't posted anything yet.</p>
            <Button onClick={() => router.push("/community")} className="bg-blue-600 hover:bg-blue-700">
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">{post.content}</p>
                    
                    {/* Meta information */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Category: {post.category}</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>👍 {post.upvotes}</span>
                        <span>👎 {post.downvotes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button - only visible to post owner */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post._id)}
                    disabled={isDeleting === post._id}
                    className="ml-4"
                  >
                    {isDeleting === post._id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
