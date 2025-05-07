import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface NewsletterCardProps {
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
}

export function NewsletterCard({ newsletter }: NewsletterCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        {newsletter.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-md mb-4">
            <img
              src={newsletter.imageUrl || "/placeholder.svg?height=200&width=400"}
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
        <Link href={`/profile/${newsletter.author.id}`} className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={newsletter.author.image || ""} alt={newsletter.author.name || ""} />
            <AvatarFallback>{newsletter.author.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{newsletter.author.name}</span>
        </Link>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(newsletter.createdAt), { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  )
}
