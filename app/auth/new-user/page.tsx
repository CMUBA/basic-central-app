import { auth } from "auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewUserForm from "@/components/new-user-form"

export default async function NewUserPage() {
  const session = await auth()
  
  // If not signed in, redirect to sign in page
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  // If user exists, redirect to homepage
  if (existingUser) {
    redirect("/")
  }

  async function createUser() {
    "use server"
    
    if (!session?.user?.email) {
      redirect("/auth/signin")
    }

    try {
      // Double check user doesn't exist
      const existingUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (existingUser) {
        redirect("/")
      }
      
      // Create new user
      const user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
        },
      })

      // Redirect to homepage after user creation
      redirect("/")
    } catch (error) {
      // If there's a unique constraint error, user was created in another tab/window
      if (error.code === 'P2002') {
        redirect("/")
      }
      throw error
    }
  }

  return <NewUserForm email={session.user.email} onCreateUser={createUser} />
} 