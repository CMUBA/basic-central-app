// 优惠券基础类型
export type PromotionBase = {
  name: string
  affect: "price" | "total_order"
  calculate: "multi" | "subtract"
  description: string
}

// 拼团购 - 多人拼单享受折扣
export type GroupBuyingPromotion = PromotionBase & {
  type: "PINDUODUO_GROUP_BUYING"
  num: number // 折扣比例，如 0.7 表示 7 折
  require_people_num: number // 所需人数
}

// 直接优惠 - 直减固定金额
export type DirectReductionPromotion = PromotionBase & {
  type: "PINDUODUO_DIRECT_REDUCTION"
  num: number // 直减金额
}

// 满减优惠 - 满足条件减固定金额
export type FullMinusPromotion = PromotionBase & {
  type: "TAOBAO_FULL_MINUS"
  num: number // 减免金额
  condition: number // 满足金额条件
}

// 店铺优惠券 - 使用积分兑换的代金券
export type StoreCouponPromotion = PromotionBase & {
  type: "TAOBAO_COUPON"
  num: number // 优惠金额
  pay_type: "积分"
  pay_num: number // 所需积分
}

// 折扣优惠 - 按比例折扣
export type PercentageOffPromotion = PromotionBase & {
  type: "AMAZON_PERCENTAGE_OFF"
  num: number // 折扣比例，如 0.85 表示 85 折
}

// 捆绑销售 - 多件商品打包优惠
export type BundleSalePromotion = PromotionBase & {
  type: "AMAZON_BUNDLE_SALE"
  num: number // 折扣比例，如 0.9 表示 9 折
  condition: number // 所需商品数量
}

// 限时特价 - 特定时间段内的折扣
export type DailyDealPromotion = PromotionBase & {
  type: "EBAY_DAILY_DEAL"
  num: number // 折扣比例，如 0.6 表示 6 折
  time_limit: true
}

// 优惠码 - 使用特定代码享受优惠
export type CouponCodePromotion = PromotionBase & {
  type: "EBAY_COUPON_CODE"
  num: number // 优惠金额
  pay_type: "积分"
}

// 所有优惠类型的联合类型
export type PromotionType =
  | GroupBuyingPromotion
  | DirectReductionPromotion
  | FullMinusPromotion
  | StoreCouponPromotion
  | PercentageOffPromotion
  | BundleSalePromotion
  | DailyDealPromotion
  | CouponCodePromotion

// 优惠计算函数
export function calculateDiscount(
  promotion: PromotionType,
  price: number,
  options?: {
    totalOrder?: number
    peopleCount?: number
    itemCount?: number
    currentTime?: Date
  }
): number {
  switch (promotion.type) {
    case "PINDUODUO_GROUP_BUYING":
      if (!options?.peopleCount || options.peopleCount < promotion.require_people_num) {
        return price // 人数不足，无法享受优惠
      }
      return price * promotion.num

    case "PINDUODUO_DIRECT_REDUCTION":
      return price - promotion.num

    case "TAOBAO_FULL_MINUS":
      if (!options?.totalOrder || options.totalOrder < promotion.condition) {
        return price // 未满足条件，无法享受优惠
      }
      return price - promotion.num

    case "TAOBAO_COUPON":
      return price - promotion.num

    case "AMAZON_PERCENTAGE_OFF":
      return price * promotion.num

    case "AMAZON_BUNDLE_SALE":
      if (!options?.itemCount || options.itemCount < promotion.condition) {
        return price // 商品数量不足，无法享受优惠
      }
      return price * promotion.num

    case "EBAY_DAILY_DEAL":
      if (!options?.currentTime) {
        return price // 无法验证时间，不能享受优惠
      }
      return price * promotion.num

    case "EBAY_COUPON_CODE":
      return price - promotion.num

    default:
      return price
  }
}

// 优惠券使用示例
export const promotionExamples = {
  // 拼团购示例：3人成团享受7折
  groupBuying: {
    type: "PINDUODUO_GROUP_BUYING",
    name: "拼团购",
    affect: "price",
    calculate: "multi",
    num: 0.7,
    require_people_num: 3,
    description: "3人成团享7折优惠"
  } as GroupBuyingPromotion,

  // 直接优惠示例：直减20元
  directReduction: {
    type: "PINDUODUO_DIRECT_REDUCTION",
    name: "直接优惠",
    affect: "price",
    calculate: "subtract",
    num: 20,
    description: "立减20元"
  } as DirectReductionPromotion,

  // 满减示例：满200减50
  fullMinus: {
    type: "TAOBAO_FULL_MINUS",
    name: "满减优惠",
    affect: "total_order",
    calculate: "subtract",
    num: 50,
    condition: 200,
    description: "满200元减50元"
  } as FullMinusPromotion,

  // 店铺优惠券示例：100积分兑换10元优惠券
  storeCoupon: {
    type: "TAOBAO_COUPON",
    name: "店铺优惠券",
    affect: "price",
    calculate: "subtract",
    num: 10,
    pay_type: "积分",
    pay_num: 100,
    description: "100积分兑换10元优惠券"
  } as StoreCouponPromotion,

  // 折扣示例：85折优惠
  percentageOff: {
    type: "AMAZON_PERCENTAGE_OFF",
    name: "折扣优惠",
    affect: "price",
    calculate: "multi",
    num: 0.85,
    description: "全场85折"
  } as PercentageOffPromotion,

  // 捆绑销售示例：买2件9折
  bundleSale: {
    type: "AMAZON_BUNDLE_SALE",
    name: "捆绑销售",
    affect: "total_order",
    calculate: "multi",
    num: 0.9,
    condition: 2,
    description: "买2件享9折"
  } as BundleSalePromotion,

  // 限时特价示例：限时6折
  dailyDeal: {
    type: "EBAY_DAILY_DEAL",
    name: "限时特价",
    affect: "price",
    calculate: "multi",
    num: 0.6,
    time_limit: true,
    description: "限时6折特惠"
  } as DailyDealPromotion,

  // 优惠码示例：减15元
  couponCode: {
    type: "EBAY_COUPON_CODE",
    name: "优惠码",
    affect: "total_order",
    calculate: "subtract",
    num: 15,
    pay_type: "积分",
    description: "使用优惠码减15元"
  } as CouponCodePromotion
}

// 使用示例
/*
// 计算拼团购优惠
const price = 100
const groupBuyingDiscount = calculateDiscount(promotionExamples.groupBuying, price, {
  peopleCount: 3
})
console.log(`原价：${price}，拼团后：${groupBuyingDiscount}`) // 输出：原价：100，拼团后：70

// 计算满减优惠
const totalOrder = 250
const fullMinusDiscount = calculateDiscount(promotionExamples.fullMinus, price, {
  totalOrder
})
console.log(`订单总额：${totalOrder}，优惠后：${fullMinusDiscount}`) // 输出：订单总额：250，优惠后：50

// 计算捆绑销售优惠
const bundleSaleDiscount = calculateDiscount(promotionExamples.bundleSale, price, {
  itemCount: 2
})
console.log(`原价：${price}，买2件后：${bundleSaleDiscount}`) // 输出：原价：100，买2件后：90
*/ 