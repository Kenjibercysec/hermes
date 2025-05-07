import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DailyNewspaper } from "@/components/daily-newspaper"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NewspaperPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get today's newspaper
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const newspaper = await db.dailyNewspaper.findFirst({
    where: {
      date: {
        gte: today,
      },
    },
    include: {
      items: {
        include: {
          newsletter: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Today's Newspaper</h1>

      {newspaper ? (
        <DailyNewspaper newspaper={newspaper} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No newspaper available yet</h2>
          <p className="text-muted-foreground mb-4">Today's newspaper is being generated. Check back later!</p>
          <Button asChild>
            <Link href="/feed">Browse Your Feed</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
