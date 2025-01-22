# Flow

1. 玩家玩游戏获得积分，可以在游戏外购买，或者叫兑换 coupon。
2. 玩家有了 coupon 优惠券之后。在个人账户的资产下面会显示已经兑换的这个 coupon。
3. coupon 的基本信息：
   1. 发行商家
   2. 优惠券的名称
   3. 优惠券的描述
   4. 优惠券的类型
   5. 优惠券的折扣
   6. 优惠券的过期时间
4. coupon 本身是有状态的：未使用、已使用、已过期。
5. 用户（玩家）登录自己的账户显示出未使用优惠券。点击显示二维码和这个 pass code。
6. 然后玩家到店铺出示这个商家看，商家可以扫描也可以手工输入这个 Pass code 在他登录的商家管理后台。
7. 这就完成了一次 coupon 的使用。
8. 那对于商家来说，他是的二个重要角色。
9. 商家登陆网站点击商家注册。用 EMAIL 注册账户。
10. 有两个主要功能第 1 个，发行优惠券。发行的时候要选择发行的类别和购买的数量。要初始化 coupon 的基本信息
11. 还有一个是核销优惠券。需要输入 pass code 或者二维码扫描。然后核销这个优惠券。
12. 发行和核销优惠券现在是由中心化的核销服务商提供。未来在去中心化。

## 系统设计

### 商家管理后台

#### 注册和登陆

  首页 Email 注册，（同时获得 account 地址，todo）
  验证 email code，或者直接 email 内容链接跳转登陆

#### 商家介绍  

  商家名称、商家介绍、商家位置、商家图片集合
  可以修改，至少三张图片
  提供基于地图的位置

#### 积分充值

  目前仅仅支持现金购买线下交易
  线下管理员/运营人员收到现金，提供充值码
  商家输入充值码，完成积分购买

#### 发行优惠券页面

  自动填写优惠券发行商家
  选择优惠券类型
  选择优惠券折扣等信息（依赖不同优惠券类型）
  选择优惠券发行数量
  选择优惠券开始和过期时间
  选择优惠券发行价格（以积分计算）
  提交，检查商家积分余额，支付积分，提交成功
  
#### 已发行优惠券展示页面

  展示已发行优惠券列表
  展示优惠券状态：未使用、已使用、已过期
  展示优惠券使用情况（百分比）
  展示优惠券过期时间
  展示优惠券折扣
  展示优惠券发行商家
  展示优惠券发行数量
  展示优惠券开始和过期时间
  展示优惠券发行价格（以积分计算）

#### 核销优惠券页面

  前提：（优惠券发行后，玩家积分兑换获得优惠券）
  商家获得玩家提供的凭证，页面输入 passcode 或者二维码扫描
  点击核销优惠券
  核销后，优惠券状态变为已使用


### 优惠券状态整理

