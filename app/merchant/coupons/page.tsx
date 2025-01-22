import { auth } from "auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Helper function to format discount display
function formatDiscount(type: string, value: number): string {
  // Round to 2 decimal places
  const roundedValue = Number(value.toFixed(2))
  
  if (type === "percentage") {
    // Ensure percentage is between 0 and 100
    const normalizedValue = Math.max(0, Math.min(100, roundedValue))
    return `${normalizedValue}% off`
  }
  return `${roundedValue} off`
}

export default async function MerchantCouponsPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/merchant/coupons")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchantProfile: true }
  })

  if (!user?.merchantProfile) {
    redirect("/merchant/new")
  }

  // Get all coupon templates for this merchant
  const coupons = await prisma.couponTemplate.findMany({
    where: {
      merchantId: user.merchantProfile.id
    },
    include: {
      category: true,
      issuedCoupons: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Coupons</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/merchant/coupons/new">Issue New Coupon</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/merchant">Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{coupon.name}</h2>
                <p className="text-muted-foreground">{coupon.description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {coupon.status === 'active' ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                    {coupon.status}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-sm text-muted-foreground">Category</div>
                <div>{coupon.category.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Publish Price</div>
                <div>{coupon.publishPrice} points</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Quantity</div>
                <div>{coupon.remainingQuantity} / {coupon.totalQuantity}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Issued</div>
                <div>{coupon.issuedCoupons.length}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div>{new Date(coupon.startDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div>{new Date(coupon.endDate).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1">
                {coupon.status === 'active' ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                    Active (Available for redemption)
                  </span>
                ) : coupon.status === 'expired' ? (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">
                    Expired (Past end date)
                  </span>
                ) : coupon.status === 'soldout' ? (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-orange-700">
                    Sold Out (No remaining quantity)
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                    {coupon.status}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Promotion Details</div>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                <div>Type: {coupon.promotionType}</div>
                <div>
                  Discount: {formatDiscount(coupon.discountType, Number(coupon.discountValue))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            You haven't issued any coupons yet.
          </div>
        )}
      </div>
    </div>
  )
} 