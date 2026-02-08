# Coaching Application Form

A custom application form for Dave Jeltema's 1:1 YouTube coaching program. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Typeform-style UX**: One question at a time with smooth transitions
- **Dark theme**: Modern, professional design
- **Keyboard navigation**: Enter to advance, A/B/C/D or 1/2/3/4 to select
- **Smart qualification**: Server-side scoring to determine fit
- **Mobile-first**: Fully responsive design
- **Google Forms integration**: Optional backup to Google Sheets
- **Local backup**: All submissions saved to `data/submissions.json`
- **UTM tracking**: Captures marketing attribution

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel (deployment)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:

- `CAL_BOOKING_URL`: Your Cal.com booking link
- Google Forms fields (optional, see setup below)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Google Forms Integration (Optional)

To automatically submit applications to a Google Sheet:

1. Create a Google Form with matching questions
2. View the form's HTML source (right-click → View Page Source)
3. Find the form action URL: `<form action="https://docs.google.com/forms/u/0/d/e/[FORM_ID]/formResponse"`
4. Find field entry IDs: `<input name="entry.123456789"`
5. Add these to your `.env.local` file

Example:
```
GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/u/0/d/e/1FAIpQLSexample/formResponse
GOOGLE_FORM_FIELD_FIRST_NAME=entry.123456789
GOOGLE_FORM_FIELD_EMAIL=entry.987654321
```

## Qualification Logic

Applicants are scored based on their answers:

- **Active creator = No**: Instant disqualification
- **Investment ready = No**: Instant disqualification  
- **Time commitment = Not sure**: Instant disqualification
- **Duration**: 6+ months = +1 point
- **Subscribers**: 100+ = +1 point
- **Goal**: Full-time/business = +1 point

**Qualification threshold**: Score ≥ 3 AND no disqualifications

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables in Production

Add all environment variables in the Vercel dashboard under Settings → Environment Variables.

## Project Structure

```
app/
├── page.tsx                 # Main application form
├── layout.tsx              # Root layout with metadata
├── globals.css             # Global styles and animations
└── api/
    └── submit/
        └── route.ts        # Form submission API

components/
├── WelcomeScreen.tsx       # Initial welcome screen
├── QuestionCard.tsx        # Question container
├── MultipleChoice.tsx      # Multiple choice UI
├── TextInput.tsx          # Text/URL input fields
├── ContactForm.tsx        # Contact information form
├── ProgressBar.tsx        # Top progress indicator
└── ThankYouScreen.tsx     # Success/rejection screens

lib/
├── questions.ts           # Question definitions
└── qualification.ts       # Scoring logic

data/
└── submissions.json       # Local backup (auto-created)
```

## Customization

### Colors

Edit `tailwind.config.ts` or update className values:
- Background: `bg-slate-950`
- Cards: `bg-slate-900`
- Accent: `bg-blue-600`

### Questions

Modify `lib/questions.ts` to add/remove/edit questions.

### Qualification Rules

Update scoring logic in `lib/qualification.ts`.

## License

Private - Dave Jeltema / Boundless Creator
