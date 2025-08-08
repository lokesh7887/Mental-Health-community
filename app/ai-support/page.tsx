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

        // Get suggestions based on mood
        if (data.analysis.mood !== "neutral") {
          getSuggestions(data.analysis.mood, text)
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">AI Emotional Support</h1>
              <Badge variant="secondary" className="text-xs">
                Powered by DeepSeek R1
              </Badge>
            </div>
          </div>

          {currentMood && (
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <Badge className={getMoodColor(currentMood.mood)}>{currentMood.mood.replace("-", " ")}</Badge>
              {suggestions && (
                <Button variant="outline" size="sm" onClick={() => setShowSuggestions(!showSuggestions)}>
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Suggestions
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Bot className="h-5 w-5" />
                  <span>Your AI Companion</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Enhanced with DeepSeek R1 for more empathetic and understanding responses
                </p>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "ai" && <Bot className="h-4 w-4 mt-1 text-blue-600" />}
                        {message.sender === "user" && <User className="h-4 w-4 mt-1" />}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
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

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send. Enhanced AI provides emotional support, not medical advice.
                </p>
              </div>
            </Card>
          </div>

          {/* Suggestions Sidebar */}
          {showSuggestions && suggestions && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Wellness Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}
