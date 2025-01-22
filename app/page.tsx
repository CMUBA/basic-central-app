import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Prisma } from "@prisma/client"

export default async function HomePage() {
  const session = await auth()
  
  // If not signed in, show welcome page
  if (!session?.user?.email) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Arcadia Smart Business</h1>
          <h2 className="text-muted-foreground">Get New Customers by Web3</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">For Merchants</h2>
            <p className="mt-2 text-muted-foreground">
              Attract new customers with smart promotions and loyalty programs.
            </p>
            <Link 
              href="/auth/signin?callbackUrl=/merchant/new"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">For Players</h2>
            <p className="mt-2 text-muted-foreground">
              Discover great deals and earn rewards while playing.
            </p>
            <Link 
              href="/auth/signin?callbackUrl=/player/new"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get user with profiles and unused coupons
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      merchantProfile: true,
      playerProfile: true,
      issuedCoupons: {
        where: { status: "unused" }
      }
    }
  }) as Prisma.UserGetPayload<{
    include: {
      merchantProfile: true;
      playerProfile: true;
      issuedCoupons: { where: { status: string } };
    };
  }>;

  if (!user) {
    redirect("/auth/signin")
  }

  const username = session.user.name || user.email.split('@')[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {username}</h1>
        <p className="text-muted-foreground">Get started with Arcadia - Your Gateway to Smart Business</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Merchant Section */}
        <Link 
          href={user.merchantProfile ? "/merchant" : "/merchant/new"}
          className="rounded-lg border p-6 transition-colors hover:bg-muted/50"
        >
          <h2 className="text-xl font-semibold">Merchant</h2>
          {user.merchantProfile ? (
            <>
              <p className="mt-2 text-muted-foreground">
                Business: {user.merchantProfile.businessName}
              </p>
              <p className="text-sm text-muted-foreground">
                Points Balance: {user.merchantProfile.pointsBalance} points
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-muted-foreground">
                Get New Customers with Smart Promotions
              </p>
              <p className="text-sm text-muted-foreground">
                Register as a merchant to start issuing coupons and attracting customers.
              </p>
            </>
          )}
        </Link>

        {/* Player Section */}
        <Link 
          href={user.playerProfile ? "/player" : "/player/new"}
          className="rounded-lg border p-6 transition-colors hover:bg-muted/50"
        >
          <h2 className="text-xl font-semibold">Player</h2>
          {user.playerProfile ? (
            <>
              <p className="mt-2 text-muted-foreground">
                Points Balance: {user.playerProfile.pointsBalance} points
              </p>
              <p className="text-sm text-muted-foreground">
                Unused Coupons: {user.issuedCoupons.length}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-muted-foreground">
                Smart Business Starts Here
              </p>
              <p className="text-sm text-muted-foreground">
                Register as a player to browse and redeem coupons using points.
              </p>
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
