import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 AI Support request received")
    const { message } = await request.json()

    if (!message) {
      console.log("❌ No message provided")
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("📝 Processing message:", message)
    const response = await aiClient.getSupport(message)
    console.log("✅ AI response generated:", response.model)
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ AI Support error:", error)
    return NextResponse.json(
      {
        response:
          "I'm sorry, I'm having trouble connecting right now. Please know that your feelings are valid and you're not alone.",
        model: "fallback",
        error: "AI service temporarily unavailable",
      },
      { status: 200 },
    )
  }
}
