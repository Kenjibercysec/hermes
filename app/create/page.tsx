"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import MDEditor from "@uiw/react-md-editor"
import { Loader2 } from "lucide-react"

export default function CreateNewsletterPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const generateWithAI = async (type: "title" | "content" | "improve") => {
    try {
      setIsGenerating(true)
      const prompt = type === "improve" ? content : title

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate content")
      }

      if (type === "title") {
        setTitle(data.content)
      } else {
        setContent(data.content)
      }

      toast({
        title: "Success",
        description: "Content generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create newsletter")
      }

      toast({
        title: "Success",
        description: "Newsletter created successfully",
      })

      router.push("/my-newsletters")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create newsletter",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Newsletter</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Newsletter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => generateWithAI("title")}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Title"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-end mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => generateWithAI("content")}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Content"}
              </Button>
            </div>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(value) => setContent(value || "")}
                height={400}
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => generateWithAI("improve")}
                disabled={isGenerating || !content}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Improve Content"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Newsletter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
