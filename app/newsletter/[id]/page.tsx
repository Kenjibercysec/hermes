import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { NewsletterDetail } from "@/components/newsletter-detail"

interface NewsletterPageProps {
  params: {
    id: string
  }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const currentUser = await getCurrentUser()

  // Get the newsletter
  const newsletter = await db.newsletter.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
    },
  })

  if (!newsletter) {
    notFound()
  }

  // If the newsletter is not published, only the author or an admin can view it
  if (
    !newsletter.published &&
    (!currentUser || (currentUser.id !== newsletter.author.id && currentUser.role !== "ADMIN"))
  ) {
    notFound()
  }

  // Check if the current user is following the author
  let isFollowing = false

  if (currentUser && currentUser.id !== newsletter.author.id) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: newsletter.author.id,
        },
      },
    })

    isFollowing = !!follow
  }

  return (
    <div className="container py-8">
      <NewsletterDetail newsletter={newsletter} currentUser={currentUser} isFollowing={isFollowing} />
    </div>
  )
}
