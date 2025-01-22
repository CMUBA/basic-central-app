import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Starting to update usedAt time for used coupons...")
  
  const result = await prisma.issuedCoupon.updateMany({
    where: {
      status: "used",
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  })

  console.log(`Updated ${result.count} coupons with usedAt time`)
}

main()
  .catch((e) => {
    console.error("Error updating coupons:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 