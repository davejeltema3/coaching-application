# Deployment Checklist

## Pre-Deployment

- [x] All files created and working
- [x] Build passes successfully
- [x] TypeScript compilation successful
- [x] Development server runs without errors

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Coaching application form"
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
CAL_BOOKING_URL=https://cal.com/davejeltema/coaching-call
```

**Optional (Google Forms Integration):**
```
GOOGLE_FORM_ACTION_URL=https://docs.google.com/forms/u/0/d/e/[YOUR_FORM_ID]/formResponse
GOOGLE_FORM_FIELD_FIRST_NAME=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_LAST_NAME=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_EMAIL=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_PHONE=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_CHANNEL_URL=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_CHALLENGE=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_ACTIVE_CREATOR=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_DURATION=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_SUBSCRIBERS=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_GOAL=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_INVESTMENT_READY=entry.XXXXXXXXX
GOOGLE_FORM_FIELD_TIME_COMMITMENT=entry.XXXXXXXXX
NOTIFICATION_EMAIL=hello@boundlesscreator.com
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain: `apply.boundlesscreator.com`
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Post-Deployment Testing

### Test the Full Flow

1. **Welcome Screen**
   - [ ] Loads properly
   - [ ] "Start Application" button works

2. **Question Flow**
   - [ ] Progress bar updates correctly
   - [ ] All 8 questions display properly
   - [ ] Keyboard navigation works (Enter, number keys, letter keys)
   - [ ] Multiple choice selections work
   - [ ] Text inputs work (challenge, channel URL)

3. **Disqualification Paths**
   - [ ] "No" to active creator → Unqualified screen
   - [ ] "Not right now" to investment → Unqualified screen
   - [ ] "Not sure" to time commitment → Unqualified screen

4. **Qualified Path**
   - [ ] Score >= 3 → Qualified screen
   - [ ] Cal.com link displays and works
   - [ ] Email link works

5. **Contact Form**
   - [ ] All fields required
   - [ ] Email validation works
   - [ ] Phone field displays WhatsApp note
   - [ ] Submit button enables/disables correctly

6. **Form Submission**
   - [ ] Data submits successfully
   - [ ] Thank you screen displays
   - [ ] Google Forms receives data (if configured)
   - [ ] Local backup creates `data/submissions.json`

7. **Mobile Testing**
   - [ ] Test on phone/tablet
   - [ ] Touch targets are large enough
   - [ ] Text is readable
   - [ ] Progress bar visible
   - [ ] Forms are usable

8. **UTM Tracking**
   - [ ] Test URL: `?utm_source=test&utm_medium=email&utm_campaign=launch`
   - [ ] Check if UTM data appears in submissions

## Monitoring

### Check Submissions

1. **Local Backup**: `data/submissions.json` (download from Vercel logs)
2. **Google Sheet**: Check your connected Google Form responses
3. **Vercel Logs**: Dashboard → Deployments → [Latest] → Runtime Logs

### Analytics

Consider adding:
- Google Analytics
- Vercel Analytics (built-in)
- Conversion tracking for qualified vs unqualified

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Node version (should use Node 18+)

### Form Not Submitting
- Check browser console for errors
- Verify API route is accessible: `/api/submit`
- Check Vercel function logs

### Google Forms Not Working
- Verify form URL and field IDs
- Test Google Form manually
- Check CORS settings (Google Forms should accept cross-origin requests)

### Styling Issues
- Clear browser cache
- Check for CSS conflicts
- Verify Tailwind classes are being compiled

## Maintenance

### Regular Checks
- Monitor submission rate
- Check for spam submissions
- Review unqualified applicant feedback
- Update questions/scoring as needed

### Updates
```bash
# Update dependencies
npm update

# Test locally
npm run build
npm run dev

# Deploy
git add .
git commit -m "Update dependencies"
git push
```

## Success Criteria

- [ ] Application loads in under 2 seconds
- [ ] Mobile experience is smooth
- [ ] Form submissions work 100% of the time
- [ ] Qualified applicants can book calls
- [ ] All data is captured (Google Forms + local backup)
- [ ] No console errors on any step
