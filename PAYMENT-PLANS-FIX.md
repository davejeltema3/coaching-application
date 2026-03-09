# Payment Plans Fix - Limited Subscriptions

## What Was Wrong

The 2-month and 3-month payment plans created Stripe subscriptions that would charge **indefinitely** until manually cancelled. The `total_payments` metadata was stored but Stripe didn't use it to stop billing.

## What's Fixed

- **Checkout API** (`/api/checkout/route.ts`) now flags recurring payments with `needs_schedule: 'true'`
- **Stripe Webhook** (`/api/webhooks/stripe/route.ts`) converts subscriptions to schedules after checkout completes
- **Subscription Schedules** automatically cancel after the specified number of payments

## How It Works

1. Customer selects a payment plan (e.g., "2 Monthly Payments")
2. Checkout creates a regular subscription with metadata flag
3. Webhook receives `checkout.session.completed` event
4. Webhook converts subscription to a subscription schedule with:
   - `iterations: X` (number of payments)
   - `end_behavior: 'cancel'` (auto-cancel when done)
5. After X payments, Stripe automatically cancels the subscription

## Setup Required

### 1. Configure Webhook Endpoint in Stripe

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://apply.boundlesscreator.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted` (optional, for logging)
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_...`)

### 2. Add Webhook Secret to Environment

In your deployment environment (Vercel):

1. Go to: https://vercel.com/boundless-creator/coaching-application/settings/environment-variables
2. Add variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (the signing secret from step 1)
3. Redeploy the application

### 3. Test the Fix

**IMPORTANT:** Test this with Stripe test mode first!

1. Go to: https://dashboard.stripe.com (make sure you're in TEST mode)
2. Create a test checkout for a payment plan
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Check the subscription in Stripe:
   - Go to **Customers** → find the customer → **Subscriptions**
   - You should see a **Schedule** badge
   - Click the subscription → **Schedule** tab
   - Verify it shows "Will cancel after X payments"

## Affected Payment Plans

All of these now properly auto-cancel after X payments:

- **3mo**: 2-month plan ($2,000/mo × 2)
- **3mo-plus**: 2-month plan ($3,500/mo × 2)
- **3mo-plus**: 3-month plan ($2,500/mo × 3)
- **6mo**: 2-month plan ($3,300/mo × 2)
- **6mo**: 3-month plan ($2,400/mo × 3)
- **6mo-plus**: 2-month plan ($5,500/mo × 2)
- **6mo-plus**: 3-month plan ($4,000/mo × 3)
- **6mo-plus**: 6-month plan ($2,000/mo × 6)

## What Happens to Existing Subscriptions?

**CRITICAL:** Any subscriptions created before this fix are still charging indefinitely!

Since you don't have anyone on payment plans yet, this isn't an issue. But if you did, you would need to manually:

1. Find active subscriptions in Stripe
2. Create schedules for them with the correct `iterations`
3. Attach the subscriptions to those schedules

## Verification

After deploying and configuring the webhook:

```bash
# Check webhook is receiving events
curl https://dashboard.stripe.com/test/logs

# Or use Stripe CLI to test locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Next Steps

1. ✅ Code is fixed and ready to deploy
2. ⏳ Configure webhook in Stripe dashboard
3. ⏳ Add `STRIPE_WEBHOOK_SECRET` to Vercel environment
4. ⏳ Deploy to production
5. ⏳ Test with Stripe test mode
6. ✅ Go live with confidence

---

**Status:** Ready for Stripe webhook configuration and deployment.
