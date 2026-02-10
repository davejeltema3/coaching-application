# BCP Automation System (Token-Free)

This moves all automation logic out of OpenClaw cron jobs into Vercel, eliminating token costs for routine tasks.

## What Runs Where

### Vercel (Zero Tokens)
- Kit API polling for new applicants/members
- Discord invite generation
- Cal.com webhook (stops nudge sequence when call booked)
- All decision logic

### OpenClaw (Minimal Tokens)
- WhatsApp message relay only
- Receives `{phone, message}` → sends via whatsapp-web.js
- Uses cheapest model, no thinking required

## Setup

### 1. Environment Variables (Vercel)

Add these to Vercel project settings:

```
KIT_API_KEY=your_kit_v4_api_key
DISCORD_BOT_TOKEN=your_discord_bot_token_here
OPENCLAW_WHATSAPP_WEBHOOK=https://hazel.tail8491d6.ts.net/api/whatsapp-relay
CRON_SECRET=generate_a_random_string_here
```

### 2. OpenClaw WhatsApp Relay

Create an API endpoint in OpenClaw that:
- Accepts POST with `{phone, message}`
- Calls the WhatsApp message tool
- Returns 200 OK

Example minimal handler (add to OpenClaw):
```javascript
// POST /api/whatsapp-relay
const { phone, message } = req.body;
await messageTool({ action: 'send', channel: 'whatsapp', target: phone, message });
res.status(200).json({ sent: true });
```

### 3. Cal.com Webhook

1. Go to Cal.com → Settings → Webhooks
2. Add new webhook:
   - URL: `https://apply.boundlesscreator.com/api/automation/cal-webhook`
   - Trigger: Booking Created
   - Save

### 4. Deploy

```bash
git add .
git commit -m "Add token-free automation system"
git push
```

Vercel auto-deploys. Cron starts running immediately.

## Cron Schedule

**Vercel Hobby Plan:** Max 1 cron/day
**Vercel Pro ($20/mo):** Unlimited crons

If you're on Hobby, use [cron-job.org](https://cron-job.org) (free) to ping the endpoint every 5 minutes:

URL: `https://apply.boundlesscreator.com/api/automation/kit`
Header: `Authorization: Bearer YOUR_CRON_SECRET`

## What Gets Automated

### New Applicant Flow
1. Kit detects new subscriber with "BCP Applicant" tag
2. Sends WhatsApp to applicant: "Hey {name}! Thanks for applying..."
3. Sends WhatsApp to Dave with applicant details
4. Marks as processed (won't send again)

### New Member Flow
1. Kit detects new subscriber with "BCP Member" tag
2. Generates unique Discord invite (7 days, 1 use)
3. Sends WhatsApp to member with invite link
4. Sends WhatsApp to Dave with member details + invite
5. Marks as processed

### Cal.com Call Booked
1. Someone books a sales call
2. Webhook fires → applies "BCP Call Booked" tag
3. Kit sequence stops sending nudge emails

## State Management

Processed applicants/members are tracked in `data/automation-state.json`:

```json
{
  "processedApplicants": ["email1@example.com", ...],
  "processedMembers": ["email2@example.com", ...],
  "lastCheck": {
    "applicants": 1770698333000,
    "members": 1770698333000
  }
}
```

This file persists across deploys via Vercel's filesystem (ephemeral but survives function calls).

## Testing

Manually trigger the cron:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://apply.boundlesscreator.com/api/automation/kit
```

Expected response:
```json
{
  "newApplicants": 0,
  "newMembers": 0,
  "errors": []
}
```

## Cost Comparison

**Before (OpenClaw crons):**
- Applicant monitor: ~$0.20/day (Flash-Lite, 288 runs)
- Member monitor: ~$0.20/day
- Orchestrator: ~$2/day (Gemini 2.0 Flash, thinking overhead)
- **Total: ~$2.40/day = $72/month**

**After (Vercel + WhatsApp relay):**
- Vercel crons: $0 (just API calls)
- WhatsApp relay: ~$0.05/day (only when actually sending)
- **Total: ~$1.50/month**

Saves ~$70/month in token costs.

## Troubleshooting

**"Unauthorized" error:** Check `CRON_SECRET` matches in Vercel and cron-job.org

**WhatsApp not sending:** Verify `OPENCLAW_WHATSAPP_WEBHOOK` is correct and OpenClaw relay is working

**Discord invites fail:** Check `DISCORD_BOT_TOKEN` has permission to create invites in #welcome channel

**No new applicants detected:** Verify Kit tag IDs are correct (15754298 for applicants, 8240961 for members)
