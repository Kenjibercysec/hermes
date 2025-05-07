"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/blob"

const userSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().optional(),
  customLink: z.string().optional(),
})

interface UserSettingsProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    customLink: string | null
  }
}

export function UserSettings({ user }: UserSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(user.image)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      customLink: user.customLink || "",
    },
  })

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      const url = await uploadImage(file)
      setProfileImage(url)

      // Update user profile image
      const response = await fetch("/api/user/update-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile image")
      }

      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function onSubmit(values: z.infer<typeof userSettingsSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileImage || ""} alt={user.name || ""} />
              <AvatarFallback className="text-xl">{user.name?.[0] || user.email[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                {isUploadingImage ? "Uploading..." : "Change Profile Picture"}
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <p className="text-xs text-muted-foreground">Recommended: Square image, at least 200x200px</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Link</FormLabel>
                    <FormControl>
                      <Input placeholder="yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
