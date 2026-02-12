import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { FormData } from '@/lib/questions';
import { calculateQualification } from '@/lib/qualification';

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json();

    // Calculate qualification server-side
    const qualification = calculateQualification(data);

    // Submit to Google Forms if configured
    if (process.env.GOOGLE_FORM_ACTION_URL) {
      try {
        await submitToGoogleForms(data, qualification);
      } catch (error) {
        console.error('Google Forms submission error:', error);
        // Continue even if Google Forms fails
      }
    }

    // Subscribe to Kit (ConvertKit) if configured
    if (process.env.KIT_API_KEY && data.email && data.first_name) {
      try {
        await subscribeToKit(data.email, data.first_name, {
          phone: data.phone,
          channel_url: data.channel_url,
          challenge: data.challenge,
          content_type: data.content_type,
          target_audience: data.target_audience,
          program_goals: data.program_goals,
          qualified: qualification.qualified,
          score: qualification.score,
        });
      } catch (error) {
        console.error('Kit API error:', error);
        // Continue even if Kit fails
      }
    }

    // Save to local backup
    try {
      await saveSubmission(data, qualification);
    } catch (error) {
      console.error('Local save error:', error);
      // Continue even if local save fails
    }

    // Return qualification result
    return NextResponse.json({
      qualified: qualification.qualified,
      score: qualification.score,
      calBookingUrl: process.env.CAL_BOOKING_URL || 'https://cal.com/davejeltema/bcp-1',
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

interface KitExtraData {
  phone?: string;
  channel_url?: string;
  challenge?: string;
  content_type?: string;
  target_audience?: string;
  program_goals?: string;
  qualified?: boolean;
  score?: number;
}

async function subscribeToKit(email: string, firstName: string, extra?: KitExtraData) {
  const apiKey = process.env.KIT_API_KEY;
  const tagId = process.env.KIT_TAG_ID;
  
  if (!apiKey) return;

  // Step 1: Create or update the subscriber with custom fields
  const subResponse = await fetch('https://api.kit.com/v4/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiKey,
    },
    body: JSON.stringify({
      email_address: email,
      first_name: firstName,
      fields: {
        ...(extra?.phone ? { phone: extra.phone } : {}),
        ...(extra?.channel_url ? { youtube_channel: extra.channel_url } : {}),
        ...(extra?.challenge ? { core_problem: extra.challenge } : {}),
        ...(extra?.content_type ? { content_type: extra.content_type } : {}),
        ...(extra?.target_audience ? { target_audience: extra.target_audience } : {}),
        ...(extra?.program_goals ? { program_goals: extra.program_goals } : {}),
      },
    }),
  });

  if (!subResponse.ok) {
    console.error('Kit subscriber creation failed:', await subResponse.text());
    return;
  }

  // Step 2: Tag the subscriber with "BCP Applicant" (all applicants)
  if (tagId) {
    const tagResponse = await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': apiKey,
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (!tagResponse.ok) {
      console.error('Kit tagging failed:', await tagResponse.text());
    }
  }

  // Step 3: Tag with qualification-specific tag
  // Qualified → "BCP Applicant Qualified" (triggers booking nudge sequence)
  // Unqualified → "BCP Applicant Unqualified" (triggers free resources sequence)
  const qualTagId = extra?.qualified
    ? (process.env.KIT_TAG_QUALIFIED || '15773880')
    : (process.env.KIT_TAG_UNQUALIFIED || '15773881');

  const qualTagResponse = await fetch(`https://api.kit.com/v4/tags/${qualTagId}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiKey,
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (!qualTagResponse.ok) {
    console.error('Kit qualification tagging failed:', await qualTagResponse.text());
  }
}

async function submitToGoogleForms(data: FormData, qualification: { qualified: boolean; score: number }) {
  const formUrl = process.env.GOOGLE_FORM_ACTION_URL;
  if (!formUrl) return;

  // Build form data with Google Forms field entry IDs
  const formData = new URLSearchParams();

  const fieldMap: Record<string, string | undefined> = {
    first_name: process.env.GOOGLE_FORM_FIELD_FIRST_NAME,
    last_name: process.env.GOOGLE_FORM_FIELD_LAST_NAME,
    email: process.env.GOOGLE_FORM_FIELD_EMAIL,
    phone: process.env.GOOGLE_FORM_FIELD_PHONE,
    channel_url: process.env.GOOGLE_FORM_FIELD_CHANNEL_URL,
    challenge: process.env.GOOGLE_FORM_FIELD_CHALLENGE,
    active_creator: process.env.GOOGLE_FORM_FIELD_ACTIVE_CREATOR,
    duration: process.env.GOOGLE_FORM_FIELD_DURATION,
    subscribers: process.env.GOOGLE_FORM_FIELD_SUBSCRIBERS,
    monetized: process.env.GOOGLE_FORM_FIELD_MONETIZED,
    content_type: process.env.GOOGLE_FORM_FIELD_CONTENT_TYPE,
    target_audience: process.env.GOOGLE_FORM_FIELD_TARGET_AUDIENCE,
    goal: process.env.GOOGLE_FORM_FIELD_GOAL,
    program_goals: process.env.GOOGLE_FORM_FIELD_PROGRAM_GOALS,
    upload_schedule: process.env.GOOGLE_FORM_FIELD_UPLOAD_SCHEDULE,
    investment_ready: process.env.GOOGLE_FORM_FIELD_INVESTMENT_READY,
  };

  // Add each field to form data
  Object.entries(fieldMap).forEach(([key, entryId]) => {
    const value = data[key as keyof FormData];
    if (entryId && value) {
      formData.append(entryId, value);
    }
  });

  // Add qualification results
  if (process.env.GOOGLE_FORM_FIELD_QUALIFIED) {
    formData.append(process.env.GOOGLE_FORM_FIELD_QUALIFIED, qualification.qualified ? 'Yes' : 'No');
  }
  if (process.env.GOOGLE_FORM_FIELD_SCORE) {
    formData.append(process.env.GOOGLE_FORM_FIELD_SCORE, qualification.score.toString());
  }
  if (process.env.GOOGLE_FORM_FIELD_CALL_BOOKED) {
    formData.append(process.env.GOOGLE_FORM_FIELD_CALL_BOOKED, 'No');
  }

  // Submit to Google Forms
  await fetch(formUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

async function saveSubmission(
  data: FormData,
  qualification: { qualified: boolean; score: number }
) {
  const dataDir = join(process.cwd(), 'data');
  const filePath = join(dataDir, 'submissions.json');

  // Ensure data directory exists
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  // Read existing submissions
  let submissions: any[] = [];
  if (existsSync(filePath)) {
    const content = await readFile(filePath, 'utf-8');
    submissions = JSON.parse(content);
  }

  // Add new submission
  submissions.push({
    timestamp: new Date().toISOString(),
    data,
    qualification,
  });

  // Write back to file
  await writeFile(filePath, JSON.stringify(submissions, null, 2));
}
