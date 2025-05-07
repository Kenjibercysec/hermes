import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { UserSettings } from "@/components/user-settings"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get full user data
  const userData = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      customLink: true,
    },
  })

  if (!userData) {
    redirect("/sign-in")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <UserSettings user={userData} />
    </div>
  )
}
