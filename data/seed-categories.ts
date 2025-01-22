import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
  {
    name: "Food & Beverage",
    description: "Restaurants, cafes, and food delivery services"
  },
  {
    name: "Shopping",
    description: "Retail stores and online shopping"
  },
  {
    name: "Entertainment",
    description: "Movies, games, and leisure activities"
  },
  {
    name: "Travel",
    description: "Hotels, flights, and travel packages"
  },
  {
    name: "Beauty & Wellness",
    description: "Spas, salons, and wellness centers"
  },
  {
    name: "Services",
    description: "Professional and personal services"
  }
]

async function main() {
  console.log("Start seeding coupon categories...")

  for (const category of categories) {
    const result = await prisma.couponCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category
    })
    console.log(`Created category: ${result.name}`)
  }

  console.log("Seeding completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 