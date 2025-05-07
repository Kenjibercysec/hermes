import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DiscoverUsers } from "@/components/discover-users"

export default async function DiscoverPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get users with the most followers
  const popularUsers = await db.user.findMany({
    where: {
      id: {
        not: user.id,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      _count: {
        select: {
          followers: true,
          newsletters: true,
        },
      },
    },
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    take: 20,
  })

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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Users</h1>
      <DiscoverUsers users={popularUsers} followingIds={followingIds} currentUserId={user.id} />
    </div>
  )
}
