"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface NewsletterDetailProps {
  newsletter: {
    id: string
    title: string
    subtitle: string | null
    content: string
    imageUrl: string | null
    published: boolean
    createdAt: Date
    author: {
      id: string
      name: string | null
      email: string
      image: string | null
      bio: string | null
    }
  }
  currentUser: {
    id: string
    name: string | null
    email: string
    role?: string
  } | null
  isFollowing: boolean
}

export function NewsletterDetail({ newsletter, currentUser, isFollowing }: NewsletterDetailProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function toggleFollow() {
    if (!currentUser) {
      router.push("/sign-in")
      return
    }

    if (currentUser.id === newsletter.author.id) {
      toast({
        title: "Error",
        description: "You cannot follow yourself",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: newsletter.author.id,
          action: following ? "unfollow" : "follow",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setFollowing(!following)

      toast({
        title: following ? "Unfollowed" : "Following",
        description: following
          ? `You have unfollowed ${newsletter.author.name || "this user"}`
          : `You are now following ${newsletter.author.name || "this user"}`,
      })
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/profile/${newsletter.author.id}`} className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={newsletter.author.image || ""} alt={newsletter.author.name || ""} />
              <AvatarFallback>{newsletter.author.name?.[0] || newsletter.author.email[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{newsletter.author.name || "Unnamed User"}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(newsletter.createdAt), "MMMM d, yyyy")}</p>
            </div>
          </Link>

          {currentUser && currentUser.id !== newsletter.author.id && (
            <Button onClick={toggleFollow} variant={following ? "outline" : "default"} disabled={isLoading}>
              {isLoading ? "Loading..." : following ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{newsletter.title}</h1>
        {newsletter.subtitle && <p className="text-xl text-muted-foreground mb-4">{newsletter.subtitle}</p>}

        {newsletter.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-lg mb-6">
            <img
              src={newsletter.imageUrl || "/placeholder.svg?height=400&width=800"}
              alt={newsletter.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {newsletter.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}
