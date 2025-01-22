import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PROMOTION_DETAILS = {
  PINDUODUO_GROUP_BUYING: {
    title: "Group Buying Discount",
    description: "Leverage social connections to drive sales through group purchases",
    features: [
      "Customers get better discounts when buying in groups",
      "Encourages customers to invite friends and family",
      "Creates viral marketing effect",
      "Builds community around your brand"
    ],
    howItWorks: [
      "Set minimum group size (e.g., 3 people)",
      "Define discount percentage (e.g., 30% off)",
      "Customers form groups to qualify",
      "All group members get the discount once minimum size is reached"
    ],
    bestFor: [
      "Restaurants and cafes",
      "Entertainment venues",
      "Retail stores",
      "Beauty and wellness services"
    ],
    businessValue: [
      "Increased customer acquisition through word-of-mouth",
      "Higher order volume",
      "Reduced marketing costs",
      "Enhanced customer engagement"
    ],
    example: "A restaurant offers 30% off when 3 or more people join a group. This encourages friends and families to dine together, increasing table turnover and average order value."
  },
  PINDUODUO_DIRECT_REDUCTION: {
    title: "Direct Reduction",
    description: "Simple and straightforward discounts that apply immediately",
    features: [
      "Instant fixed amount discount",
      "No minimum purchase required",
      "Easy to understand and use",
      "Immediate gratification"
    ],
    howItWorks: [
      "Set fixed discount amount",
      "Applied directly at checkout",
      "No additional conditions required",
      "Can be combined with other promotions"
    ],
    bestFor: [
      "Small retail shops",
      "Quick service restaurants",
      "Service providers",
      "New businesses"
    ],
    businessValue: [
      "Quick sales boost",
      "Simple to manage",
      "Clear value proposition",
      "Attracts price-sensitive customers"
    ],
    example: "A cafe offers ¥20 off any purchase. This simple promotion helps attract new customers and encourages impulse purchases."
  },
  TAOBAO_FULL_MINUS: {
    title: "Spend & Save",
    description: "Encourage larger purchases with threshold-based discounts",
    features: [
      "Discount applies after reaching spending threshold",
      "Encourages larger purchases",
      "Flexible threshold and discount amounts",
      "Can be tiered for different spending levels"
    ],
    howItWorks: [
      "Set minimum spend threshold",
      "Define discount amount",
      "Customer must reach threshold to qualify",
      "Discount applied automatically at checkout"
    ],
    bestFor: [
      "Retail stores",
      "Online shops",
      "Luxury goods",
      "High-margin businesses"
    ],
    businessValue: [
      "Increased average order value",
      "Better profit margins",
      "Customer retention",
      "Inventory management"
    ],
    example: "A clothing store offers ¥50 off when spending ¥200 or more. This encourages customers to add more items to reach the threshold."
  },
  TAOBAO_COUPON: {
    title: "Store Coupon",
    description: "Build loyalty through points-based store coupons",
    features: [
      "Redeemable with loyalty points",
      "Store-wide applicability",
      "Flexible redemption period",
      "Builds customer loyalty"
    ],
    howItWorks: [
      "Customers earn points through purchases",
      "Points can be exchanged for coupons",
      "Coupons provide fixed discounts",
      "Valid for a specified period"
    ],
    bestFor: [
      "Chain stores",
      "Regular service providers",
      "Subscription-based businesses",
      "High-frequency purchases"
    ],
    businessValue: [
      "Customer retention",
      "Repeat business",
      "Data collection",
      "Brand loyalty"
    ],
    example: "A beauty salon offers a ¥10 discount coupon for 100 points, encouraging customers to return for services and earn more points."
  },
  AMAZON_PERCENTAGE_OFF: {
    title: "Percentage Discount",
    description: "Classic percentage-based discounts for all purchases",
    features: [
      "Fixed percentage discount",
      "Applies to all eligible items",
      "Easy to understand",
      "Scalable with purchase amount"
    ],
    howItWorks: [
      "Set discount percentage",
      "Applies to product or order total",
      "No minimum purchase required",
      "Instant calculation at checkout"
    ],
    bestFor: [
      "Department stores",
      "Fashion retailers",
      "Seasonal sales",
      "Clearance events"
    ],
    businessValue: [
      "Quick inventory turnover",
      "Broad appeal",
      "Easy to communicate",
      "Flexible implementation"
    ],
    example: "A fashion store offers 15% off all items, making it easy for customers to understand their savings on any purchase."
  },
  AMAZON_BUNDLE_SALE: {
    title: "Bundle Deal",
    description: "Encourage multiple item purchases with bundle discounts",
    features: [
      "Discount for buying multiple items",
      "Promotes cross-selling",
      "Volume-based savings",
      "Customizable bundle size"
    ],
    howItWorks: [
      "Set minimum item quantity",
      "Define bundle discount",
      "Customer must buy specified quantity",
      "Discount applies to entire bundle"
    ],
    bestFor: [
      "Retail stores",
      "Consumable products",
      "Complementary items",
      "Bulk purchases"
    ],
    businessValue: [
      "Higher units per transaction",
      "Inventory management",
      "Cross-product promotion",
      "Increased average order value"
    ],
    example: "A store offers 10% off when buying any 2 items, encouraging customers to explore more products."
  },
  EBAY_DAILY_DEAL: {
    title: "Flash Sale",
    description: "Create urgency with time-limited deep discounts",
    features: [
      "Limited-time offers",
      "Deeper discounts",
      "Creates urgency",
      "High visibility"
    ],
    howItWorks: [
      "Set time period",
      "Define special pricing",
      "Promote heavily during period",
      "Automatic expiration"
    ],
    bestFor: [
      "E-commerce",
      "Fashion retail",
      "Perishable goods",
      "Seasonal items"
    ],
    businessValue: [
      "Quick sales boost",
      "Inventory clearance",
      "Customer excitement",
      "Marketing opportunity"
    ],
    example: "A store offers 40% off for 24 hours only, creating excitement and driving immediate sales."
  },
  EBAY_COUPON_CODE: {
    title: "Promo Code",
    description: "Targeted discounts through promotional codes",
    features: [
      "Code-based activation",
      "Targeted distribution",
      "Trackable usage",
      "Flexible terms"
    ],
    howItWorks: [
      "Create unique codes",
      "Set discount amount",
      "Distribute to target audience",
      "Redeem at checkout"
    ],
    bestFor: [
      "Online businesses",
      "Marketing campaigns",
      "Influencer partnerships",
      "Customer win-back"
    ],
    businessValue: [
      "Targeted promotions",
      "Campaign tracking",
      "Customer acquisition",
      "Marketing analytics"
    ],
    example: "Use code 'WELCOME15' for ¥15 off your purchase, perfect for tracking marketing campaign effectiveness."
  }
}

export default function PromotionTypePage({ params }: { params: { type: string } }) {
  const details = PROMOTION_DETAILS[params.type as keyof typeof PROMOTION_DETAILS]
  
  if (!details) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{details.title}</CardTitle>
          <CardDescription>{details.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-1">
              {details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <ul className="list-decimal pl-6 space-y-1">
              {details.howItWorks.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Best For</h3>
            <ul className="list-disc pl-6 space-y-1">
              {details.bestFor.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Business Value</h3>
            <ul className="list-disc pl-6 space-y-1">
              {details.businessValue.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Example</h3>
            <p className="text-muted-foreground">{details.example}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 