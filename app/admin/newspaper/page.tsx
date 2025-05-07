import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NewspaperPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Daily Newspaper</h1>
        <Button asChild>
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Today's Newspaper</h2>
          <p className="text-muted-foreground mb-4">
            Use AI to generate a new daily newspaper based on the latest newsletters
          </p>
          <Button className="w-full">Generate Now</Button>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Newspapers</h2>
          <div className="space-y-4">
            {/* Placeholder for recent newspapers */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Today's Newspaper</h3>
                  <p className="text-sm text-muted-foreground">Generated 2 hours ago</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 