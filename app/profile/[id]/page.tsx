import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { UserProfile } from "@/components/user-profile"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const currentUser = await getCurrentUser()

  // Get the profile user
  const profileUser = await db.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      customLink: true,
      createdAt: true,
    },
  })

  if (!profileUser) {
    notFound()
  }

  // Get the user's newsletters
  const newsletters = await db.newsletter.findMany({
    where: {
      authorId: profileUser.id,
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Check if the current user is following this profile
  let isFollowing = false

  if (currentUser) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: profileUser.id,
        },
      },
    })

    isFollowing = !!follow
  }

  // Get follower and following counts
  const followerCount = await db.follow.count({
    where: {
      followingId: profileUser.id,
    },
  })

  const followingCount = await db.follow.count({
    where: {
      followerId: profileUser.id,
    },
  })

  return (
    <div className="container py-8">
      <UserProfile
        profileUser={profileUser}
        newsletters={newsletters}
        isFollowing={isFollowing}
        followerCount={followerCount}
        followingCount={followingCount}
        currentUser={currentUser}
      />
    </div>
  )
}
