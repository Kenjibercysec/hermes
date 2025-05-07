import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsletterCard } from "@/components/newsletter-card"
import { format } from "date-fns"

interface DailyNewspaperProps {
  newspaper: {
    id: string
    date: Date
    title: string
    summary: string
    imageUrl: string | null
    items: Array<{
      id: string
      category: string
      highlight: boolean
      summary: string
      newsletter: {
        id: string
        title: string
        subtitle: string | null
        content: string
        imageUrl: string | null
        createdAt: Date
        author: {
          id: string
          name: string | null
          image: string | null
        }
      }
    }>
  }
}

export function DailyNewspaper({ newspaper }: DailyNewspaperProps) {
  // Group items by category
  const categories = newspaper.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof newspaper.items>,
  )

  // Get highlights
  const highlights = newspaper.items.filter((item) => item.highlight)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-2xl font-bold">{newspaper.title}</h2>
          <p className="text-muted-foreground">{format(new Date(newspaper.date), "EEEE, MMMM d, yyyy")}</p>
        </CardHeader>
        <CardContent>
          <p>{newspaper.summary}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="highlights">
        <TabsList className="mb-4">
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
          {Object.keys(categories).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="highlights">
          {highlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((item) => (
                <div key={item.id} className="space-y-2">
                  <NewsletterCard newsletter={item.newsletter} />
                  <p className="text-sm text-muted-foreground px-4">{item.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No highlights available for today.</p>
          )}
        </TabsContent>

        {Object.entries(categories).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <NewsletterCard newsletter={item.newsletter} />
                  <p className="text-sm text-muted-foreground px-4">{item.summary}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
