-- 用户表 (与 Auth.js 集成)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'merchant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 商家信息表
CREATE TABLE merchant_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  business_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  location JSONB, -- 存储经纬度 {lat: number, lng: number}
  images TEXT[], -- 存储图片URL数组
  points_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 优惠券分类表
CREATE TABLE coupon_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 优惠券模板表
CREATE TABLE coupon_templates (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchant_profiles(id),
  category_id TEXT REFERENCES coupon_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- percentage, fixed, buy_one_get_one
  discount_value DECIMAL,
  points_price INTEGER NOT NULL,
  total_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 已发行优惠券表
CREATE TABLE issued_coupons (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES coupon_templates(id),
  user_id TEXT REFERENCES users(id),
  pass_code TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 充值码表
CREATE TABLE recharge_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  points INTEGER NOT NULL,
  merchant_id TEXT REFERENCES merchant_profiles(id),
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 交易记录表
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL, -- points_purchase, coupon_purchase, coupon_redemption
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 