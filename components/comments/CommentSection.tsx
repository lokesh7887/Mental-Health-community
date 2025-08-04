"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

interface Comment {
  _id: string
  content: string
  authorName: string
  createdAt: string
  upvotes: number
  downvotes: number
}

interface CommentSectionProps {
  postId: string
  initialComments?: Comment[]
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in to view comments")
          return
        }

        const response = await axios.get(`/api/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setComments(response.data.comments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        setError("Failed to load comments")
      }
    }

    fetchComments()
  }, [postId])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      setError("")
      
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await axios.post(
        `/api/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      setComments((prev) => [response.data.comment, ...prev])
      setNewComment("")
    } catch (error: any) {
      console.error("Error posting comment:", error)
      setError(error.response?.data?.error || "Failed to post comment")
      if (error.response?.status === 401) {
        router.push("/auth/login")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button 
          onClick={handleSubmitComment} 
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            "Posting..."
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Post Comment
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-2">{comment.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>{comment.authorName}</span>
              <span className="mx-2">•</span>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}