import { config } from "./config"

interface AIResponse {
  response: string
  model: string
  timestamp: string
  error?: string
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

class AIClient {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    console.log("🤖 Making AI request to OpenRouter...")
    console.log("📝 Request data:", JSON.stringify(data, null, 2))
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mindspace.v0.dev",
        "X-Title": "MindSpace AI Support",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        ...data,
      }),
    })

    console.log("📡 Response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ AI request failed:", response.status, errorText)
      throw new Error(`AI request failed: ${response.status} - ${errorText}`)
    }

    const responseData = await response.json()
    console.log("✅ AI request successful")
    return responseData
  }

  async getSupport(message: string): Promise<AIResponse> {
    try {
      const data = await this.makeRequest("", {
        messages: [
          {
            role: "system",
            content: `You are a compassionate AI companion providing emotional support for a mental health platform called MindSpace. Provide empathetic, supportive responses that validate feelings and offer gentle guidance. Never provide medical diagnoses or treatment advice.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return {
        response: data.choices[0].message.content,
        model: "deepseek-r1-0528",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        response:
          "I'm sorry, I'm having trouble connecting right now. Please know that your feelings are valid and you're not alone.",
        model: "fallback",
        error: "AI service temporarily unavailable",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async analyzeMood(text: string): Promise<{ analysis: MoodAnalysis }> {
    try {
      const data = await this.makeRequest("", {
        messages: [
          {
            role: "system",
            content: `Analyze the emotional tone and mood of the provided text. Return your analysis in JSON format with mood, emotions, intensity, concerns, supportive_notes, and confidence fields.`,
          },
          {
            role: "user",
            content: `Please analyze the mood and emotional content of this text: "${text}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
      })

      const analysis = JSON.parse(data.choices[0].message.content)
      return { analysis }
    } catch (error) {
      return {
        analysis: {
          mood: "neutral",
          emotions: ["unknown"],
          intensity: "medium",
          concerns: [],
          supportive_notes: "Analysis temporarily unavailable, but your feelings are valid.",
          confidence: 0,
        },
      }
    }
  }

  async getSuggestions(mood: string, context?: string): Promise<{ suggestions: Suggestions }> {
    try {
      const data = await this.makeRequest("", {
        messages: [
          {
            role: "system",
            content: `Provide personalized mental health and self-care suggestions based on the user's mood. Return suggestions in JSON format with immediate_actions, self_care, resources, and encouragement fields.`,
          },
          {
            role: "user",
            content: `Current mood: ${mood}${context ? `\nContext: ${context}` : ""}\n\nPlease provide personalized wellness suggestions.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      })

      const suggestions = JSON.parse(data.choices[0].message.content)
      return { suggestions }
    } catch (error) {
      return {
        suggestions: {
          immediate_actions: ["Take slow, deep breaths", "Ground yourself by noticing 5 things you can see"],
          self_care: ["Be gentle with yourself", "Consider doing something small that brings comfort"],
          resources: ["Consider reaching out to a mental health professional"],
          encouragement: "You're taking positive steps by seeking support.",
        },
      }
    }
  }
}

export const aiClient = new AIClient()
export type { AIResponse, MoodAnalysis, Suggestions }
