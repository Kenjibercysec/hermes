"use client"

import { useRouter } from "next/navigation"

export async function signOut() {
  try {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to sign out")
    }
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
} 