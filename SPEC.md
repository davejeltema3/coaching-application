# Coaching Application Page — Build Spec

## Overview
A custom application form for Dave Jeltema's 1:1 YouTube coaching program. Replaces Typeform ($28/mo). Hosted on Vercel, accessed via `apply.boundlesscreator.com`.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **TypeScript**
- **Deployed to Vercel**

## Design
- **Typeform-style UX**: One question at a time, smooth transitions/animations
- **Dark theme** with clean, modern design
- **Branding**: "Boundless Creator" — Dave Jeltema
- **Colors**: Use a warm, professional palette. Dark background (#0f172a or similar), accent color for CTAs
- **Mobile-first** responsive design
- **Progress bar** showing how far through the application they are
- **Keyboard navigation** (Enter to advance, number keys to select options)

## Application Flow

### Screen 1: Welcome
- Headline: "Apply for 1:1 Coaching"
- Subtext: "Thanks for your interest in the Boundless Creator Program. This short application helps us figure out if we're a good fit. Takes about 2 minutes."
- Button: "Start Application →"

### Screen 2: Are you an active YouTube creator?
- Type: Multiple choice (Yes / No)
- If "No" → DISQUALIFY → jump to Unqualified screen
- If "Yes" → continue

### Screen 3: How long have you been creating on YouTube?
- Type: Multiple choice
- Options: Less than 6 months / 6-12 months / 1-2 years / More than 2 years
- Score: +0 / +1 / +1 / +1

### Screen 4: How many subscribers do you have?
- Type: Multiple choice
- Options: 0-99 / 100-1,000 / 1,001-5,000 / 5,000+
- Score: +0 / +1 / +1 / +1

### Screen 5: What is your primary goal with YouTube?
- Type: Multiple choice
- Options: "Turn it into a full-time career or significantly grow my business" / "It's more of a hobby or side project"
- Score: +1 / +0

### Screen 6: Are you prepared to invest in your growth?
- Type: Multiple choice
- Subtext: "The Boundless Creator Program is a serious investment in your channel's future."
- Options: "Yes, I'm ready to invest in my growth" / "Not right now"
- If "Not right now" → DISQUALIFY
- Score: +1 / DQ

### Screen 7: Are you ready to commit the time?
- Type: Multiple choice
- Subtext: "This program requires dedicating 5-10+ hours per week to your channel."
- Options: "Yes, I'm all in" / "I'm not sure I have the time"
- If "I'm not sure" → DISQUALIFY
- Score: +1 / DQ

### Screen 8: What's your biggest challenge?
- Type: Long text area
- Question: "What's the #1 biggest challenge you're facing with your YouTube channel right now?"
- Subtext: "Be as specific as possible — this helps me understand your situation before our call."

### Screen 9: Your YouTube Channel
- Type: URL input
- Question: "Link to your YouTube channel"

### Screen 10: Contact Information
- Fields:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated)
  - Phone Number (required — with note: "I'll reach out via WhatsApp to schedule our call")
- All fields on one screen

### Qualified Thank You Screen (score >= 3, no DQs)
- Headline: "You're a great fit! Let's talk."
- Subtext: "Based on your answers, I think we could do some amazing work together. Book a free strategy call below — I'll come prepared with insights specific to your channel."
- **Embed or link to Cal.com booking page** (configurable URL)
- Fallback: "Or reach out directly at hello@boundlesscreator.com"

### Unqualified Thank You Screen
- Headline: "Thanks for your interest!"
- Subtext: "Based on your answers, the 1:1 program might not be the best fit right now — and I'd rather be honest about that than take your money. Here are some free resources that can help you get to the next level:"
- Links to Dave's YouTube channel and newsletter
- "Keep creating — I hope we can work together in the future!"

## Backend

### Google Forms Integration
- On form submit, POST data to a Google Forms endpoint
- Store the Google Form action URL and field entry IDs in environment variables:
  - `GOOGLE_FORM_ACTION_URL` — the form's POST URL
  - `GOOGLE_FORM_FIELD_*` — entry IDs for each field
- This sends all data to a Google Sheet automatically
- Make this configurable so Dave can set it up later

### API Route: /api/submit
- Receives form data from the frontend
- Calculates qualification score server-side (don't trust client)
- Submits to Google Forms (if configured)
- Sends notification email to Dave (hello@boundlesscreator.com) — use a simple fetch to an email API or just log for now
- Returns { qualified: boolean, score: number }
- Also store submissions in a local JSON file as backup: `data/submissions.json`

### UTM Tracking
- Read UTM params from URL query string on page load
- Store in hidden fields, include in submission
- Fields: utm_source, utm_medium, utm_campaign

## Environment Variables
```
CAL_BOOKING_URL=https://cal.com/davejeltema/coaching-call
GOOGLE_FORM_ACTION_URL=
GOOGLE_FORM_FIELD_FIRST_NAME=
GOOGLE_FORM_FIELD_LAST_NAME=
GOOGLE_FORM_FIELD_EMAIL=
GOOGLE_FORM_FIELD_PHONE=
GOOGLE_FORM_FIELD_CHANNEL_URL=
GOOGLE_FORM_FIELD_CHALLENGE=
GOOGLE_FORM_FIELD_ACTIVE_CREATOR=
GOOGLE_FORM_FIELD_DURATION=
GOOGLE_FORM_FIELD_SUBSCRIBERS=
GOOGLE_FORM_FIELD_GOAL=
GOOGLE_FORM_FIELD_INVESTMENT_READY=
GOOGLE_FORM_FIELD_TIME_COMMITMENT=
NOTIFICATION_EMAIL=hello@boundlesscreator.com
```

## Important Notes
- NO pricing on this page (pricing is discussed on the sales call)
- The qualification scoring happens server-side for security
- The page should load FAST — optimize for performance
- Include a favicon and proper meta tags (og:title, og:description for social sharing)
- Title: "Apply — Boundless Creator Program"
- Include a subtle "Powered by Boundless Creator" footer
