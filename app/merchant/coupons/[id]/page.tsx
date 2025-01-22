import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function CouponDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.email) {
    redirect(`/auth/signin?callbackUrl=/merchant/coupons/${params.id}`)
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchantProfile: true }
  })

  if (!user?.merchantProfile) {
    redirect("/merchant/new")
  }

  const coupon = await prisma.couponTemplate.findUnique({
    where: { 
      id: params.id,
      merchantId: user.merchantProfile.id
    },
    include: {
      category: true,
      issuedCoupons: {
        include: {
          user: true
        }
      }
    }
  })

  if (!coupon) {
    notFound()
  }

  // Group coupons by status
  const coupons = {
    unused: coupon.issuedCoupons.filter(c => c.status === "unused"),
    used: coupon.issuedCoupons.filter(c => c.status === "used")
  }

  return (
    <div className="flex flex-col gap-6 container mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{coupon.name}</h1>
          <p className="text-muted-foreground">{coupon.description}</p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/merchant/coupons">Back to Coupons</Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Category</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold">{coupon.category.name}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Quantity</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold">{coupon.totalQuantity}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Remaining</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold">{coupon.remainingQuantity}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Used</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold">{coupons.used.length}</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Used Coupons</h2>
        </div>
        <div className="divide-y">
          {coupons.used.map((coupon) => (
            <div key={coupon.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {coupon.user.name ? 
                      `${coupon.user.name.slice(0, 3)}${"*".repeat(coupon.user.name.length - 3)}` : 
                      "Anonymous"
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pass Code: {`${"*".repeat(4)}${coupon.passCode.slice(-4)}`}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Used at: {coupon.usedAt?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {coupons.used.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No used coupons yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 