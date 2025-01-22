import { auth } from "auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function VerifyPage() {
  const session = await auth()
  
  // If not signed in, redirect to sign in page
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Check if user exists in database
  const existingUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      merchantProfile: true,
      playerProfile: true,
    }
  })

  if (existingUser) {
    // User exists, check if they have any role
    if (existingUser.merchantProfile) {
      redirect("/merchant")
    }
    if (existingUser.playerProfile) {
      redirect("/player")
    }
    // User exists but no role, redirect to role selection
    redirect("/auth/role-select")
  }

  // New user, redirect to confirmation page
  redirect("/auth/new-user")
} 