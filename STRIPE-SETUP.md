# Stripe Payment Notifications Setup

## What This Does

Automatically notifies you via Discord + WhatsApp when someone pays for BCP, and tags them as "BCP Member" in Kit.

## Setup Steps

### 1. Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
3. Add to Vercel env vars:
   ```
   STRIPE_SECRET_KEY=sk_...
   ```

### 2. Create Webhook in Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://apply.boundlesscreator.com/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Vercel env vars:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 3. Add Required Env Vars to Vercel

Make sure these are set in Vercel:

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
DISCORD_WEBHOOK_DASHBOARD=https://discord.com/api/webhooks/...
KIT_API_KEY=...
KIT_TAG_MEMBER=8240961

# Optional (for WhatsApp notifications)
OPENCLAW_GATEWAY_URL=https://your-gateway.com
OPENCLAW_GATEWAY_TOKEN=...
```

### 4. Test It

1. Run a test payment in Stripe (use test mode first)
2. Check Discord #dashboard for notification
3. Check Kit to confirm "BCP Member" tag was applied

## What Gets Sent

**Discord Message:**
```
💰 New BCP Payment Received!

Amount: USD $3,500.00
Email: customer@example.com
Name: John Doe
Type: Checkout Session
Time: 2026-02-13T19:52:00.000Z

✅ Customer should be automatically tagged as "BCP Member" in Kit.
```

**WhatsApp Message:**
```
💰 NEW BCP PAYMENT!

Amount: USD $3,500.00
Email: customer@example.com
Name: John Doe
Time: Feb 13, 2026, 2:52 PM EST
```

## Troubleshooting

**No notification received:**
- Check Stripe webhook logs: https://dashboard.stripe.com/webhooks
- Check Vercel function logs
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

**Kit tagging fails:**
- Verify `KIT_API_KEY` is correct
- Verify `KIT_TAG_MEMBER` ID (8240961) exists in Kit
- Check Vercel function logs for Kit API errors

**WhatsApp not working:**
- WhatsApp requires OpenClaw gateway integration
- If not configured, only Discord notifications will work
