import { auth } from "auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Get merchant profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchantProfile: true }
  })

  if (!user?.merchantProfile) {
    return new NextResponse("Merchant profile not found", { status: 404 })
  }

  // Get passcode from form data
  const formData = await request.formData()
  const passcode = formData.get("passcode") as string

  if (!passcode) {
    return new NextResponse("Passcode is required", { status: 400 })
  }

  // Find issued coupon by passcode
  const issuedCoupon = await prisma.issuedCoupon.findUnique({
    where: { passCode: passcode },
    include: {
      template: {
        include: {
          merchant: true
        }
      },
      user: {
        include: {
          playerProfile: true
        }
      }
    }
  })

  if (!issuedCoupon) {
    return new NextResponse("Coupon not found", { status: 404 })
  }

  // Verify coupon belongs to this merchant
  if (issuedCoupon.template.merchantId !== user.merchantProfile.id) {
    return new NextResponse("This coupon is not issued by your business", { status: 403 })
  }

  // Check coupon status
  if (issuedCoupon.status !== "unused") {
    return new NextResponse(`Coupon is already ${issuedCoupon.status}`, { status: 400 })
  }

  // Check coupon expiration
  if (new Date() > issuedCoupon.template.endDate) {
    return new NextResponse("Coupon has expired", { status: 400 })
  }

  // Return coupon details for confirmation
  return NextResponse.json({
    id: issuedCoupon.id,
    name: issuedCoupon.template.name,
    description: issuedCoupon.template.description,
    playerName: issuedCoupon.user.name,
    playerEmail: issuedCoupon.user.email,
    promotionType: issuedCoupon.template.promotionType,
    discountType: issuedCoupon.template.discountType,
    discountValue: issuedCoupon.template.discountValue,
    status: issuedCoupon.status,
    createdAt: issuedCoupon.createdAt,
    expiresAt: issuedCoupon.template.endDate
  })
}

export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Get merchant profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchantProfile: true }
  })

  if (!user?.merchantProfile) {
    return new NextResponse("Merchant profile not found", { status: 404 })
  }

  // Get coupon ID from request body
  const { id } = await request.json()

  if (!id) {
    return new NextResponse("Coupon ID is required", { status: 400 })
  }

  // Find issued coupon
  const issuedCoupon = await prisma.issuedCoupon.findUnique({
    where: { id },
    include: {
      template: true
    }
  })

  if (!issuedCoupon) {
    return new NextResponse("Coupon not found", { status: 404 })
  }

  // Verify coupon belongs to this merchant
  if (issuedCoupon.template.merchantId !== user.merchantProfile.id) {
    return new NextResponse("This coupon is not issued by your business", { status: 403 })
  }

  // Update coupon status to used
  await prisma.issuedCoupon.update({
    where: { id },
    data: {
      status: "used",
      usedAt: new Date()
    }
  })

  return new NextResponse("Coupon successfully redeemed", { status: 200 })
} 