"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, Send, Bot, User, ArrowLeft, Lightbulb, Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AIResponseFormatter } from "@/components/AIResponseFormatter"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  model?: string
}

interface MoodAnalysis {
  mood: string
  emotions: string[]
  intensity: string
  concerns: string[]
  supportive_notes: string
  confidence: number
}

interface Suggestions {
  immediate_actions: string[]
  self_care: string[]
  resources: string[]
  encouragement: string
}

interface Story {
  title: string
  content: string
  theme: string
  takeaway: string
  relatable_aspect: string
}

export default function AISupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm here to listen and support you with empathy and understanding. This is a safe, private space where you can share what's on your mind. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
      model: "deepseek-r1-0528",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [stories, setStories] = useState<Story[]>([])
  const [showStories, setShowStories] = useState(false)
  const [storiesError, setStoriesError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const analyzeMood = async (text: string) => {
    try {
      const response = await fetch("/api/ai/analyze-mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text,
          context: "Mental health support conversation",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentMood(data.analysis)

        // Get suggestions and stories based on mood
        if (data.analysis.mood !== "neutral") {
          getSuggestions(data.analysis.mood, text)
          getStories(data.analysis.mood, text)
        } else {
          // Even for neutral mood, we can provide general uplifting stories
          getStories("neutral", text)
        }
      }
    } catch (error) {
      console.error("Mood analysis failed:", error)
    }
  }

  const getSuggestions = async (mood: string, context: string) => {
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          mood,
          context,
          userPreferences: {
            supportType: "peer-support",
            platform: "mental-health",
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    }
  }

  const getStories = async (mood: string, context: string) => {
    try {
      setStoriesError(null)
      console.log("📖 Fetching stories for mood:", mood)
      const response = await fetch("/api/ai/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          mood,
          context,
          userMessage: context,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("📖 Stories received:", data.stories?.length || 0)
        
        if (data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
          setStories(data.stories)
          setStoriesError(null)
        } else {
          console.warn("⚠️ No stories returned or invalid format:", data)
          setStoriesError("No stories available at the moment")
        }
      } else {
        console.error("❌ Stories request failed:", response.status)
        setStoriesError("Failed to load stories")
      }
    } catch (error) {
      console.error("❌ Failed to get stories:", error)
      setStoriesError("Unable to connect to stories service")
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToAnalyze = inputMessage
    setInputMessage("")
    setIsLoading(true)

    // Analyze mood in parallel
    analyzeMood(messageToAnalyze)

    try {
      const response = await fetch("/api/ai/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: messageToAnalyze }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
          model: data.model,
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error("Failed to get AI response")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment. Remember, if you're in crisis, please reach out to a mental health professional or crisis hotline immediately.",
        sender: "ai",
        timestamp: new Date(),
        model: "fallback",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "very-positive":
        return "bg-green-100 text-green-800"
      case "positive":
        return "bg-green-50 text-green-700"
      case "neutral":
        return "bg-gray-100 text-gray-700"
      case "negative":
        return "bg-orange-100 text-orange-800"
      case "very-negative":
        return "bg-red-100 text-red-800"
      case "mixed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">AI Emotional Support</h1>
                <Badge variant="secondary" className="text-xs hidden sm:inline">
                  Powered by DeepSeek R1
                </Badge>
              </div>
            </div>

            {currentMood && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <Badge className={`${getMoodColor(currentMood.mood)} text-xs`}>
                    {currentMood.mood.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  {suggestions && (
                    <Button 
                      variant={showSuggestions ? "default" : "outline"} 
                      size="sm" 
                      className="text-xs px-2 sm:px-3"
                      onClick={() => {
                        if (showSuggestions) {
                          setShowSuggestions(false)
                        } else {
                          setShowSuggestions(true)
                          setShowStories(false)
                        }
                      }}
                    >
                      <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Suggestions</span>
                      <span className="sm:hidden">Tips</span>
                    </Button>
                  )}
                  <Button 
                    variant={showStories ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs px-2 sm:px-3"
                    onClick={() => {
                      if (showStories) {
                        setShowStories(false)
                      } else {
                        setShowStories(true)
                        setShowSuggestions(false)
                        // If no stories loaded yet, try to load some
                        if (stories.length === 0 && currentMood) {
                          getStories(currentMood.mood, "Seeking inspiration and hope")
                        }
                      }
                    }}
                  >
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Stories ({stories.length})</span>
                    <span className="sm:hidden">Tales</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Bot className="h-5 w-5" />
                  <span>Your AI Companion</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enhanced with DeepSeek R1 for more empathetic and understanding responses
                </p>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "ai" && <Bot className="h-4 w-4 mt-1 text-blue-600" />}
                        {message.sender === "user" && <User className="h-4 w-4 mt-1" />}
                        <div className="flex-1">
                          {message.sender === "ai" ? (
                            <AIResponseFormatter content={message.content} />
                          ) : (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <time
                              className={`text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                              suppressHydrationWarning
                            >
                              {isClient ? message.timestamp.toLocaleTimeString() : ""}
                            </time>
                            {message.model && (
                              <Badge variant="outline" className="text-xs">
                                {message.model}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[85%] sm:max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-3 sm:p-4">
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="flex-1 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">
                  Press Enter to send. Enhanced AI provides emotional support, not medical advice.
                </p>
              </div>
            </Card>
          </div>

          {/* Suggestions Sidebar */}
          {showSuggestions && suggestions && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-white z-10">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Wellness Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  {suggestions.immediate_actions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Right Now</h4>
                      <ul className="space-y-1">
                        {suggestions.immediate_actions.map((action, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.self_care.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Self-Care</h4>
                      <ul className="space-y-1">
                        {suggestions.self_care.map((care, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{care}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.resources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Resources</h4>
                      <ul className="space-y-1">
                        {suggestions.resources.map((resource, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.encouragement && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-800 italic">{suggestions.encouragement}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stories Sidebar */}
          {showStories && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-white z-10">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Relatable Stories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  {stories.length > 0 ? (
                    stories.map((story, index) => (
                      <div key={index} className="border-l-4 border-purple-200 pl-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">{story.title}</h4>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">{story.content}</p>
                        <div className="text-xs text-purple-600 font-medium mb-1">
                          Takeaway: {story.takeaway}
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          Relates to: {story.relatable_aspect}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <Heart className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      {storiesError ? (
                        <div>
                          <p className="text-red-500">{storiesError}</p>
                          <p className="text-xs mt-2">Try refreshing or sending another message</p>
                        </div>
                      ) : (
                        <div>
                          <p>Loading inspirational stories...</p>
                          <p className="text-xs mt-2">Stories of hope and resilience will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
