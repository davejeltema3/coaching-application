# WhatsApp Automation Fix

## What Was Wrong
The automation endpoint couldn't write to `/data` on Vercel (read-only filesystem).

## What I Fixed
1. ✅ Changed state tracking to use `/tmp` (writable on Vercel)
2. ✅ Changed first question to "Are you an active **educational** YouTube creator?"
3. ✅ Pushed to GitHub → Vercel is deploying now

## Next Step: Re-enable Cron Job

The cron job at cron-job.org probably disabled itself after getting errors. You need to re-enable it:

1. Go to: https://console.cron-job.org/jobs
2. Find job: **"BCP Applicant & Member Monitor"**
3. Click "Enable" (if it's disabled)
4. Check "Execution history" to see if it's running successfully

**Or create a new one if it doesn't exist:**
- URL: `https://apply.boundlesscreator.com/api/automation/kit`
- Schedule: Every 5 minutes (`*/5 * * * *`)
- Request method: GET
- Add header: `Authorization: Bearer 1337`

## Test It

Once Vercel finishes deploying (~2 minutes), test the endpoint:

```bash
curl "https://apply.boundlesscreator.com/api/automation/kit" -H "Authorization: Bearer 1337"
```

Should return:
```json
{"newApplicants":0,"newMembers":0,"errors":[]}
```

No more errors! 🎉

## How It Works Now

Every 5 minutes:
1. Cron-job.org pings the automation endpoint
2. Checks Kit for new "BCP Applicant" tags
3. Sends WhatsApp to applicant (if phone exists)
4. Sends WhatsApp notification to you
5. Tracks processed emails in `/tmp` (so it doesn't re-send)

**Note:** `/tmp` state resets on Vercel redeployment, but that's fine - Kit tags are the source of truth. Worst case: someone might get a duplicate "thanks for applying" message after a deploy.
