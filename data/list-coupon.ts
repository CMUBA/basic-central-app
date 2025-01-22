import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Get all coupon templates with merchant info and issued coupons
  const coupons = await prisma.couponTemplate.findMany({
    include: {
      merchant: true,
      issuedCoupons: true,
      category: true
    }
  })

  console.log("\n=== Coupons Summary ===")
  console.log(`Total Coupon Templates: ${coupons.length}`)
  console.log(`Active Templates: ${coupons.filter(c => c.status === "active").length}`)
  console.log(`Total Issued Coupons: ${coupons.reduce((acc, c) => acc + c.issuedCoupons.length, 0)}`)

  console.log("\n=== Detailed Coupon Information ===")
  for (const coupon of coupons) {
    console.log(`\n--- Coupon: ${coupon.name} ---`)
    console.log(`ID: ${coupon.id}`)
    console.log(`Merchant: ${coupon.merchant.businessName}`)
    console.log(`Category: ${coupon.category.name}`)
    console.log(`Description: ${coupon.description}`)
    console.log(`Status: ${coupon.status}`)
    console.log(`Points Price: ${coupon.pointsPrice}`)
    console.log(`Quantity: ${coupon.remainingQuantity} / ${coupon.totalQuantity}`)
    console.log(`Valid: ${coupon.startDate.toLocaleDateString()} - ${coupon.endDate.toLocaleDateString()}`)
    
    if (coupon.issuedCoupons.length > 0) {
      console.log("\nIssued Coupons Status:")
      const statusCount = coupon.issuedCoupons.reduce((acc, ic) => {
        acc[ic.status] = (acc[ic.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      for (const [status, count] of Object.entries(statusCount)) {
        console.log(`- ${status}: ${count}`)
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 