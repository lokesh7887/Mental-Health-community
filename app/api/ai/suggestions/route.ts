import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const { mood, context } = await request.json()

    if (!mood) {
      return NextResponse.json({ error: "Mood is required for suggestions" }, { status: 400 })
    }

    const result = await aiClient.getSuggestions(mood, context)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Suggestions error:", error)
    return NextResponse.json(
      {
        suggestions: {
          immediate_actions: ["Take slow, deep breaths", "Ground yourself by noticing 5 things you can see"],
          self_care: ["Be gentle with yourself", "Consider doing something small that brings comfort"],
          resources: ["Consider reaching out to a mental health professional"],
          encouragement: "You're taking positive steps by seeking support.",
        },
        model: "fallback",
        error: "Suggestions service temporarily unavailable",
      },
      { status: 200 },
    )
  }
}
