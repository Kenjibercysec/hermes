"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsletterCard } from "@/components/newsletter-card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
  profileUser: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    customLink: string | null
    createdAt: Date
  }
  newsletters: Array<{
    id: string
    title: string
    subtitle: string | null
    content: string
    imageUrl: string | null
    createdAt: Date
  }>
  isFollowing: boolean
  followerCount: number
  followingCount: number
  currentUser: {
    id: string
    name: string | null
    email: string
  } | null
}

export function UserProfile({
  profileUser,
  newsletters,
  isFollowing,
  followerCount,
  followingCount,
  currentUser,
}: UserProfileProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [followerCountState, setFollowerCountState] = useState(followerCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function toggleFollow() {
    if (!currentUser) {
      router.push("/sign-in")
      return
    }

    if (currentUser.id === profileUser.id) {
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
          followingId: profileUser.id,
          action: following ? "unfollow" : "follow",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setFollowing(!following)
      setFollowerCountState(following ? followerCountState - 1 : followerCountState + 1)

      toast({
        title: following ? "Unfollowed" : "Following",
        description: following
          ? `You have unfollowed ${profileUser.name || "this user"}`
          : `You are now following ${profileUser.name || "this user"}`,
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
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileUser.image || ""} alt={profileUser.name || ""} />
              <AvatarFallback className="text-2xl">{profileUser.name?.[0] || profileUser.email[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">{profileUser.name || "Unnamed User"}</h1>
                {currentUser && currentUser.id !== profileUser.id && (
                  <Button onClick={toggleFollow} variant={following ? "outline" : "default"} disabled={isLoading}>
                    {isLoading ? "Loading..." : following ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>

              {profileUser.bio && <p className="text-muted-foreground">{profileUser.bio}</p>}

              {profileUser.customLink && (
                <a
                  href={
                    profileUser.customLink.startsWith("http")
                      ? profileUser.customLink
                      : `https://${profileUser.customLink}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profileUser.customLink}
                </a>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Joined {format(new Date(profileUser.createdAt), "MMMM yyyy")}</span>
                <span>{followerCountState} followers</span>
                <span>{followingCount} following</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="newsletters">
        <TabsList>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
        </TabsList>

        <TabsContent value="newsletters">
          {newsletters.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No newsletters yet</h2>
              <p className="text-muted-foreground">
                {currentUser && currentUser.id === profileUser.id
                  ? "You haven't published any newsletters yet"
                  : `${profileUser.name || "This user"} hasn't published any newsletters yet`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((newsletter) => (
                <NewsletterCard
                  key={newsletter.id}
                  newsletter={{
                    ...newsletter,
                    author: {
                      id: profileUser.id,
                      name: profileUser.name,
                      image: profileUser.image,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
