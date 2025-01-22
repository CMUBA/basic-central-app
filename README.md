# Introduction

There are two branched you can use:
**main**: Business Coupon System for business to issue coupons and player to redeem coupons and write off it. It will be updated frequently.

**basic**: Initial version of the business coupon system, it is a basic authentication system, you can use it as a basic authentication system to develop your own application.

**nextauth**:Basic Authentication System using NextAuthjs, you can use it as a basic authentication system to develop your own application.


## Business Coupon System

A central application for managing coupons between merchants and players.
## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google OAuth credentials (https://console.cloud.google.com/apis/credentials)
- Google Maps API key (https://console.cloud.google.com/google/maps-apis/credentials)

## How to start

1. Clone the repository:
```bash
git clone <repository-url>
cd basic-central-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
- `DATABASE_URL`: Your PostgreSQL connection string
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: Google OAuth credentials
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY`: Google Maps API key
- `AUTH_SECRET`: Random string for session encryption

4. Set up the database:
```bash
# Push the database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

5. Initialize coupon categories:
```bash
npx tsx data/seed-categories.ts
```

6. Configure Google Maps API:
- Go to Google Cloud Console
- Navigate to your project
- Go to "APIs & Services" > "Credentials"
- Find your Maps API key
- Under "Application restrictions", set "HTTP referrers (websites)"
- Add the following URLs:
  ```
  http://localhost:3000/*
  http://localhost/*
  ```

7. Start the development server:
```bash
pnpm dev
```

## Initial Setup

After starting the server:

1. Sign in with your Google account
2. Choose your role:
   - Register as a merchant to create and manage coupons
   - Register as a player to browse and redeem coupons

3. For merchants:
   - Use recharge codes to get points for publishing coupons
   - Create coupon templates with various promotion types
   - Monitor coupon usage and points balance

4. For players:
   - Browse available coupons from different merchants
   - Use points to purchase coupons
   - View purchased coupons and their QR codes/passcodes

## Development Tools

The following scripts are available for development:

1. Recharge merchant points:
```bash
npx tsx data/recharge-merchants.ts
```

2. Recharge player points:
```bash
npx tsx data/recharge-players.ts
```

3. List users and their profiles:
```bash
npx tsx data/list-users.ts
```

4. List all coupons and their status:
```bash
npx tsx data/list-coupons.ts
```

## Directory Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable React components
- `/lib`: Utility functions and shared code
- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/data`: Development tools and scripts

## Features

### For Merchants
- Create and manage coupon templates
- Monitor coupon usage and redemption
- Track points balance and transactions
- View customer engagement metrics

### For Players
- Browse available coupons
- Purchase coupons with points
- View purchased coupons
- Access QR codes and passcodes

## Troubleshooting

1. Database Issues:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Run `npx prisma db push` to sync schema
   - For local development, you can use: `postgresql://postgres:postgres@localhost:5432/your_db_name`

2. Authentication Issues:
   - Get credentials from https://console.cloud.google.com/apis/credentials
   - Set up OAuth 2.0 Client ID with these redirect URIs:
     ```
     http://localhost:3000/auth/callback/google
     http://localhost:3000/auth/signin
     ```
   - Check AUTH_SECRET in .env (can be generated with `openssl rand -base64 32`)
   - Ensure redirect URIs are configured

3. Maps Issues:
   - Get API key from https://console.cloud.google.com/google/maps-apis/credentials
   - Enable these APIs in your project:
     * Maps JavaScript API
     * Places API
     * Geocoding API
   - Set up API key restrictions in Google Cloud Console
   - Ensure key has required permissions
