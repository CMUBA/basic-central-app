import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const promotionTypes = [
  {
    type: "PINDUODUO_GROUP_BUYING",
    name: "Group Buying",
    basePoints: 50,
    affect: "price",
    calculate: "multi",
    description: "Get discount when multiple people join the group purchase",
    defaultNum: 0.7,        // 70% of original price
    requirePeopleNum: 3     // requires 3 people
  },
  {
    type: "PINDUODUO_DIRECT_REDUCTION",
    name: "Direct Discount",
    basePoints: 30,
    affect: "price",
    calculate: "subtract",
    description: "Direct amount reduction from original price",
    defaultNum: 20          // reduce by 20
  },
  {
    type: "TAOBAO_FULL_MINUS",
    name: "Spend More Save More",
    basePoints: 40,
    affect: "total_order",
    calculate: "subtract",
    description: "Get fixed amount off when order meets minimum spend",
    defaultNum: 50,         // reduce by 50
    condition: 200          // when spending 200 or more
  },
  {
    type: "TAOBAO_COUPON",
    name: "Store Coupon",
    basePoints: 35,
    affect: "price",
    calculate: "subtract",
    description: "Exchange points for store coupon",
    defaultNum: 10,         // reduce by 10
    payType: "points",
    payNum: 100            // costs 100 points
  },
  {
    type: "AMAZON_PERCENTAGE_OFF",
    name: "Percentage Discount",
    basePoints: 45,
    affect: "price",
    calculate: "multi",
    description: "Get percentage off original price",
    defaultNum: 0.85        // 85% of original price
  },
  {
    type: "AMAZON_BUNDLE_SALE",
    name: "Bundle Discount",
    basePoints: 55,
    affect: "total_order",
    calculate: "multi",
    description: "Get discount when buying multiple items",
    defaultNum: 0.9,        // 90% of original price
    condition: 2            // when buying 2 or more
  },
  {
    type: "EBAY_DAILY_DEAL",
    name: "Time-Limited Deal",
    basePoints: 60,
    affect: "price",
    calculate: "multi",
    description: "Special discount during limited time period",
    defaultNum: 0.6,        // 60% of original price
    timeLimit: true
  },
  {
    type: "EBAY_COUPON_CODE",
    name: "Coupon Code",
    basePoints: 40,
    affect: "total_order",
    calculate: "subtract",
    description: "Use special code to get discount",
    defaultNum: 15,         // reduce by 15
    payType: "points"
  }
]

async function main() {
  console.log('Start initializing promotion types...')
  
  for (const promotionType of promotionTypes) {
    await prisma.promotionType.upsert({
      where: { type: promotionType.type },
      update: promotionType,
      create: promotionType
    })
  }
  
  console.log('Promotion types initialized successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 