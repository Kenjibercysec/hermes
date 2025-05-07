import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { NewsletterCard } from "@/components/newsletter-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FeedPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get IDs of users that the current user follows
  const follows = await db.follow.findMany({
    where: {
      followerId: user.id,
    },
    select: {
      followingId: true,
    },
  })

  const followingIds = follows.map((follow) => follow.followingId)

  // Get newsletters from followed users
  const newsletters = await db.newsletter.findMany({
    where: {
      authorId: {
        in: followingIds.length > 0 ? followingIds : undefined,
      },
      published: true,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>

      {followingIds.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Start following some authors</h2>
          <p className="text-muted-foreground mb-4">Follow authors to see their newsletters in your feed</p>
          <Button asChild>
            <Link href="/discover">Discover Authors</Link>
          </Button>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No newsletters yet</h2>
          <p className="text-muted-foreground mb-4">The authors you follow haven't published any newsletters yet</p>
          <Button asChild>
            <Link href="/discover">Discover More Authors</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((newsletter) => (
            <NewsletterCard key={newsletter.id} newsletter={newsletter} />
          ))}
        </div>
      )}
    </div>
  )
}
