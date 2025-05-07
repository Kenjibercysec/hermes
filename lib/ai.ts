import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateTitleSuggestions(content: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate 3 engaging title suggestions for a newsletter with the following content:\n\n${content}\n\nReturn only the titles, separated by newlines.`,
      maxTokens: 100,
    })

    return text.trim().split("\n")
  } catch (error) {
    console.error("Error generating title suggestions:", error)
    return []
  }
}

export async function improveText(text: string) {
  try {
    const { text: improvedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Improve the following text by correcting grammar, enhancing clarity, and making it more engaging:\n\n${text}`,
      maxTokens: 1000,
    })

    return improvedText
  } catch (error) {
    console.error("Error improving text:", error)
    return text
  }
}

export async function categorizeNewsletter(content: string) {
  try {
    const { text: category } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Categorize the following newsletter content into one of these categories: Technology, Art, Politics, Lifestyle, Business, Science, Health, Education, Entertainment, Other.\n\n${content}\n\nReturn only the category name.`,
      maxTokens: 20,
    })

    return category.trim()
  } catch (error) {
    console.error("Error categorizing newsletter:", error)
    return "Other"
  }
}

export async function generateDailyNewspaper(newsletters: any[]) {
  try {
    const categorizedNewsletters = newsletters.reduce((acc, newsletter) => {
      const category = newsletter.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(newsletter)
      return acc
    }, {})

    const { text: summary } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a summary for today's newsletter digest with the following categories and counts: ${Object.entries(
        categorizedNewsletters,
      )
        .map(([category, items]) => `${category}: ${(items as any[]).length}`)
        .join(", ")}`,
      maxTokens: 200,
    })

    return {
      title: `Daily Digest - ${new Date().toLocaleDateString()}`,
      summary,
      categories: Object.entries(categorizedNewsletters).map(([category, items]) => ({
        name: category,
        newsletters: items,
      })),
    }
  } catch (error) {
    console.error("Error generating daily newspaper:", error)
    throw new Error("Failed to generate daily newspaper")
  }
}
