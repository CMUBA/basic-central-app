import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Get all players
  const players = await prisma.playerProfile.findMany({
    include: {
      user: true
    }
  })

  console.log(`Found ${players.length} players`)

  // Recharge each player
  for (const player of players) {
    await prisma.$transaction([
      // Add points to player
      prisma.playerProfile.update({
        where: { id: player.id },
        data: { pointsBalance: { increment: 1000 } }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: player.user.id,
          type: "points_recharge",
          amount: 1000,
          status: "completed"
        }
      })
    ])

    console.log(`Recharged ${player.user.email} with 1000 points`)
  }

  console.log('Done recharging all players')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 