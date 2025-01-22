import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import NewCouponForm from "@/components/new-coupon-form"

// Helper function to format date for display
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get default start and end dates
function getDefaultDates() {
  // Get current time in local timezone
  const now = new Date()
  console.log('Current time:', now.toLocaleString())
  
  // Set start time to current time plus 12 hours
  const startDate = new Date(now.getTime() + 12 * 60 * 60 * 1000)
  const endDate = new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from start
  
  console.log('Start time:', startDate.toLocaleString())
  console.log('End time:', endDate.toLocaleString())
  
  // Format for datetime-local input
  return {
    startDate: startDate.toISOString().slice(0, 16),
    endDate: endDate.toISOString().slice(0, 16)
  }
}

interface FormattedPromotionType {
  type: string
  name: string
  basePoints: number
  affect: string
  calculate: string
  description: string
  num: number
  require_people_num?: number
  condition?: number
  pay_type?: string
}

export default async function NewCouponPage() {
  const session = await auth()
  const user = session?.user

  if (!user?.email) {
    redirect("/sign-in")
  }

  const userWithProfile = await prisma.user.findUnique({
    where: { email: user.email },
    include: { merchantProfile: true }
  })

  if (!userWithProfile?.merchantProfile) {
    redirect("/merchant/new")
  }

  const categories = await prisma.couponCategory.findMany()
  const promotionTypes = await prisma.promotionType.findMany({
    orderBy: { name: 'asc' }
  })

  // Log raw data from database
  console.log('Raw promotion types from DB:', JSON.stringify(promotionTypes, null, 2))

  // Transform the data to match the component's expected format
  const formattedPromotionTypes = promotionTypes.map(pt => {
    // First log the raw data we're working with
    console.log('Raw data for type:', pt.type, JSON.stringify({
      basePoints: pt.basePoints,
      defaultNum: pt.defaultNum,
      name: pt.name
    }, null, 2))

    const formatted: FormattedPromotionType = {
      type: pt.type,
      name: pt.name,
      basePoints: pt.basePoints,
      affect: pt.affect,
      calculate: pt.calculate,
      description: pt.description,
      num: pt.defaultNum ?? 0,
      require_people_num: pt.requirePeopleNum ?? undefined,
      condition: pt.condition ?? undefined,
      pay_type: pt.payType ?? undefined
    }

    // Log the formatted data to verify the transformation
    console.log('Formatted data for type:', pt.type, JSON.stringify({
      basePoints: formatted.basePoints,
      num: formatted.num,
      name: formatted.name
    }, null, 2))

    return formatted
  })

  // Log final formatted data with explicit fields
  console.log('All formatted promotion types:', JSON.stringify(formattedPromotionTypes.map(pt => ({
    type: pt.type,
    name: pt.name,
    basePoints: pt.basePoints
  })), null, 2))

  async function createCoupon(formData: FormData) {
    "use server"

    if (!userWithProfile?.merchantProfile) {
      throw new Error("Merchant profile not found")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const type = formData.get("type") as string
    const totalQuantity = Number.parseInt(formData.get("totalQuantity") as string, 10)
    const publishCost = Number.parseInt(formData.get("publishCost") as string, 10)
    
    // Parse dates with timezone consideration
    const startDateStr = formData.get("startDate") as string
    const endDateStr = formData.get("endDate") as string
    
    if (!startDateStr || !endDateStr) {
      throw new Error("Please select both start and end dates")
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    const now = new Date()

    // Add 5 minutes buffer to allow for form submission time
    const minStartDate = new Date(now.getTime() - 5 * 60 * 1000)

    // Validate required fields
    if (!name || !description || !categoryId || !type || !totalQuantity || !publishCost) {
      throw new Error("Please fill in all required fields")
    }

    // Validate numeric values with friendly messages
    if (totalQuantity <= 0) {
      throw new Error("Please enter a valid quantity (must be greater than 0)")
    }

    // Validate dates with friendly messages
    if (startDate < minStartDate) {
      const suggestedStart = new Date(Math.ceil(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000))
      throw new Error(`Start date must be in the future. Suggested start time: ${formatDate(suggestedStart)}`)
    }
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date')
    }

    // Get promotion type details from database
    const promotionType = await prisma.promotionType.findUnique({
      where: { type }
    })

    if (!promotionType) {
      throw new Error("Invalid promotion type selected")
    }

    // Calculate total points needed
    const totalPointsNeeded = publishCost

    // Check if merchant has enough points balance
    if (userWithProfile.merchantProfile.pointsBalance < totalPointsNeeded) {
      throw new Error(`Insufficient points balance. Need ${totalPointsNeeded} points but only have ${userWithProfile.merchantProfile.pointsBalance} points. Please recharge points first.`)
    }

    // Determine discount type and value based on promotion type
    let discountType: string
    let discountValue: number

    // For percentage discounts (e.g. 0.8 for 20% off)
    if (promotionType.calculate === "multi") {
      discountType = "percentage"
      // Convert to percentage off (e.g. 20 for 20% off) and round to 2 decimal places
      discountValue = Number(((1 - (promotionType.defaultNum ?? 0)) * 100).toFixed(2))
    } else {
      // For fixed amount discounts (e.g. 100 for $100 off)
      discountType = "fixed"
      discountValue = Number((promotionType.defaultNum ?? 0).toFixed(2))
    }

    // Use transaction to ensure data consistency:
    // 1. Create coupon template
    // 2. Deduct points from merchant balance
    // 3. Create transaction record
    await prisma.$transaction([
      // Create coupon template
      prisma.couponTemplate.create({
        data: {
          merchantId: userWithProfile.merchantProfile.id,
          categoryId,
          name,
          description,
          promotionType: type,
          settings: {
            affect: promotionType.affect,
            calculate: promotionType.calculate,
            num: promotionType.defaultNum,
            condition: promotionType.condition,
            requirePeopleNum: promotionType.requirePeopleNum,
            timeLimit: promotionType.timeLimit,
            payType: promotionType.payType,
            payNum: promotionType.payNum
          },
          discountType,
          discountValue: new Prisma.Decimal(discountValue),
          publishPrice: publishCost,
          sellPrice: 30, // Default value
          totalQuantity,
          remainingQuantity: totalQuantity,
          startDate,
          endDate,
          status: "active"
        }
      }),
      // Deduct total points from merchant balance
      prisma.merchantProfile.update({
        where: { id: userWithProfile.merchantProfile.id },
        data: {
          pointsBalance: {
            decrement: totalPointsNeeded
          }
        }
      }),
      // Create transaction record for points deduction
      prisma.transaction.create({
        data: {
          userId: userWithProfile.id,
          type: "coupon_creation",
          amount: -totalPointsNeeded,
          status: "completed"
        }
      })
    ])

    redirect("/merchant/coupons")
  }

  const defaultDates = getDefaultDates()
  return (
    <div className="container max-w-2xl py-8">
      <NewCouponForm 
        categories={categories} 
        promotionTypes={formattedPromotionTypes}
        merchant={userWithProfile.merchantProfile} 
        defaultDates={{
          startDate: defaultDates.startDate,
          endDate: defaultDates.endDate
        }}
        onSubmit={createCoupon} 
      />
    </div>
  )
} 