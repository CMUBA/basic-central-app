import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start recharging player points...')
  
  // Get all players
  const players = await prisma.playerProfile.findMany({
    include: {
      user: true
    }
  })

  for (const player of players) {
    // Add 500 points to each player
    const rechargeAmount = 500

    // Use transaction to ensure data consistency
    await prisma.$transaction([
      // Update player balance
      prisma.playerProfile.update({
        where: { id: player.id },
        data: {
          pointsBalance: {
            increment: rechargeAmount
          }
        }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: player.user.id,
          type: "recharge_points",
          amount: rechargeAmount,
          status: "completed",
          createdAt: new Date()
        }
      })
    ])

    console.log(`Recharged ${rechargeAmount} points for player ${player.user.email}`)
  }
  
  console.log('Player points recharged successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 