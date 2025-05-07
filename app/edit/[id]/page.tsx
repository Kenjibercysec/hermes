import { getCurrentUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { NewsletterEditor } from "@/components/newsletter-editor-edit"

interface EditNewsletterPageProps {
  params: {
    id: string
  }
}

export default async function EditNewsletterPage({ params }: EditNewsletterPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get the newsletter
  const newsletter = await db.newsletter.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!newsletter) {
    notFound()
  }

  // Check if the user is the author or an admin
  if (newsletter.authorId !== user.id && user.role !== "ADMIN") {
    redirect("/my-newsletters")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Newsletter</h1>
      <NewsletterEditor user={user} newsletter={newsletter} isEditing={true} />
    </div>
  )
}
