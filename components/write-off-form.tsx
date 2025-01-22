"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormState, useFormStatus } from "react-dom"

interface CouponDetails {
  id: string
  name: string
  description: string
  playerName: string
  playerEmail: string
  promotionType: string
  discountType: string
  discountValue: number
  status: string
  createdAt: string
  expiresAt: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Checking..." : "Check Coupon"}
    </Button>
  )
}

function RedeemButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Processing..." : "Confirm Redemption"}
    </Button>
  )
}

export default function WriteOffForm({
  checkCoupon,
  redeemCoupon
}: {
  checkCoupon: (formData: FormData) => Promise<CouponDetails>
  redeemCoupon: (id: string) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<CouponDetails | null>(null)

  async function onCheck(formData: FormData) {
    try {
      setError(null)
      const details = await checkCoupon(formData)
      setCoupon(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check coupon")
      setCoupon(null)
    }
  }

  async function onRedeem(formData: FormData) {
    if (!coupon) return

    try {
      setError(null)
      await redeemCoupon(coupon.id)
      setCoupon(null)
      // Clear the passcode input
      const form = document.querySelector("form") as HTMLFormElement
      form?.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem coupon")
    }
  }

  function formatDiscount(type: string, value: number) {
    return type === "percentage" ? `${value}% off` : `¥${value} off`
  }

  return (
    <div className="space-y-4">
      <form action={onCheck} className="space-y-4">
        <div>
          <Input 
            type="text" 
            name="passcode" 
            placeholder="Enter customer's passcode" 
            className="max-w-md"
            pattern="[A-Z0-9]{8}"
            title="Please enter a valid 8-character passcode"
          />
        </div>
        <div>
          <SubmitButton />
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {coupon && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Coupon Details</h3>
          <div className="space-y-2 text-sm">
            <div>Name: {coupon.name}</div>
            <div>Description: {coupon.description}</div>
            <div>Customer: {coupon.playerName || coupon.playerEmail}</div>
            <div>Discount: {formatDiscount(coupon.discountType, coupon.discountValue)}</div>
            <div>Valid Until: {new Date(coupon.expiresAt).toLocaleString()}</div>
          </div>
          <form action={onRedeem} className="mt-4">
            <RedeemButton />
          </form>
        </div>
      )}
    </div>
  )
} 