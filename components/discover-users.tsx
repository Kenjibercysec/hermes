"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DiscoverUsersProps {
  users: Array<{
    id: string
    name: string | null
    image: string | null
    bio: string | null
    _count: {
      followers: number
      newsletters: number
    }
  }>
  followingIds: string[]
  currentUserId: string
}

export function DiscoverUsers({ users, followingIds, currentUserId }: DiscoverUsersProps) {
  const [following, setFollowing] = useState<Record<string, boolean>>(
    followingIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
  )
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  async function toggleFollow(userId: string) {
    if (userId === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot follow yourself",
        variant: "destructive",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: userId,
          action: following[userId] ? "unfollow" : "follow",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setFollowing((prev) => ({ ...prev, [userId]: !prev[userId] }))

      toast({
        title: following[userId] ? "Unfollowed" : "Following",
        description: following[userId] ? "You have unfollowed this user" : "You are now following this user",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <Card key={user.id} className="flex flex-col h-full">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${user.id}`} className="font-medium hover:underline">
                  {user.name || "Unnamed User"}
                </Link>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{user._count.followers} followers</span>
                  <span>{user._count.newsletters} newsletters</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1">
            {user.bio ? (
              <p className="text-sm text-muted-foreground line-clamp-3">{user.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No bio available</p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/profile/${user.id}`}>View Profile</Link>
            </Button>
            <Button
              size="sm"
              variant={following[user.id] ? "outline" : "default"}
              onClick={() => toggleFollow(user.id)}
              disabled={isLoading[user.id]}
            >
              {isLoading[user.id] ? "Loading..." : following[user.id] ? "Unfollow" : "Follow"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
