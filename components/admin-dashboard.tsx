"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  userCount: number
  newsletterCount: number
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    createdAt: Date
  }>
  recentNewsletters: Array<{
    id: string
    title: string
    published: boolean
    createdAt: Date
    author: {
      id: string
      name: string | null
      email: string
    }
  }>
}

export function AdminDashboard({ userCount, newsletterCount, recentUsers, recentNewsletters }: AdminDashboardProps) {
  const [isGeneratingNewspaper, setIsGeneratingNewspaper] = useState(false)
  const { toast } = useToast()

  async function generateDailyNewspaper() {
    setIsGeneratingNewspaper(true)

    try {
      const response = await fetch("/api/admin/generate-newspaper", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate newspaper")
      }

      toast({
        title: "Newspaper generated",
        description: "The daily newspaper has been generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingNewspaper(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Newsletters</CardTitle>
            <CardDescription>Number of newsletters created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newsletterCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Daily Newspaper</CardTitle>
            <CardDescription>Generate today's newspaper</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateDailyNewspaper} disabled={isGeneratingNewspaper} className="w-full">
              {isGeneratingNewspaper ? "Generating..." : "Generate Now"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="newsletters">Recent Newsletters</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>The newest members of the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || "Unnamed User"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletters">
          <Card>
            <CardHeader>
              <CardTitle>Recent Newsletters</CardTitle>
              <CardDescription>The latest newsletters created on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNewsletters.map((newsletter) => (
                  <div key={newsletter.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{newsletter.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By {newsletter.author.name || newsletter.author.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          newsletter.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {newsletter.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(newsletter.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
