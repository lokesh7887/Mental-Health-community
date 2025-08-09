import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    console.log("📖 Stories request received")
    const { mood, context, userMessage } = await request.json()

    if (!mood || !context) {
      console.log("❌ Missing mood or context")
      return NextResponse.json({ error: "Mood and context are required" }, { status: 400 })
    }

    console.log("📝 Generating stories for mood:", mood, "context:", context)
    const response = await aiClient.getStories(mood, context, userMessage)
    console.log("✅ Stories generated:", response.stories?.length || 0)
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Stories generation error:", error)
    return NextResponse.json(
      {
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
        error: "Stories service temporarily unavailable",
      },
      { status: 200 },
    )
  }
}
