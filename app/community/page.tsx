"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Plus, MessageCircle, ArrowUp, ArrowDown, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CommentSection } from "@/components/comments/CommentSection"

// Update the Post interface to include author ID
interface Post {
  _id: string
  title: string
  content: string
  author: string // This is the author ID
  authorName: string
  category: string
  upvotes: number
  downvotes: number
  comments: number
  createdAt: string
  tags: string[]
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"new" | "top">("top")
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
    }
  }, [router])

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/posts")
        setPosts(response.data.posts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "/api/posts",
        {
          title: newPost.title,
          content: newPost.content,
          category: "discussion", // You might want to add category selection in the UI
          tags: newPost.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setPosts((prev) => [response.data.post, ...prev])
      setNewPost({ title: "", content: "", tags: "" })
      setShowCreatePost(false)
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const handleVote = async (postId: string, type: "up" | "down") => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `/api/posts/${postId}/vote`,
        { type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? response.data.post : post
        )
      )
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      setIsDeleting(postId)
      const token = localStorage.getItem("token")
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

  // Add this function to check if the current user is the post owner
  const isPostOwner = (post: Post) => {
    const token = localStorage.getItem("token")
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.id === post.author
    } catch {
      return false
    }
  }

  const filteredPosts = posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      }
    })

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-800">Community Forum</h1>
            </div>
          </div>
          <Button onClick={() => setShowCreatePost(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant={sortBy === "top" ? "default" : "outline"} onClick={() => setSortBy("top")} size="sm">
              Top
            </Button>
            <Button variant={sortBy === "new" ? "default" : "outline"} onClick={() => setSortBy("new")} size="sm">
              New
            </Button>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card className="mb-6 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Share with the Community</CardTitle>
              <CardDescription>
                Your post will be anonymous and help others who might be going through similar experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="Share your thoughts, experiences, or questions..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
              <Input
                placeholder="Tags (comma-separated, e.g., anxiety, support, coping)"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
              <div className="flex space-x-2">
                <Button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700">
                  Post
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Add this near the top of the card content */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    {/* ...existing title/author content... */}
                  </div>
                  {isPostOwner(post) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post._id)}
                      disabled={isDeleting === post._id}
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
                  )}
                </div>
                <div className="flex space-x-4">
                  {/* Voting */}
                  <div className="flex flex-col items-center space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(post._id, "up")}
                      className="p-1 h-8 w-8 hover:bg-green-100"
                    >
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </Button>
                    <span className="text-sm font-medium text-gray-700">{post.upvotes - post.downvotes}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(post._id, "down")}
                      className="p-1 h-8 w-8 hover:bg-red-100"
                    >
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">{post.content}</p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>by {post.authorName}</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add this at the bottom of the CardContent */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {expandedPost === post._id ? "Hide Comments" : "Show Comments"}
                  </Button>

                  {expandedPost === post._id && (
                    <div className="mt-4">
                      <CommentSection postId={post._id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts found matching your search.</p>
              <Button onClick={() => setShowCreatePost(true)} className="bg-purple-600 hover:bg-purple-700">
                Be the first to post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
