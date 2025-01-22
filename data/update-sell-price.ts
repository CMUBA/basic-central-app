import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update all coupon templates with sell price 0 or undefined
  const updated = await prisma.couponTemplate.updateMany({
    where: {
      OR: [
        { sellPrice: { equals: 0 } },
        { sellPrice: { lt: 0 } }
      ]
    },
    data: {
      sellPrice: 30
    }
  })

  console.log(`Updated ${updated.count} coupon templates with default sell price`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 