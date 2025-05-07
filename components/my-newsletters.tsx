"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface MyNewslettersProps {
  newsletters: Array<{
    id: string
    title: string
    subtitle: string | null
    content: string
    imageUrl: string | null
    published: boolean
    scheduledFor: Date | null
    createdAt: Date
  }>
}

export function MyNewsletters({ newsletters }: MyNewslettersProps) {
  const [newsletterList, setNewsletterList] = useState(newsletters)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const publishedNewsletters = newsletterList.filter((newsletter) => newsletter.published)
  const draftNewsletters = newsletterList.filter((newsletter) => !newsletter.published)

  async function deleteNewsletter(id: string) {
    setIsDeleting(id)

    try {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete newsletter")
      }

      setNewsletterList(newsletterList.filter((newsletter) => newsletter.id !== id))

      toast({
        title: "Newsletter deleted",
        description: "Your newsletter has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="published" className="w-full">
          <TabsList>
            <TabsTrigger value="published">Published ({publishedNewsletters.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftNewsletters.length})</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Button asChild>
              <Link href="/create">Create New Newsletter</Link>
            </Button>
          </div>

          <TabsContent value="published" className="mt-6">
            {publishedNewsletters.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No published newsletters</h2>
                <p className="text-muted-foreground mb-4">You haven't published any newsletters yet</p>
                <Button asChild>
                  <Link href="/create">Create Your First Newsletter</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedNewsletters.map((newsletter) => (
                  <Card key={newsletter.id} className="flex flex-col h-full">
                    <CardHeader className="p-4">
                      {newsletter.imageUrl && (
                        <div className="aspect-video overflow-hidden rounded-md mb-4">
                          <img
                            src={newsletter.imageUrl || "/placeholder.svg"}
                            alt={newsletter.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Link href={`/newsletter/${newsletter.id}`} className="hover:underline">
                        <h3 className="text-xl font-semibold">{newsletter.title}</h3>
                      </Link>
                      {newsletter.subtitle && <p className="text-muted-foreground">{newsletter.subtitle}</p>}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1">
                      <p className="line-clamp-3 text-muted-foreground">{newsletter.content.substring(0, 150)}...</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(newsletter.createdAt), "MMM d, yyyy")}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit/${newsletter.id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteNewsletter(newsletter.id)}
                          disabled={isDeleting === newsletter.id}
                        >
                          {isDeleting === newsletter.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            {draftNewsletters.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No draft newsletters</h2>
                <p className="text-muted-foreground mb-4">You don't have any drafts saved</p>
                <Button asChild>
                  <Link href="/create">Create a Newsletter</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftNewsletters.map((newsletter) => (
                  <Card key={newsletter.id} className="flex flex-col h-full">
                    <CardHeader className="p-4">
                      {newsletter.imageUrl && (
                        <div className="aspect-video overflow-hidden rounded-md mb-4">
                          <img
                            src={newsletter.imageUrl || "/placeholder.svg"}
                            alt={newsletter.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">{newsletter.title}</h3>
                      {newsletter.subtitle && <p className="text-muted-foreground">{newsletter.subtitle}</p>}
                      {newsletter.scheduledFor && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Scheduled for {format(new Date(newsletter.scheduledFor), "MMM d, yyyy")}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1">
                      <p className="line-clamp-3 text-muted-foreground">{newsletter.content.substring(0, 150)}...</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(newsletter.createdAt), "MMM d, yyyy")}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit/${newsletter.id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteNewsletter(newsletter.id)}
                          disabled={isDeleting === newsletter.id}
                        >
                          {isDeleting === newsletter.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
