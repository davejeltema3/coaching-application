# BCP Application

Application, payment, and onboarding flow for the Boundless Creator Program. Built with Next.js 14, TypeScript, Tailwind CSS, Stripe, and Kit.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Application form (Typeform-style, one question at a time) |
| `/checkout?plan=CODE` | Payment page (Stripe Checkout) |
| `/welcome` | Post-payment confirmation + Kit tagging |
| `/preview` | **Preview all screens** — see every page without going through the live flow |

### Plan Codes

| Code | Tier | Price |
|------|------|-------|
| `3mo` | 3-month Starter | $3,500 |
| `3mo-plus` | 3-month + Deep Dive | $6,000 |
| `6mo` | 6-month Standard | $5,800 |
| `6mo-plus` | 6-month Premium | $9,600 |

## How It Works

1. **Application** (`/`) — Applicant answers questions, gets scored server-side
2. **Qualified** → Redirected to Cal.com to book a sales call
3. **Sales call** → Dave sends payment link from proposal
4. **Payment** (`/checkout?plan=CODE`) → Stripe Checkout → `/welcome`
5. **Welcome** → Verifies payment, tags Kit with "BCP Member", shows next steps
6. **Kit automation** → "BCP Member" tag triggers welcome email with Discord invite

## Integrations

- **Stripe** — Payment processing (one-time + subscription payment plans)
- **Kit (ConvertKit)** — Subscriber management + tagging (BCP Applicant, BCP Member)
- **Google Forms** — Application data → Google Sheets
- **Cal.com** — Scheduling for qualified applicants

## Environment Variables

```
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Kit
KIT_API_KEY=kit_...
KIT_TAG_ID=15754298              # BCP Applicant tag
KIT_BCP_MEMBER_TAG_ID=8240961   # BCP Member tag (optional, hardcoded fallback)

# Cal.com
CAL_BOOKING_URL=https://cal.com/davejeltema/bcp-1

# Google Forms (see field IDs in .env.example)
GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/d/e/.../formResponse
GOOGLE_FORM_FIELD_*=entry.XXXXXXXXX
```

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Qualification Logic

- **Disqualifiers**: Not an active creator / Not ready to invest / Not sure about time
- **Scoring**: Duration 6+ months (+1), Subscribers 100+ (+1), Goal = full-time (+1)
- **Threshold**: Score ≥ 3 AND no disqualifications

## Customization

- **Questions**: `lib/questions.ts`
- **Scoring**: `lib/qualification.ts`
- **Plan tiers/pricing**: `lib/plans.ts`
- **Colors**: Tailwind classes (slate-950 bg, blue-600 accent)

## Deployment

Hosted on Netlify. Auto-deploys from `main` branch.

---

Private — Dave Jeltema / Boundless Creator
