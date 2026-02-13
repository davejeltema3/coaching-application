# Kit BCP Member Notifications Setup

## What This Does

Automatically notifies you via Discord + WhatsApp when someone gets tagged as "BCP Member" in Kit (tag ID 8240961).

**Benefits:**
- ✅ Works for Stripe, PayPal, manual invoices, or any payment method
- ✅ One source of truth: Kit tag = member
- ✅ Simpler than Stripe webhooks
- ✅ Doesn't matter how they pay, only that they're tagged

## Setup Steps

### 1. Create Webhook in Kit

1. Go to https://app.kit.com/account_settings/webhooks
2. Click **Create Webhook**
3. **Webhook URL:** `https://apply.boundlesscreator.com/api/webhooks/kit-member`
4. **Event:** Select **"Subscriber is tagged"**
5. **Tag:** Select **"BCP Member"** (tag ID 8240961)
6. Click **Create Webhook**

That's it! No secrets or API keys needed.

### 2. Verify Env Vars in Vercel

These should already be set:

```bash
DISCORD_WEBHOOK_DASHBOARD=https://discord.com/api/webhooks/...

# Optional (for WhatsApp notifications)
OPENCLAW_GATEWAY_URL=https://your-gateway.com
OPENCLAW_GATEWAY_TOKEN=...
```

### 3. Test It

**Manually tag someone in Kit:**
1. Go to your Kit subscribers
2. Find a test subscriber
3. Add the "BCP Member" tag
4. Check Discord #dashboard for notification

**Or wait for real payment:**
- When Stripe payment succeeds, manually tag them in Kit
- Notification will fire automatically

## What Gets Sent

**Discord Message:**
```
🎉 New BCP Member!

Email: customer@example.com
Name: John
Tagged: Feb 13, 2026, 2:54 PM EST

✅ They were automatically tagged as "BCP Member" in Kit.

Next steps:
- Send welcome DM/email
- Add to Discord server
- Schedule onboarding call
```

**WhatsApp Message:**
```
🎉 NEW BCP MEMBER!

Email: customer@example.com
Name: John
Time: Feb 13, 2026, 2:54 PM EST

Next: Send welcome + add to Discord
```

## How to Tag Members After Payment

### Option 1: Manual (Current)
1. Stripe payment succeeds
2. You manually add "BCP Member" tag in Kit
3. Notification fires automatically

### Option 2: Zapier (Future)
1. Set up Zap: Stripe Payment → Kit Tag
2. Fully automated

### Option 3: Kit Commerce (Future)
If you use Kit's built-in payment system, tagging happens automatically.

## Troubleshooting

**No notification received:**
- Check Kit webhook logs in Kit dashboard
- Verify webhook URL is correct
- Check Vercel function logs

**Wrong tag triggering notifications:**
- Webhook checks for tag ID 8240961 specifically
- Only "BCP Member" tag will fire notifications
