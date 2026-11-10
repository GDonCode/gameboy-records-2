# Deploying Gameboy Records to Hostinger

The site is a Next.js app with a server: accounts, Club Points, the cart, checkout and the WooCommerce
webhook all run on it. It needs **Hostinger Node.js hosting** (Business or Cloud plans, "Node.js Web App")
or a **Hostinger VPS**. Shared hosting that only serves static files can't run it.

## 1. Before the first deploy

1. **Supabase:** run every file in `supabase/migrations/` (oldest first) in the Supabase SQL editor.
   The newest, `20261104_orders.sql`, adds the `orders` table used by My orders and Club Points for purchases.
2. **WooCommerce + Tapstitch:**
   - In WordPress, install WooCommerce and connect Tapstitch to the store (Tapstitch → Stores → WooCommerce).
     Publish your products from Tapstitch; they appear in WooCommerce with a **Size** attribute and variations.
     Give each product a category (`T-Shirts`, `Hoodies`, `Sweatpants`) and, if you like, a single **Color** term,
     so the shop filters pick them up.
   - Set up payment gateways in WooCommerce → Settings → Payments (e.g. Stripe or PayPal).
   - WooCommerce → Settings → Advanced → REST API → **Add key**, permissions **Read/Write**.
     Copy the consumer key and secret into `WOOCOMMERCE_CONSUMER_KEY` / `WOOCOMMERCE_CONSUMER_SECRET`.
   - WooCommerce → Settings → Advanced → Webhooks → **Add webhook**:
     Status *Active*, Topic *Order updated*, Delivery URL `https://<your-domain>/api/webhooks/woocommerce`,
     Secret = a long random string, also set as `WOOCOMMERCE_WEBHOOK_SECRET`.
3. Fill in every variable from `.env.example`.

Until `WOOCOMMERCE_URL` is set the shop shows the in-house catalogue (`lib/products.ts`); until the REST
keys are set, Checkout tells members it's being connected and keeps their cart.

## 2. Hostinger Node.js Web App (hPanel)

1. hPanel → Websites → **Add website → Node.js Web App** → import this GitHub repository.
2. Build settings:
   - Node version: **20** or **22**
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Output directory: `.next`
3. Environment variables: add everything from `.env.example`.
4. Deploy. Point the domain at the app and enable SSL in hPanel.

## 3. Hostinger VPS (alternative)

```bash
git clone https://github.com/GDonCode/gameboy-records-2.git && cd gameboy-records-2
cp .env.example .env.local   # then fill it in
npm ci && npm run build
npx pm2 start "npm run start -- -p 3000" --name gameboy-records   # behind Nginx with SSL
```

## 4. Launch checklist

- [ ] Remove `SITE_PASSWORD` (this also opens `robots.txt` to search engines)
- [ ] `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` match the live domain
- [ ] Place a test order end to end: cart → WooCommerce payment page → order shows under My orders → Club Points added
- [ ] Replace `public/assets/placeholder.jpg` with real photography (every use is marked "This is a placeholder image")
- [ ] Add show dates in `lib/shows.ts`
