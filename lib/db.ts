import prisma from "./prisma"
import type { User, MerchantProfile, CouponTemplate, IssuedCoupon } from "@prisma/client"

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      merchantProfile: true,
    },
  })
}

export async function getMerchantProfile(userId: string) {
  return await prisma.merchantProfile.findUnique({
    where: { userId },
  })
}

export async function createMerchantProfile(
  userId: string,
  data: Omit<MerchantProfile, "id" | "userId" | "createdAt" | "updatedAt" | "pointsBalance">
) {
  return await prisma.merchantProfile.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function getCouponTemplates(merchantId?: string) {
  return await prisma.couponTemplate.findMany({
    where: merchantId ? { merchantId } : undefined,
    include: {
      merchant: true,
      category: true,
    },
  })
}

export async function getIssuedCoupons(userId: string) {
  return await prisma.issuedCoupon.findMany({
    where: { userId },
    include: {
      template: {
        include: {
          merchant: true,
        },
      },
    },
  })
}

export async function createCouponTemplate(
  merchantId: string,
  data: Omit<CouponTemplate, "id" | "merchantId" | "createdAt" | "remainingQuantity">
) {
  return await prisma.couponTemplate.create({
    data: {
      ...data,
      merchantId,
      remainingQuantity: data.totalQuantity,
    },
  })
}

export async function issueCoupon(
  templateId: string,
  userId: string,
  data: Pick<IssuedCoupon, "passCode" | "qrCode">
) {
  // Start a transaction
  return await prisma.$transaction(async (tx) => {
    // Get the template and check remaining quantity
    const template = await tx.couponTemplate.findUnique({
      where: { id: templateId },
    })
    
    if (!template || template.remainingQuantity <= 0) {
      throw new Error("Coupon template not available")
    }

    // Update template remaining quantity
    await tx.couponTemplate.update({
      where: { id: templateId },
      data: { remainingQuantity: template.remainingQuantity - 1 },
    })

    // Create issued coupon
    return await tx.issuedCoupon.create({
      data: {
        templateId,
        userId,
        ...data,
      },
    })
  })
}

export async function redeemCoupon(passCode: string) {
  return await prisma.issuedCoupon.update({
    where: { passCode },
    data: {
      status: "used",
      usedAt: new Date(),
    },
  })
}

export async function createRechargeCode(
  merchantId: string,
  points: number
) {
  const code = generateRechargeCode() // You need to implement this function
  return await prisma.rechargeCode.create({
    data: {
      code,
      points,
      merchantId,
    },
  })
}

export async function useRechargeCode(code: string) {
  // Start a transaction
  return await prisma.$transaction(async (tx) => {
    // Get and validate recharge code
    const rechargeCode = await tx.rechargeCode.findUnique({
      where: { code },
      include: { merchant: true },
    })

    if (!rechargeCode || rechargeCode.status === "used") {
      throw new Error("Invalid or used recharge code")
    }

    // Update recharge code status
    await tx.rechargeCode.update({
      where: { id: rechargeCode.id },
      data: {
        status: "used",
        usedAt: new Date(),
      },
    })

    // Update merchant points balance
    return await tx.merchantProfile.update({
      where: { id: rechargeCode.merchantId },
      data: {
        pointsBalance: {
          increment: rechargeCode.points,
        },
      },
    })
  })
}

// Helper function to generate recharge code
function generateRechargeCode() {
  return Math.random().toString(36).substring(2, 15).toUpperCase()
} 