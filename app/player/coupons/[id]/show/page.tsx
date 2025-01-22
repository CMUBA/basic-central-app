import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import QRCode from "qrcode"
import type { Prisma } from "@prisma/client"
import { cn } from "@/lib/utils"

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    playerProfile: true
    issuedCoupons: {
      include: {
        template: true
      }
    }
  }
}>

export default async function ShowCouponPage({ params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect(`/auth/signin?callbackUrl=/player/coupons/${params.id}/show`)
  }

  const issuedCoupon = await prisma.issuedCoupon.findUnique({
    where: { id: params.id },
    include: {
      template: true,
      user: {
        include: {
          playerProfile: true
        }
      }
    }
  })

  if (!issuedCoupon) {
    redirect("/player")
  }

  if (issuedCoupon.user.email !== session.user.email) {
    redirect("/player")
  }

  // Generate QR code
  const qrCode = await QRCode.toDataURL(issuedCoupon.passCode)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{issuedCoupon.template.name}</h1>
        <Button asChild variant="outline">
          <Link href="/player">Back to My Coupons</Link>
        </Button>
      </div>

      <div className="mx-auto max-w-sm">
        <div className="rounded-lg border p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold">Your Coupon Code</h2>
            <p className="text-sm text-muted-foreground">
              Show this to the merchant to redeem your coupon
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center gap-2">
            <img src={qrCode} alt="QR Code" className="h-48 w-48" />
            <div className="text-2xl font-mono font-bold tracking-wider">
              {issuedCoupon.passCode}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Status:</div>
              <div className={cn(
                "text-sm font-medium",
                issuedCoupon.status === "unused" && "text-green-500",
                issuedCoupon.status === "used" && "text-red-500"
              )}>
                {issuedCoupon.status}
              </div>
            </div>
            <div className="flex justify-between">
              <span>Purchased</span>
              <span className="font-semibold text-foreground">
                {new Date(issuedCoupon.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Valid Until</span>
              <span className="font-semibold text-foreground">
                {new Date(issuedCoupon.template.endDate).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 