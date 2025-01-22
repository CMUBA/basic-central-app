import { auth } from "auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewPlayerForm from "@/components/new-player-form"

export default async function NewPlayerPage() {
  const session = await auth()
  
  // If not signed in, redirect to sign in page
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/player/new")
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { playerProfile: true }
  })

  // If no user found, redirect to homepage
  if (!user) {
    redirect("/")
  }

  // If player profile exists, redirect to player dashboard
  if (user.playerProfile) {
    redirect("/player")
  }

  async function createPlayerProfile(formData: FormData) {
    "use server"

    const walletAddress = formData.get("walletAddress") as string

    if (!walletAddress) {
      throw new Error("Please provide a wallet address")
    }

    // Check if wallet address is already in use
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { walletAddress }
    })

    if (existingProfile) {
      throw new Error("This wallet address is already registered")
    }

    await prisma.playerProfile.create({
      data: {
        userId: user.id,
        walletAddress
      }
    })

    redirect("/player")
  }

  return <NewPlayerForm onSubmit={createPlayerProfile} />
} 