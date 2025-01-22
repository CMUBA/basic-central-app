import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start adding recharge transactions...')
  
  // Get all merchants and players
  const users = await prisma.user.findMany({
    include: {
      merchantProfile: true,
      playerProfile: true,
      transactions: {
        where: {
          type: "recharge_points"
        }
      }
    }
  })

  for (const user of users) {
    // If user has points but no recharge transaction, add one
    if (user.merchantProfile && user.merchantProfile.pointsBalance > 0 && user.transactions.length === 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "recharge_points",
          amount: user.merchantProfile.pointsBalance,
          status: "completed",
          createdAt: new Date()
        }
      })
      console.log(`Added recharge transaction for merchant ${user.email}`)
    }
    
    if (user.playerProfile && user.playerProfile.pointsBalance > 0 && user.transactions.length === 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "recharge_points",
          amount: user.playerProfile.pointsBalance,
          status: "completed",
          createdAt: new Date()
        }
      })
      console.log(`Added recharge transaction for player ${user.email}`)
    }
  }
  
  console.log('Recharge transactions added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 