import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"

export default async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-xl">
            NewsletterHub
          </Link>
          {user && (
            <nav className="hidden md:flex gap-6">
              <Link href="/feed" className="text-sm font-medium transition-colors hover:text-primary">
                Feed
              </Link>
              <Link href="/newspaper" className="text-sm font-medium transition-colors hover:text-primary">
                Today's Newspaper
              </Link>
              <Link href="/create" className="text-sm font-medium transition-colors hover:text-primary">
                Create Newsletter
              </Link>
              <Link href="/discover" className="text-sm font-medium transition-colors hover:text-primary">
                Discover
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <UserNav user={user} />
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
