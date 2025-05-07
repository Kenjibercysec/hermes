import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/admin/newsletters">Manage Newsletters</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">Manage Users</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/newspaper">Daily Newspaper</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Newsletters</h2>
          <p className="text-muted-foreground mb-4">Manage all newsletters and their publication status</p>
          <Button asChild className="w-full">
            <Link href="/admin/newsletters">View All</Link>
          </Button>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <p className="text-muted-foreground mb-4">Manage user accounts and permissions</p>
          <Button asChild className="w-full">
            <Link href="/admin/users">View All</Link>
          </Button>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Daily Newspaper</h2>
          <p className="text-muted-foreground mb-4">Generate and manage the daily AI newspaper</p>
          <Button asChild className="w-full">
            <Link href="/admin/newspaper">Manage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
