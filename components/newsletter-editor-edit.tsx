"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/blob"

const newsletterSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  category: z.string().optional(),
  published: z.boolean().default(false),
  scheduledFor: z.date().optional(),
})

const categories = [
  "Technology",
  "Art",
  "Politics",
  "Lifestyle",
  "Business",
  "Science",
  "Health",
  "Education",
  "Entertainment",
  "Other",
]

interface NewsletterEditorProps {
  user: {
    id: string
    name: string | null
    email: string
  }
  newsletter?: {
    id: string
    title: string
    subtitle: string | null
    content: string
    imageUrl: string | null
    category: string | null
    published: boolean
    scheduledFor: Date | null
  }
  isEditing?: boolean
}

export function NewsletterEditor({ user, newsletter, isEditing = false }: NewsletterEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(newsletter?.imageUrl || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: newsletter?.title || "",
      subtitle: newsletter?.subtitle || "",
      content: newsletter?.content || "",
      category: newsletter?.category || "Other",
      published: newsletter?.published || false,
      scheduledFor: newsletter?.scheduledFor || undefined,
    },
  })

  const content = form.watch("content")

  async function generateTitleSuggestions() {
    if (content.length < 50) {
      toast({
        title: "Not enough content",
        description: "Please write at least 50 characters to generate title suggestions",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingTitles(true)

    try {
      const response = await fetch("/api/ai/generate-titles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate title suggestions")
      }

      setTitleSuggestions(data.titles)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTitles(false)
    }
  }

  function selectTitle(title: string) {
    form.setValue("title", title)
    setTitleSuggestions([])
  }

  async function improveText() {
    if (content.length < 50) {
      toast({
        title: "Not enough content",
        description: "Please write at least 50 characters to improve",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/improve-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to improve text")
      }

      form.setValue("content", data.improvedText)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      const url = await uploadImage(file)
      setImageUrl(url)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function onSubmit(values: z.infer<typeof newsletterSchema>) {
    setIsLoading(true)

    try {
      const endpoint = isEditing ? `/api/newsletters/${newsletter?.id}` : "/api/newsletters"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          imageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "create"} newsletter`)
      }

      toast({
        title: isEditing ? "Newsletter updated" : "Newsletter created",
        description: values.published
          ? "Your newsletter has been published"
          : "Your newsletter has been saved as a draft",
      })

      router.push("/my-newsletters")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your newsletter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateTitleSuggestions}
                  disabled={isGeneratingTitles || content.length < 50}
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>

              {titleSuggestions.length > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">Title suggestions:</p>
                  <div className="space-y-2">
                    {titleSuggestions.map((title, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => selectTitle(title)}
                      >
                        {title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a subtitle" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Textarea
                          placeholder="Write your newsletter content here..."
                          className="min-h-[300px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={improveText}
                        disabled={isLoading || content.length < 50}
                      >
                        Improve
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:w-64 space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "Other"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publish immediately</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        If unchecked, your newsletter will be saved as a draft
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Schedule for later (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Cover Image (optional)</FormLabel>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {imageUrl && (
                    <div className="mt-2 relative">
                      <img
                        src={imageUrl || "/placeholder.svg?height=200&width=400"}
                        alt="Cover"
                        className="w-full h-auto rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImageUrl(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/my-newsletters")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Newsletter" : "Save Newsletter"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
