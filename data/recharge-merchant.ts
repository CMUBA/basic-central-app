import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start recharging merchant points...')
  
  // Get all merchants
  const merchants = await prisma.merchantProfile.findMany({
    include: {
      user: true
    }
  })

  for (const merchant of merchants) {
    // Add 1000 points to each merchant
    const rechargeAmount = 1000

    // Use transaction to ensure data consistency
    await prisma.$transaction([
      // Update merchant balance
      prisma.merchantProfile.update({
        where: { id: merchant.id },
        data: {
          pointsBalance: {
            increment: rechargeAmount
          }
        }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: merchant.user.id,
          type: "recharge_points",
          amount: rechargeAmount,
          status: "completed",
          createdAt: new Date()
        }
      })
    ])

    console.log(`Recharged ${rechargeAmount} points for merchant ${merchant.user.email}`)
  }
  
  console.log('Merchant points recharged successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 