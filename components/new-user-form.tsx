"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"

export default function NewUserForm({ 
  email,
  onCreateUser
}: { 
  email: string
  onCreateUser: () => Promise<void>
}) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to Our Platform!</CardTitle>
          <CardDescription>
            We noticed you're new here. Would you like to create an account with your email {email}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            By creating an account, you'll be able to:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Access merchant or player features</li>
            <li>Manage your coupons</li>
            <li>Track your activities</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between">
          <form action={onCreateUser}>
            <Button type="submit">Create Account</Button>
          </form>
          <Button 
            variant="outline" 
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 