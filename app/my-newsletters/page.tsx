import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { MyNewsletters } from "@/components/my-newsletters"

export default async function MyNewslettersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get user's newsletters
  const newsletters = await db.newsletter.findMany({
    where: {
      authorId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Newsletters</h1>
      <MyNewsletters newsletters={newsletters} />
    </div>
  )
}