1. 优惠券模板，是系统设置的元数据，目前涵盖常规的 90% 促销方法  
2. 商家选择不同模板（促销类型），商家可以自定义优惠券的折扣、优惠券的开始和过期时间、优惠券的发行价格（以积分计算），但不可以定义 basepoints(模板元数据），sell price  
3. 选择优惠券发行数量，提交，检查商家积分余额，支付积分，提交成功后发行 ok 
4. 商家发行优惠券后，优惠券状态变为已发行  
5. 玩家积分兑换获得优惠券，优惠券状态变为已兑换（未使用）  
6. 商家核销优惠券，商家输入 passcode 或者二维码扫描，点击核销优惠券，优惠券状态变为已使用  
7. 商家可以查看已使用优惠券，可以查看已使用优惠券的 部分 passcode
8. 玩家购买后，优惠券有数量


确认发行数量的存储情况：
发行数量存储在 CouponTemplate 表中：
totalQuantity：发行总量
remainingQuantity：剩余可售数量
当商家创建新优惠券时：
在 app/merchant/coupons/new/page.tsx 中，通过表单收集 totalQuantity 值
初始时 remainingQuantity 等于 totalQuantity
每当玩家购买优惠券时，remainingQuantity 会减 1
在商家的优惠券详情页面 (app/merchant/coupons/[id]/page.tsx) 中显示：
Total Quantity：显示发行总量
Remaining：显示剩余可售数量
Used：显示已使用数量
这个设计确保了优惠券数量的准确追踪，包括：
发行总量
已售出数量（通过 totalQuantity - remainingQuantity 计算）
剩余可售数量
已使用数量（通过统计状态为 "used" 的 IssuedCoupon 记录）

 
### 玩家管理后台
不提供注册登陆，未来和其他系统集成
展示积分余额（虚假功能）
已兑换 Coupon
点击 coupon，显示二维码和 passcode
显示商家介绍：位置、商家名称、商家介绍，图片集合

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const promotionTypes = [
  {
    type: "PINDUODUO_GROUP_BUYING",
    name: "拼团购",
    basePoints: 50,
    affect: "price",
    calculate: "multi",
    description: "多人拼单享受折扣",
    defaultNum: 0.7,        // 7 折
    requirePeopleNum: 3     // 需要 3 人成团
  },
  {
    type: "PINDUODUO_DIRECT_REDUCTION",
    name: "直接优惠",
    basePoints: 30,
    affect: "price",
    calculate: "subtract",
    description: "直减固定金额",
    defaultNum: 20          // 直减 20 元
  },
  {
    type: "TAOBAO_FULL_MINUS",
    name: "满减优惠",
    basePoints: 40,
    affect: "total_order",
    calculate: "subtract",
    description: "满足条件减固定金额",
    defaultNum: 50,         // 减 50 元
    condition: 200          // 满 200 元
  },
  {
    type: "TAOBAO_COUPON",
    name: "店铺优惠券",
    basePoints: 35,
    affect: "price",
    calculate: "subtract",
    description: "使用积分兑换的代金券",
    defaultNum: 10,         // 减 10 元
    payType: "积分",
    payNum: 100            // 需要 100 积分
  },
  {
    type: "AMAZON_PERCENTAGE_OFF",
    name: "折扣优惠",
    basePoints: 45,
    affect: "price",
    calculate: "multi",
    description: "按比例折扣",
    defaultNum: 0.85        // 85 折
  },
  {
    type: "AMAZON_BUNDLE_SALE",
    name: "捆绑销售",
    basePoints: 55,
    affect: "total_order",
    calculate: "multi",
    description: "多件商品打包优惠",
    defaultNum: 0.9,        // 9 折
    condition: 2            // 需要买 2 件
  },
  {
    type: "EBAY_DAILY_DEAL",
    name: "限时特价",
    basePoints: 60,
    affect: "price",
    calculate: "multi",
    description: "特定时间段内的折扣",
    defaultNum: 0.6,        // 6 折
    timeLimit: true
  },
  {
    type: "EBAY_COUPON_CODE",
    name: "优惠码",
    basePoints: 40,
    affect: "total_order",
    calculate: "subtract",
    description: "使用特定代码享受优惠",
    defaultNum: 15,         // 减 15 元
    payType: "积分"
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
  }) ase "AMAZON_BUNDLE_SALE":
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
  // 拼团购示例：3 人成团享受 7 折
  groupBuying: {
    type: "PINDUODUO_GROUP_BUYING",
    name: "拼团购",
    affect: "price",
    calculate: "multi",
    num: 0.7,
    require_people_num: 3,
    description: "3 人成团享 7 折优惠"
  } as GroupBuyingPromotion,

  // 直接优惠示例：直减 20 元
  directReduction: {
    type: "PINDUODUO_DIRECT_REDUCTION",
    name: "直接优惠",
    affect: "price",
    calculate: "subtract",
    num: 20,
    description: "立减 20 元"
  } as DirectReductionPromotion,

  // 满减示例：满 200 减 50
  fullMinus: {
    type: "TAOBAO_FULL_MINUS",
    name: "满减优惠",
    affect: "total_order",
    calculate: "subtract",
    num: 50,
    condition: 200,
    description: "满 200 元减 50 元"
  } as FullMinusPromotion,

  // 店铺优惠券示例：100 积分兑换 10 元优惠券
  storeCoupon: {
    type: "TAOBAO_COUPON",
    name: "店铺优惠券",
    affect: "price",
    calculate: "subtract",
    num: 10,
    pay_type: "积分",
    pay_num: 100,
    description: "100 积分兑换 10 元优惠券"
  } as StoreCouponPromotion,

  // 折扣示例：85 折优惠
  percentageOff: {
    type: "AMAZON_PERCENTAGE_OFF",
    name: "折扣优惠",
    affect: "price",
    calculate: "multi",
    num: 0.85,
    description: "全场 85 折"
  } as PercentageOffPromotion,

  // 捆绑销售示例：买 2 件 9 折
  bundleSale: {
    type: "AMAZON_BUNDLE_SALE",
    name: "捆绑销售",
    affect: "total_order",
    calculate: "multi",
    num: 0.9,
    condition: 2,
    description: "买 2 件享 9 折"
  } as BundleSalePromotion,

  // 限时特价示例：限时 6 折
  dailyDeal: {
    type: "EBAY_DAILY_DEAL",
    name: "限时特价",
    affect: "price",
    calculate: "multi",
    num: 0.6,
    time_limit: true,
    description: "限时 6 折特惠"
  } as DailyDealPromotion,

  // 优惠码示例：减 15 元
  couponCode: {
    type: "EBAY_COUPON_CODE",
    name: "优惠码",
    affect: "total_order",
    calculate: "subtract",
    num: 15,
    pay_type: "积分",
    description: "使用优惠码减 15 元"
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
console.log(`原价：${price}，买 2 件后：${bundleSaleDiscount}`) // 输出：原价：100，买 2 件后：90
*/  EBAY_COUPON_CODE = {  
        "name": "优惠码",  
        "affect": "total_order",   
        "calculate": "subtract",  
        "num": 15,  # 减 15 元  
        "pay_type": "积分",  # 支付类型
        "pay_num": 0,  # 支付积分数量，发布时设置更改，优惠码默认是优惠券已经支付过积分，因此默认 0
        "description": "使用特定优惠码享受优惠"  
    }
# 使用示例  
promo = PromotionType.PINDUODUO_GROUP_BUYING  
print(f"促销类型：{promo.name}")  
print(f"折扣力度：{promo.value['num'] * 100}%")


创建了一个完整的优惠券类型系统，包括数据模型和计算方法。让我为你详细解释每种优惠券类型：
拼团购 (PINDUODUO_GROUP_BUYING)
特点：需要达到指定人数才能享受折扣
参数：
num: 折扣比例（如 0.7 表示 7 折）
require_people_num: 所需人数
计算方式：price * num（达到人数要求时）
直接优惠 (PINDUODUO_DIRECT_REDUCTION)
特点：直接减去固定金额
参数：
num: 减免金额
计算方式：price - num
3. 满减优惠 (TAOBAO_FULL_MINUS)
特点：订单满足特定金额时减免固定金额
参数：
num: 减免金额
condition: 满足金额条件
计算方式：price - num（满足条件时）
店铺优惠券 (TAOBAO_COUPON)
特点：使用积分兑换的代金券
参数：
num: 优惠金额
pay_num: 兑换所需积分
计算方式：price - num
折扣优惠 (AMAZON_PERCENTAGE_OFF)
特点：按比例折扣
参数：
num: 折扣比例（如 0.85 表示 85 折）
计算方式：price * num
捆绑销售 (AMAZON_BUNDLE_SALE)
特点：购买多件商品时享受折扣
参数：
num: 折扣比例
condition: 所需商品数量
计算方式：price * num（达到数量要求时）
限时特价 (EBAY_DAILY_DEAL)
特点：特定时间段内的折扣
参数：
num: 折扣比例
time_limit: 时间限制标志
计算方式：price * num（在有效时间内）
优惠码 (EBAY_COUPON_CODE)
特点：使用特定代码享受优惠
参数：
num: 优惠金额
计算方式：price - num
每种优惠券都包含基础属性：
name: 优惠券名称
affect: 影响范围（单品价格或订单总额）
calculate: 计算方式（乘法折扣或减法优惠）
description: 优惠描述
使用方法：
// 订单总额：250，优惠后：50
订单总额：250，优惠后：50
这个系统的优点是：
类型安全：使用 TypeScript 类型系统确保数据正确性
可扩展：易于添加新的优惠类型
统一接口：所有优惠券使用相同的计算接口
灵活配置：每种优惠类型都可以自定义参数

```
import { calculateDiscount, promotionExamples } from '@/lib/promotion-types'

// 计算拼团购优惠
const price = 100
const discount = calculateDiscount(promotionExamples.groupBuying, price, {
  peopleCount: 3
})
// 原价：100，优惠后：70

// 计算满减优惠
const totalOrder = 250
const discount2 = calculateDiscount(promotionExamples.fullMinus, price, {
  totalOrder
})
// 订单总额：250，优惠后：50
```


这个枚举不仅定义了促销类型，还包含了详细的促销信息和计算方式

 促销策略特点分析
1. 拼多多（Pinduoduo）
最具特色的是拼团购模式
强调社交电商和团购优惠
价格更低但需要多人参与
1. 淘宝（Taobao）
以满减和优惠券为主
灵活的优惠组合策略
注重用户黏性和复购
1. 亚马逊（Amazon）
强调直接的折扣和捆绑销售
更加标准化的促销模式
注重商品组合销售
1. eBay
限时特价和优惠码为主
国际化的促销策略
更多面向全球用户

#### 已发行优惠券展示页面

  展示已发行优惠券列表
  展示优惠券状态：未使用、已使用、已过期
  展示优惠券使用情况（百分比）
  展示优惠券过期时间
  展示优惠券折扣
  展示优惠券发行商家
  展示优惠券发行数量
  展示优惠券开始和过期时间
  展示优惠券发行价格（以积分计算）

#### 核销优惠券页面

  前提：（优惠券发行后，玩家积分兑换获得优惠券）
  商家获得玩家提供的凭证，页面输入 passcode 或者二维码扫描
  点击核销优惠券
  核销后，优惠券状态变为已使用

从优惠券类型的设置中提取折扣类型和值：
如果计算方式是 "multi"（乘法），表示是百分比折扣
如果计算方式是 "subtract"（减法），表示是固定金额折扣
对于百分比折扣，我们将折扣率转换为折扣百分比：
例如，0.7（7 折）转换为 30（30% off）
对于固定金额折扣，直接使用设置中的数值。
这样应该可以解决 discountType 和 discountValue 字段缺失的问题。请尝试再次创建优惠券。



### 玩家管理后台
不提供注册登陆，未来和其他系统集成
展示积分余额（虚假功能）
已兑换 Coupon
点击 coupon，显示二维码和 passcode
显示商家介绍：位置、商家名称、商家介绍，图片集合

1. 新增一个给 player 充值 1000 积分的 js 脚本，data 目录下
2. 新增一个类似于 merchant 的 transaction 入口，指向 player 所有的 points 消费记录，购买了哪个 coupon，链接到 coupon 详情页面
3. coupon 详情页面点击 redeem 后，检查 player points 余额，如果足够，则购买此 coupon，归于该 player 明显
4. player 页面，针对每个已经购买 coupon，显示 button：show QR/Passcode,点击后显示coupon的QR和passcode
5. 预期流程：player 购买每个 coupon 后，新增一条 coupon 记录在 player 名下，包括随机产生 8 位随机字母数字组合的 passcode，要关联到新购买 coupon
6. QR 产生来自于此 passcode 的 QR

                                                            
优惠券的发行和核销过程：
优惠券发行流程：
商家创建优惠券模板（CouponTemplate）
玩家购买优惠券时，系统会：
创建一个已发行优惠券（IssuedCoupon）记录
生成唯一的兑换码（passCode）
将优惠券与购买的玩家（User）关联
设置初始状态为 "unused"
优惠券状态：
unused：已购买但未使用
used：已使用（核销后的状态）
每个已发行的优惠券都有状态、使用时间（usedAt）等属性
核销流程：
商家输入优惠券兑换码
系统检查：
优惠券是否存在
是否属于该商家
是否已使用
是否已过期
核销成功后：
更新状态为 "used"
记录使用时间

### 发行和使用数据模型

```prisma
// 优惠券模板表 - coupon_templates
model CouponTemplate {
  id               String          @id
  merchantId       String          // 所属商家
  name            String          // 优惠券名称
  totalQuantity   Int             // 发行总量，例如10张
  remainingQuantity Int           // 剩余可售数量
  status          String          // 模板状态：active/inactive
  // ... 其他字段
  issuedCoupons   IssuedCoupon[]  // 关联到已发行的优惠券
}

// 已发行优惠券表 - issued_coupons
model IssuedCoupon {
  id          String         @id
  templateId  String         // 关联的模板ID
  userId      String         // 购买的用户ID
  passCode    String         // 唯一兑换码
  status      String         // 优惠券状态：unused/used
  usedAt      DateTime?      // 使用时间
  createdAt   DateTime       // 购买时间
}
```

### 状态流转示例

假设商家发行 10 张优惠券的场景：

```typescript
// 1. 商家创建优惠券模板
const template = {
  id: "ct_001",
  merchantId: "m_001",
  totalQuantity: 10,
  remainingQuantity: 10,
  status: "active"
}

// 2. 当 10 个不同用户购买时，会创建 10 条 IssuedCoupon 记录
const issuedCoupons = [
  {
    id: "ic_001",
    templateId: "ct_001",
    userId: "user_001",
    passCode: "ABCD1234",
    status: "unused",
    createdAt: "2024-01-20"
  },
  {
    id: "ic_002",
    templateId: "ct_001",
    userId: "user_002",
    passCode: "EFGH5678",
    status: "used",          // 已被核销
    usedAt: "2024-01-21",   // 核销时间
    createdAt: "2024-01-20"
  },
  // ... 其他 8 张优惠券记录
]
```

### 状态追踪
- 在 `CouponTemplate` 表中：
  - `totalQuantity` 记录发行总量（10）
  - `remainingQuantity` 记录剩余可售数量（每售出一张减 1）
  - `status` 记录模板状态（是否可继续售卖）

- 在 `IssuedCoupon` 表中：
  - 每张售出的优惠券都有独立记录
  - 每条记录都有自己的 `status`（unused/used）
  - 每条记录都有自己的 `passCode`（用于核销）
  - 核销时记录 `usedAt` 时间

### 数据关系

- 一个 `CouponTemplate` 可以有多个 `IssuedCoupon`（一对多）
- 每个 `IssuedCoupon` 必须属于一个 `CouponTemplate`（多对一）
- 每个 `IssuedCoupon` 属于一个 `User`（多对一）

### 状态变化
- 优惠券模板创建：`remainingQuantity = totalQuantity`
- 优惠券售出：`remainingQuantity -= 1`，创建 `IssuedCoupon` 记录（status = "unused"）
- 优惠券核销：更新对应 `IssuedCoupon` 记录（status = "used"，设置 usedAt）

### 安全性考虑
1. 商家只能看到优惠券的部分信息：
   - 用户名只显示前三个字符，其余用 *** 代替
   - 优惠券兑换码只显示后四位，其余用 **** 代替
2. 核销流程的安全性：
   - 商家无法直接获取完整的优惠券兑换码
   - 只有用户主动出示兑换码或二维码时才能核销
   - 每次核销都需要验证商家身份和优惠券所属关系

当用户购买优惠券时，系统会：
在 IssuedCoupon 中记录 buyPrice（等于购买时的 template.sellPrice）
在 Transaction 中记录交易详情，包括：
type: "buy_coupon"
amount: buyPrice quantity
quantity: 购买数量
couponId: 关联到优惠券模板
status: "completed"
这样我们就能完整地记录用户的购买历史和实际支付的价格。

### 优惠券购买流程详细设计

#### 数据库结构
```prisma
model CouponTemplate {
  id               String          @id
  merchantId       String          
  name            String          
  totalQuantity   Int             
  remainingQuantity Int           
  status          String          
  sellPrice       Int             // 玩家购买价格（积分）
  issuedCoupons   IssuedCoupon[]  
}

model IssuedCoupon {
  id          String         @id
  templateId  String        
  userId      String        
  passCode    String        @unique
  qrCode      String?       
  buyPrice    Int           // 记录购买时的价格
  status      String        @default("unused")
  usedAt      DateTime?     
  createdAt   DateTime      @default(now())
}

model Transaction {
  id          String   @id
  userId      String   
  type        String   // "buy_coupon"
  amount      Int      // 消费的积分数量
  couponId    String?  // 关联的优惠券模板
  status      String   // "completed"
}
```

#### 购买（redeem）流程
1. 前置检查：
   - 玩家积分余额是否足够（>= coupon.sellPrice）
   - 优惠券是否还有库存（remainingQuantity > 0）
   - 优惠券是否在有效期内
   - 玩家是否已经拥有该优惠券

2. 执行购买（使用数据库事务）：
   - 创建 IssuedCoupon 记录：
     * 生成唯一的 passCode（8 位随机字母数字）
     * 生成对应的 QR Code
     * 记录购买价格 buyPrice
     * 设置初始状态为 "unused"
   - 更新 CouponTemplate 的 remainingQuantity（-1）
   - 扣除玩家积分
   - 创建交易记录（Transaction）

3. 购买成功后：
   - 重定向到优惠券展示页面
   - 显示 QR Code 和 passCode
   - 提供优惠券使用说明

#### 安全性保障
- 使用数据库事务确保数据一致性
- 防止优惠券超卖
- 防止重复购买
- 确保积分余额充足


new coupon:
{
  name: string            // 来自表单输入
  description: string     // 来自表单输入
  categoryId: string      // 来自表单选择
  type: string           // 来自表单选择的优惠券类型
  settings: object       // 根据选择的 type 自动生成
  totalQuantity: number  // 来自表单输入
  startDate: Date       // 来自表单输入
  endDate: Date         // 来自表单输入
  publishPrice: number  // 自动从选择的 type 的 basePoints 获取
  sellPrice: number     // 固定为 30
  discountType: string  // 根据 settings.calculate 自动判断
  discountValue: number // 根据 settings.num 自动计算
}

----

redeem coupon 主要改进包括：
改进日期验证逻辑：
允许提前购买未开始的优惠券
购买未开始的优惠券时，添加友好提示信息
仍然阻止购买已过期的优惠券
添加更友好的错误处理：
使用 try/catch 捕获所有错误
将错误消息作为 URL 参数传递，而不是直接抛出
在页面上显示格式化的错误消息
改进状态显示：
显示完整的有效期（开始日期和结束日期）
添加黄色警告信息提示未开始的优惠券
添加红色错误信息提示已过期或库存不足的优惠券
改进按钮状态：
根据多个条件禁用按钮（积分不足、已过期、库存不足）
显示不同的按钮文本说明禁用原因
添加页面刷新：
使用 revalidatePath 确保页面数据更新
成功购买后重定向到显示页面，并携带提示信息
现在错误处理应该更加友好，用户体验也更好了。
