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
CRON_SECRET=1337
DISCORD_CHANNEL_ID=your_bcp_server_channel_id
```

**Important:** Update `lib/automation/discord.ts` line 2 with your BCP server's channel ID where you want invites generated from (typically #general or #welcome).

### 2. OpenClaw WhatsApp Relay

Run the setup script on the VPS:

```bash
cd /home/hazel/.openclaw/workspace
bash scripts/setup-whatsapp-relay.sh
```

This creates a systemd service that:
- Listens on port 18791
- Receives POST `{phone, message}`
- Sends via `openclaw message send` CLI
- Exposed via Tailscale Serve at `/api/whatsapp-relay`

**Control the service:**
```bash
sudo systemctl status whatsapp-relay   # Check status
sudo systemctl restart whatsapp-relay  # Restart
sudo journalctl -u whatsapp-relay -f   # View logs
```

### 3. Cal.com Webhook

1. Go to Cal.com → Settings → Webhooks  
2. Add new webhook:
   - URL: `https://apply.boundlesscreator.com/api/automation/cal-webhook`
   - Trigger: Booking Created
   - Save

**Note:** This webhook fires for ALL bookings on your Cal.com account, not just BCP applicants. That's fine - the code checks if the email exists in Kit before applying the "BCP Call Booked" tag. Non-BCP bookings will be safely ignored (no subscriber found = no tag applied).

### 4. Deploy

```bash
git add .
git commit -m "Add token-free automation system"
git push
```

Vercel auto-deploys. Cron starts running immediately.

## Cron Schedule

**Vercel Free Plan:** No built-in crons
**Solution:** Use [cron-job.org](https://cron-job.org) (free) to ping the endpoint every 5 minutes

**Setup on cron-job.org:**
1. Create account (free)
2. New cron job:
   - **Title:** Kit Cron
   - **URL:** `https://apply.boundlesscreator.com/api/automation/kit`
   - **Schedule:** Every 5 minutes
   - **Advanced → Request Headers:**
     - Key: `Authorization`
     - Value: `Bearer 1337` (your CRON_SECRET)
3. Save and enable

**To temporarily disable automation:**
- Pause the cron job on cron-job.org (big pause button)
- Re-enable when ready to test/launch

**To test manually:**
```bash
curl -H "Authorization: Bearer 1337" \
  https://apply.boundlesscreator.com/api/automation/kit
```

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

**After (Vercel Free + cron-job.org + WhatsApp relay):**
- Vercel hosting: $0 (free tier)
- cron-job.org: $0 (free tier, pings Vercel every 5 min)
- Automation logic: $0 (just API calls, no LLM)
- WhatsApp relay: ~$0.05/day (only when actually sending, minimal tokens)
- **Total: ~$1.50/month**

Saves ~$70/month in token costs.

**Note:** Vercel Free plan doesn't support built-in crons, but cron-job.org is free and works perfectly.

## Troubleshooting

**"Unauthorized" error:** Check `CRON_SECRET` matches in Vercel and cron-job.org

**WhatsApp not sending:** Verify `OPENCLAW_WHATSAPP_WEBHOOK` is correct and OpenClaw relay is working

**Discord invites fail:** Check `DISCORD_BOT_TOKEN` has permission to create invites in #welcome channel

**No new applicants detected:** Verify Kit tag IDs are correct (15754298 for applicants, 8240961 for members)
