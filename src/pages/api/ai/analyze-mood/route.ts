import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required for mood analysis" }, { status: 400 })
    }

    const result = await aiClient.analyzeMood(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Mood analysis error:", error)
    return NextResponse.json(
      {
        analysis: {
          mood: "neutral",
          emotions: ["unknown"],
          intensity: "medium",
          concerns: [],
          supportive_notes: "I'm here to support you, even when technical issues arise.",
          confidence: 0,
        },
        model: "fallback",
        error: "Mood analysis service temporarily unavailable",
      },
      { status: 200 },
    )
  }
}
