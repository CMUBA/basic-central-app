import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { generatePasscode } from "@/lib/utils"
import QRCode from "qrcode"
import type { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

type CouponWithRelations = Prisma.CouponTemplateGetPayload<{
  include: {
    merchant: true
    category: true
  }
}>

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    playerProfile: true
    issuedCoupons: {
      include: {
        template: {
          include: {
            merchant: true
            category: true
          }
        }
      }
    }
  }
}>

export default async function CouponDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string }
  searchParams?: { error?: string }
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect(`/auth/signin?callbackUrl=/player/coupons/${params.id}`)
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      playerProfile: true,
      issuedCoupons: {
        where: {
          templateId: params.id
        },
        include: {
          template: {
            include: {
              merchant: true,
              category: true
            }
          }
        }
      }
    }
  }) as UserWithRelations | null
  
  if (!user) {
    redirect("/")
  }
  
  if (!user.playerProfile) {
    redirect("/player/new")
  }

  if (user.issuedCoupons.length > 0) {
    redirect(`/player/coupons/${params.id}/show`)
  }
  
  const coupon = await prisma.couponTemplate.findUnique({
    where: { id: params.id },
    include: {
      merchant: true,
      category: true
    }
  }) as CouponWithRelations | null
  
  if (!coupon) {
    redirect("/player/browse")
  }

  async function redeemCoupon() {
    "use server"

    try {
      if (!user?.playerProfile || !coupon) return

      // 1. Check points balance
      if (user.playerProfile.pointsBalance < (coupon.sellPrice ?? 30)) {
        throw new Error(`Insufficient points balance. Need ${coupon.sellPrice ?? 30} points but only have ${user.playerProfile.pointsBalance} points.`)
      }

      // 2. Check coupon validity
      const now = new Date()
      
      // Allow purchase before start date, but show warning
      let warningMessage = ""
      if (now < coupon.startDate) {
        warningMessage = `Note: This coupon will be valid from ${coupon.startDate.toLocaleString()}`
      }
      
      // Check expiration
      if (now > coupon.endDate) {
        throw new Error(`This coupon has expired on ${coupon.endDate.toLocaleString()}`)
      }

      // Check inventory
      if (coupon.remainingQuantity <= 0) {
        throw new Error("This coupon is out of stock")
      }

      // 3. Generate codes
      const passCode = generatePasscode()
      const qrCode = await QRCode.toDataURL(passCode)

      // 4. Execute purchase transaction
      await prisma.$transaction([
        prisma.playerProfile.update({
          where: { id: user.playerProfile.id },
          data: {
            pointsBalance: {
              decrement: coupon.sellPrice ?? 30
            }
          }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "buy_coupon",
            amount: -(coupon.sellPrice ?? 30),
            status: "completed",
            couponId: coupon.id
          }
        }),
        prisma.couponTemplate.update({
          where: { id: coupon.id },
          data: {
            remainingQuantity: {
              decrement: 1
            }
          }
        }),
        prisma.issuedCoupon.create({
          data: {
            templateId: coupon.id,
            userId: user.id,
            passCode,
            qrCode,
            status: "unused",
            buyPrice: coupon.sellPrice ?? 30
          }
        })
      ])

      // Revalidate the page to update UI
      revalidatePath(`/player/coupons/${params.id}`)
      
      // Redirect with success message if there was a warning
      if (warningMessage) {
        redirect(`/player/coupons/${params.id}/show?message=${encodeURIComponent(warningMessage)}`)
      } else {
        redirect(`/player/coupons/${params.id}/show`)
      }

    } catch (error) {
      // Redirect back to the same page with error message
      redirect(`/player/coupons/${params.id}?error=${encodeURIComponent(error instanceof Error ? error.message : 'An error occurred')}`)
    }
  }

  // Get current validity status
  const now = new Date()
  const isNotStarted = now < coupon.startDate
  const isExpired = now > coupon.endDate
  const isOutOfStock = coupon.remainingQuantity <= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupon Details</h1>
        <Button asChild variant="outline">
          <Link href="/player/browse">Back to Browse</Link>
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">{coupon.name}</h2>
            <p className="text-muted-foreground">{coupon.description}</p>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div>Category: {coupon.category.name}</div>
            <div>Merchant: {coupon.merchant.businessName}</div>
            <div>Price: {coupon.sellPrice ?? 30} points</div>
            <div>Available: {coupon.remainingQuantity} / {coupon.totalQuantity}</div>
            <div>Valid period: {coupon.startDate.toLocaleDateString()} - {coupon.endDate.toLocaleDateString()}</div>
          </div>
          
          <div className="mt-2">
            <div className="text-sm font-medium">Your Balance: {user.playerProfile.pointsBalance} points</div>
            {user.playerProfile.pointsBalance < (coupon.sellPrice ?? 30) && (
              <p className="text-sm text-destructive">Insufficient points to redeem this coupon</p>
            )}
            {isNotStarted && (
              <p className="text-sm text-yellow-600">
                Note: This coupon will be valid from {coupon.startDate.toLocaleString()}
              </p>
            )}
            {isExpired && (
              <p className="text-sm text-destructive">
                This coupon has expired on {coupon.endDate.toLocaleString()}
              </p>
            )}
            {isOutOfStock && (
              <p className="text-sm text-destructive">
                This coupon is out of stock
              </p>
            )}
            {searchParams?.error && (
              <p className="text-sm text-destructive mt-2">
                {decodeURIComponent(searchParams.error)}
              </p>
            )}
          </div>
          
          <form action={redeemCoupon}>
            <Button 
              type="submit"
              className="w-full"
              disabled={
                user.playerProfile.pointsBalance < (coupon.sellPrice ?? 30) ||
                isExpired ||
                isOutOfStock
              }
            >
              {user.playerProfile.pointsBalance < (coupon.sellPrice ?? 30)
                ? `Insufficient points (need ${coupon.sellPrice ?? 30} points)`
                : isExpired
                ? "Coupon has expired"
                : isOutOfStock
                ? "Out of stock"
                : `Redeem for ${coupon.sellPrice ?? 30} points`}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
} 