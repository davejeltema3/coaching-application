# Payment Plans Fix - Limited Subscriptions

## What Was Wrong

The 2-month and 3-month payment plans created Stripe subscriptions that would charge **indefinitely** until manually cancelled. The `total_payments` metadata was stored but Stripe didn't use it to stop billing.

## Current Status

⚠️ **Partially Fixed - Manual Tracking Required**

- **Checkout API** (`/api/checkout/route.ts`) flags recurring payments with `needs_schedule: 'true'` and stores `total_payments` in metadata
- **Stripe Webhook** (`/api/webhooks/stripe/route.ts`) logs payment plan subscriptions to Vercel logs
- **Auto-cancellation** not yet implemented - needs manual tracking for now

The Stripe SDK version (20.3.1) doesn't support the newer API features for auto-canceling subscriptions after X payments. We need to either upgrade the SDK or build a custom payment tracker.

## How It Works (Current Implementation)

1. Customer selects a payment plan (e.g., "2 Monthly Payments")
2. Checkout creates a subscription with metadata:
   - `needs_schedule: 'true'`
   - `total_payments: '2'` (or 3, 6, etc.)
   - `plan_code`, `payment_option`, `duration`
3. Webhook receives `checkout.session.completed` event
4. Webhook logs subscription details to Vercel logs
5. **Manual step:** You need to track when to cancel the subscription

## Temporary Workaround

Until auto-cancellation is built:

**Option 1: Manual Tracking**
- Check Vercel logs after each payment plan purchase
- Set a calendar reminder to cancel the subscription after X months
- Cancel in Stripe dashboard: Subscriptions → [ID] → Cancel

**Option 2: Monitor Stripe Dashboard**
- Visit: https://dashboard.stripe.com/subscriptions
- Filter by metadata: `needs_schedule: true`
- Check `total_payments` in metadata
- Count invoices and cancel when limit reached

**Option 3: Build Custom Tracker (recommended)**
- Create a cron job that checks active subscriptions
- Count successful invoices for each subscription
- Auto-cancel when invoice count == `total_payments`

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

## Permanent Fix (TODO)

To fully automate payment plan cancellations:

**Option A: Upgrade Stripe SDK**
```bash
npm install stripe@latest
```
Then use Subscription Schedules API with proper phase configurations.

**Option B: Invoice Webhook Tracker**
Create a new webhook handler:
1. Listen to `invoice.payment_succeeded` events
2. Count invoices for each subscription (store in database or metadata)
3. When count reaches `total_payments`, cancel the subscription

**Option C: Cron Job Monitor**
Build a daily/weekly cron:
1. Fetch all active subscriptions with `needs_schedule: true`
2. Count paid invoices for each (via Stripe API)
3. Cancel subscriptions that have reached their limit

## What Happens to Existing Subscriptions?

**CRITICAL:** Any subscriptions created before proper automation are still charging indefinitely!

Since you don't have anyone on payment plans yet, this isn't an issue. When someone signs up for a payment plan, you'll need to manually track it or build one of the automation options above.

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
