import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Get all users with their profiles
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      merchantProfile: true,
      playerProfile: true,
      issuedCoupons: {
        include: {
          template: true
        }
      }
    }
  })

  console.log("\n=== Users Summary ===")
  console.log(`Total Users: ${users.length}`)
  console.log(`Users with Merchant Profile: ${users.filter(u => u.merchantProfile).length}`)
  console.log(`Users with Player Profile: ${users.filter(u => u.playerProfile).length}`)

  console.log("\n=== Detailed User Information ===")
  users.forEach((user, index) => {
    console.log(`\n--- User ${index + 1} ---`)
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name || 'Not set'}`)
    console.log(`Created: ${user.createdAt}`)
    
    if (user.accounts.length > 0) {
      console.log("\nLinked Accounts:")
      user.accounts.forEach(account => {
        console.log(`- ${account.provider} (${account.providerAccountId})`)
      })
    }

    if (user.merchantProfile) {
      console.log("\nMerchant Profile:")
      console.log(`Business Name: ${user.merchantProfile.businessName}`)
      console.log(`Description: ${user.merchantProfile.description}`)
      console.log(`Address: ${user.merchantProfile.address}`)
      console.log(`Points Balance: ${user.merchantProfile.pointsBalance}`)
    }

    if (user.playerProfile) {
      console.log("\nPlayer Profile:")
      console.log(`Wallet Address: ${user.playerProfile.walletAddress}`)
    }

    if (user.issuedCoupons.length > 0) {
      console.log("\nIssued Coupons:")
      user.issuedCoupons.forEach(coupon => {
        console.log(`- ${coupon.template.name} (${coupon.status})`)
        console.log(`  Pass Code: ${coupon.passCode}`)
      })
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 