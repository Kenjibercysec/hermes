import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NewslettersPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
        <Button asChild>
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Newsletters</h2>
          <Button>Create Newsletter</Button>
        </div>

        <div className="space-y-4">
          {/* Placeholder for newsletter list */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Sample Newsletter</h3>
                <p className="text-sm text-muted-foreground">By Admin User</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">Publish</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 