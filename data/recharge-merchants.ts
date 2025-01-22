import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Get all merchants
  const merchants = await prisma.merchantProfile.findMany()
  
  console.log(`Found ${merchants.length} merchants to recharge`)
  
  // Update each merchant's points balance and create transaction records
  for (const merchant of merchants) {
    await prisma.$transaction([
      // Update merchant points balance
      prisma.merchantProfile.update({
        where: { id: merchant.id },
        data: {
          pointsBalance: {
            increment: 1000
          }
        }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: merchant.userId,
          type: "recharge",
          amount: 1000,
          status: "completed"
        }
      })
    ])
    
    console.log(`Recharged merchant ${merchant.businessName} with 1000 points`)
  }
  
  console.log("Recharge completed successfully")
}

main()
  .catch((e) => {
    console.error("Error during recharge:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 