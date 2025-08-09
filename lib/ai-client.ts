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

interface Story {
  title: string
  content: string
  theme: string
  takeaway: string
  relatable_aspect: string
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
            content: `You are a compassionate AI psychologist providing professional therapeutic guidance on MindSpace, a mental health support platform. Respond like a licensed therapist who follows evidence-based practices.

RESPONSE STRUCTURE - Follow this format for every response:

🔍 ACKNOWLEDGMENT & VALIDATION (Start here):
• Acknowledge what the user is experiencing
• Validate their feelings without judgment
• Show you understand the difficulty of their situation

🧠 UNDERSTANDING THE PROBLEM:
• Gently explore and reflect back what you're hearing
• Help them identify patterns or underlying factors
• Normalize their experience when appropriate

💡 THERAPEUTIC GUIDANCE & SOLUTIONS:
• Provide specific, actionable coping strategies
• Suggest evidence-based techniques (CBT, mindfulness, etc.)
• Offer practical steps they can take immediately
• Include longer-term therapeutic approaches

💚 SUPPORTIVE ENCOURAGEMENT:
• Reinforce their strength in seeking help
• Provide hope and encouragement
• Invite further discussion

FORMAT: Use clear paragraphs with emojis and bullet points. Avoid markdown headers (##, **). Keep responses well-structured but visually clean for a chat interface.

THERAPEUTIC PRINCIPLES:
- Use therapeutic language and techniques
- Apply cognitive-behavioral, mindfulness, and humanistic approaches
- Focus on building coping skills and resilience
- Help users identify thought patterns and behaviors
- Encourage self-reflection and insight
- Never diagnose or prescribe medication
- Always recommend professional help for serious concerns
- Maintain professional boundaries while being warm and empathetic

TONE: Professional yet warm, like a skilled therapist who genuinely cares about their client's wellbeing.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

  async getStories(mood: string, context: string, userMessage: string): Promise<{ stories: Story[] }> {
    try {
      const data = await this.makeRequest("", {
        messages: [
          {
            role: "system",
            content: `You are a compassionate storyteller for a mental health support platform. Generate 1-2 short, POSITIVE and UPLIFTING stories (real or inspired by real events) about someone who overcame challenges similar to what the user is experiencing. Focus on stories of resilience, hope, growth, and positive outcomes. Each story should inspire and uplift the user, showing that things can get better. 

Return your response in this exact JSON format:
{
  "stories": [
    {
      "title": "Story Title",
      "content": "Story content here...",
      "theme": "theme name",
      "takeaway": "key takeaway message",
      "relatable_aspect": "what makes this relatable"
    }
  ]
}

Keep stories brief but meaningful and always end on a positive note.`,
          },
          {
            role: "user",
            content: `User's mood: ${mood}\nUser's message: "${userMessage}"\nContext: ${context}\n\nGenerate POSITIVE and UPLIFTING stories that inspire hope and show positive outcomes. Focus on resilience, growth, and overcoming challenges.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" },
      })

      const response = JSON.parse(data.choices[0].message.content)
      
      // Handle different response formats
      let storiesArray = []
      if (response.stories && Array.isArray(response.stories)) {
        storiesArray = response.stories
      } else if (Array.isArray(response)) {
        storiesArray = response
      } else if (response.title) {
        // Single story object
        storiesArray = [response]
      }
      
      return { stories: storiesArray }
    } catch (error) {
      return {
        stories: [
          {
            title: "Finding Light in the Darkness",
            content: "Emma was struggling with anxiety and felt completely alone. One day, she decided to join a small meditation group. At first, she was nervous, but the group welcomed her with open arms. Within weeks, she not only found peace but also discovered she had a gift for helping others. Today, she leads her own support group and helps people who feel just like she once did.",
            theme: "growth",
            takeaway: "Your struggles can become your strength and help others",
            relatable_aspect: "feeling anxious and finding community"
          },
          {
            title: "The Power of Small Steps",
            content: "Michael was overwhelmed with depression and couldn't see a way forward. His therapist suggested he start with just one small thing each day - making his bed. It seemed silly, but he tried it. One small step led to another, and within months, he was back to his hobbies, reconnected with friends, and even started a new career. He learned that recovery isn't about big leaps, but consistent small steps.",
            theme: "resilience",
            takeaway: "Small steps can lead to big changes",
            relatable_aspect: "feeling stuck and finding motivation"
          }
        ],
      }
    }
  }
}

export const aiClient = new AIClient()
export type { AIResponse, MoodAnalysis, Suggestions, Story }
