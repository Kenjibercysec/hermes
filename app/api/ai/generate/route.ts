import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { prompt, type } = await req.json()

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 })
    }

    let systemPrompt = ""
    let userPrompt = ""

    switch (type) {
      case "title":
        systemPrompt = "You are a newsletter title generator. Generate an engaging and descriptive title for a newsletter based on the given content or topic."
        userPrompt = `Generate a newsletter title for: ${prompt}`
        break
      case "content":
        systemPrompt = "You are a newsletter content writer. Generate engaging and informative newsletter content based on the given title or topic."
        userPrompt = `Generate newsletter content for: ${prompt}`
        break
      case "improve":
        systemPrompt = "You are a newsletter content editor. Improve the given newsletter content by enhancing its clarity, engagement, and overall quality while maintaining its core message."
        userPrompt = `Improve this newsletter content: ${prompt}`
        break
      default:
        return new NextResponse("Invalid type", { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "gpt-3.5-turbo",
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      return new NextResponse("Failed to generate content", { status: 500 })
    }

    return NextResponse.json({ content: generatedContent })
  } catch (error) {
    console.error("[AI_GENERATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 