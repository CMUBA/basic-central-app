import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PlayerTransactionsPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      playerProfile: true,
      transactions: {
        where: {
          OR: [
            { type: "buy_coupon" },
            { type: "recharge_points" }
          ]
        },
        include: {
          coupon: {
            include: {
              merchant: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!user?.playerProfile) {
    redirect("/player/new")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            Current Balance: {user.playerProfile.pointsBalance} points
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/player">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {user.transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">
                {transaction.type === "buy_coupon" ? (
                  <>
                    Purchased Coupon: {transaction.coupon?.name}
                    <div className="text-sm text-muted-foreground">
                      from {transaction.coupon?.merchant.businessName}
                    </div>
                  </>
                ) : (
                  "Points Recharge"
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
            <div className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
              {transaction.amount > 0 ? "+" : ""}{transaction.amount} points
            </div>
          </div>
        ))}

        {user.transactions.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  )
} 