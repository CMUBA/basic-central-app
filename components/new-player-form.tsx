"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewPlayerForm({
  onSubmit
}: {
  onSubmit: (formData: FormData) => Promise<void>
}) {
  return (
    <form action={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Register as a Player</CardTitle>
          <CardDescription>
            Please provide your wallet address to start using coupons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              name="walletAddress"
              placeholder="0x..."
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              title="Please enter a valid Ethereum address starting with 0x"
            />
            <p className="text-sm text-muted-foreground">
              This will be used to verify your identity and manage your coupons.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Register</Button>
        </CardFooter>
      </Card>
    </form>
  )
} 