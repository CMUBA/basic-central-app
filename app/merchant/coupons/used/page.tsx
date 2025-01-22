import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Helper function to format discount display
function formatDiscount(type: string, value: number): string {
  // Round to 2 decimal places
  const roundedValue = Number(value.toFixed(2))
  
  if (type === "percentage") {
    // Ensure percentage is between 0 and 100
    const normalizedValue = Math.max(0, Math.min(100, roundedValue))
    return `${normalizedValue}% off`
  } else {
    return `${roundedValue} off`
  }
}

export default async function UsedCouponsPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/merchant/coupons/used")
  }

  // Get user with merchant profile and used coupons
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      merchantProfile: {
        include: {
          coupons: {
            include: {
              issuedCoupons: {
                where: { status: "used" },
                include: {
                  user: true,
                  template: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user?.merchantProfile) {
    redirect("/merchant/new")
  }

  // Flatten the coupons array to get all used coupons
  const usedCoupons = user.merchantProfile.coupons.flatMap(template => 
    template.issuedCoupons.map(coupon => ({
      id: coupon.id,
      templateId: template.id,
      templateName: template.name,
      userName: coupon.user.name ? `${coupon.user.name.slice(0, 3)}${"*".repeat(coupon.user.name.length - 3)}` : "Anonymous",
      passCode: `${"*".repeat(4)}${coupon.passCode.slice(-4)}`,
      usedAt: coupon.usedAt,
      discountType: template.discountType,
      discountValue: Number(template.discountValue)
    }))
  ).sort((a, b) => (b.usedAt?.getTime() ?? 0) - (a.usedAt?.getTime() ?? 0))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Used Coupons</h1>
        <Button asChild variant="outline">
          <Link href="/merchant">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Coupon Name</th>
              <th className="p-4 text-left font-medium">Customer</th>
              <th className="p-4 text-left font-medium">Passcode</th>
              <th className="p-4 text-left font-medium">Discount</th>
              <th className="p-4 text-left font-medium">Used At</th>
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usedCoupons.map((coupon) => (
              <tr key={coupon.id} className="border-b">
                <td className="p-4">{coupon.templateName}</td>
                <td className="p-4">{coupon.userName}</td>
                <td className="p-4">{coupon.passCode}</td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Discount: {formatDiscount(coupon.discountType, coupon.discountValue)}
                  </div>
                </td>
                <td className="p-4">{coupon.usedAt?.toLocaleString()}</td>
                <td className="p-4">
                  <Button asChild variant="link" size="sm">
                    <Link href={`/merchant/coupons/${coupon.templateId}`}>
                      View Details
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 