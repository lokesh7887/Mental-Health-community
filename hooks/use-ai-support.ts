"use client"

import { useState, useCallback } from "react"

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

export function useAISupport() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        // Get AI response
        const aiResponse = await fetch("/api/ai/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })

        const aiData = await aiResponse.json()

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiData.response,
          sender: "ai",
          timestamp: new Date(),
          model: aiData.model,
        }

        setMessages((prev) => [...prev, aiMessage])

        // Analyze mood in parallel
        try {
          const moodResponse = await fetch("/api/ai/analyze-mood", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: content }),
          })
          const moodData = await moodResponse.json()
          setCurrentMood(moodData.analysis)

          // Get suggestions if mood is not neutral
          if (moodData.analysis.mood !== "neutral") {
            const suggestionsResponse = await fetch("/api/ai/suggestions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mood: moodData.analysis.mood, context: content }),
            })
            const suggestionsData = await suggestionsResponse.json()
            setSuggestions(suggestionsData.suggestions)
          }
        } catch (moodError) {
          console.error("Mood analysis failed:", moodError)
        }
      } catch (error) {
        console.error("AI support failed:", error)

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
    },
    [isLoading],
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setCurrentMood(null)
    setSuggestions(null)
  }, [])

  return {
    messages,
    isLoading,
    currentMood,
    suggestions,
    sendMessage,
    clearConversation,
  }
}
