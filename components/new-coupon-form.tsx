"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MerchantProfile, CouponCategory } from "@prisma/client"

interface NewCouponFormProps {
  categories: CouponCategory[]
  promotionTypes: {
    type: string
    name: string
    affect: string
    calculate: string
    num: number
    require_people_num?: number
    condition?: number
    pay_type?: string
    description: string
    basePoints: number
  }[]
  merchant?: {
    id: string
    pointsBalance: number
  }
  defaultDates: {
    startDate: string
    endDate: string
  }
  onSubmit: (formData: FormData) => Promise<void>
}

export default function NewCouponForm({ 
  categories, 
  promotionTypes,
  merchant, 
  defaultDates, 
  onSubmit 
}: NewCouponFormProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [publishCost, setPublishCost] = useState<number>(0)

  // Log promotion types when component mounts
  useEffect(() => {
    console.log('Promotion Types in component:', promotionTypes)
  }, [promotionTypes])

  // Calculate publish cost when type or quantity changes
  useEffect(() => {
    if (selectedType) {
      const promotionType = promotionTypes.find(pt => pt.type === selectedType)
      console.log('Selected promotion type:', promotionType)
      if (promotionType) {
        const cost = promotionType.basePoints * quantity
        console.log('Calculating cost:', { 
          type: selectedType,
          basePoints: promotionType.basePoints, 
          quantity, 
          cost 
        })
        setPublishCost(cost)
      }
    } else {
      setPublishCost(0)
    }
  }, [selectedType, quantity, promotionTypes])

  const handleTypeChange = (type: string) => {
    console.log('Type changed to:', type)
    const promotionType = promotionTypes.find(pt => pt.type === type)
    console.log('Selected promotion type data:', promotionType)
    setSelectedType(type)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10) || 1 // Default to 1 instead of 0
    console.log('Quantity changed to:', value)
    setQuantity(Math.max(1, value)) // Ensure minimum value is 1
  }

  return (
    <form action={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Issue New Coupon</CardTitle>
          <CardDescription>
            Create a new coupon template for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Coupon Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="categoryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Promotion Type</Label>
            <Select name="type" onValueChange={handleTypeChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a promotion type" />
              </SelectTrigger>
              <SelectContent>
                {promotionTypes.map((promotionType) => (
                  <SelectItem key={promotionType.type} value={promotionType.type}>
                    {promotionType.name} ({promotionType.basePoints} points)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-sm text-muted-foreground">
                {promotionTypes.find(pt => pt.type === selectedType)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalQuantity">Total Quantity</Label>
            <Input 
              id="totalQuantity" 
              name="totalQuantity" 
              type="number" 
              min="1" 
              value={quantity.toString()} // Convert to string to avoid NaN warning
              onChange={handleQuantityChange}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishCost">Publish Cost (Total Points)</Label>
            <Input 
              id="publishCost" 
              name="publishCost" 
              type="number" 
              value={publishCost.toString()} // Convert to string to avoid NaN warning
              readOnly
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Total points needed: {publishCost} (Your balance: {merchant?.pointsBalance ?? 0} points)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input 
              id="startDate" 
              name="startDate" 
              type="datetime-local"
              defaultValue={defaultDates?.startDate?.slice(0, 16)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input 
              id="endDate" 
              name="endDate" 
              type="datetime-local"
              defaultValue={defaultDates?.endDate?.slice(0, 16)}
              required 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={publishCost > (merchant?.pointsBalance ?? 0)}
          >
            Create Coupon
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
} 