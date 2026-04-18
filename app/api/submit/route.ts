import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { FormData } from '@/lib/questions';
import { calculateQualification, QualificationResult } from '@/lib/qualification';

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json();

    // Calculate qualification (now includes AI evaluation)
    const qualification = await calculateQualification(data);

    // Submit to Google Forms if configured
    if (process.env.GOOGLE_FORM_ACTION_URL) {
      try {
        await submitToGoogleForms(data, qualification);
      } catch (error) {
        console.error('Google Forms submission error:', error);
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
      }
    }

    // Send Discord notification for qualified applications
    if (qualification.qualified) {
      try {
        await sendDiscordNotification(data, qualification);
      } catch (error) {
        console.error('Discord notification error:', error);
      }
    }

    // Save to local backup
    try {
      await saveSubmission(data, qualification);
    } catch (error) {
      console.error('Local save error:', error);
    }

    return NextResponse.json({
      qualified: qualification.qualified,
      score: qualification.score,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

// ── Discord Notification ──────────────────────────────────────────────

async function sendDiscordNotification(data: FormData, qualification: QualificationResult) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const stats = qualification.channelVerified?.stats;
  const ai = qualification.aiEvaluation;

  const embed = {
    title: '🔔 Qualified BCP Application',
    color: 0x22c55e, // green
    fields: [
      { name: 'Name', value: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown', inline: true },
      { name: 'Email', value: data.email || 'N/A', inline: true },
      { name: 'Phone', value: data.phone || 'N/A', inline: true },
      { name: 'Channel', value: data.channel_url ? `[View Channel](${data.channel_url})` : 'N/A', inline: false },
      ...(stats ? [
        { name: 'Videos', value: `${stats.videoCount} total (${stats.recentVideoCount} recent)`, inline: true },
        { name: 'Avg Views', value: `${Math.round(stats.averageViews).toLocaleString()}`, inline: true },
        { name: 'Best Video', value: `${stats.maxViews.toLocaleString()} views`, inline: true },
      ] : []),
      { name: 'Content Type', value: data.content_type || 'N/A', inline: false },
      { name: 'Biggest Challenge', value: truncate(data.challenge || 'N/A', 200), inline: false },
      ...(ai ? [
        { name: `AI Assessment (${ai.confidence})`, value: ai.reasoning, inline: false },
      ] : []),
    ],
    timestamp: new Date().toISOString(),
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.substring(0, max - 3) + '...';
}

// ── Kit (ConvertKit) ──────────────────────────────────────────────────

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

// ── Google Forms ──────────────────────────────────────────────────────

async function submitToGoogleForms(data: FormData, qualification: QualificationResult) {
  const formUrl = process.env.GOOGLE_FORM_ACTION_URL;
  if (!formUrl) return;

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

  Object.entries(fieldMap).forEach(([key, entryId]) => {
    const value = data[key as keyof FormData];
    if (entryId && value) {
      formData.append(entryId, value);
    }
  });

  // Add qualification results
  if (process.env.GOOGLE_FORM_FIELD_QUALIFIED) {
    formData.append(process.env.GOOGLE_FORM_FIELD_QUALIFIED, qualification.qualified ? '✓' : '✗');
  }
  if (process.env.GOOGLE_FORM_FIELD_SCORE) {
    formData.append(process.env.GOOGLE_FORM_FIELD_SCORE, qualification.score.toString());
  }

  // Add AI evaluation to the sheet
  if (process.env.GOOGLE_FORM_FIELD_AI_EVAL && qualification.aiEvaluation) {
    const ai = qualification.aiEvaluation;
    const evalText = `[${ai.confidence.toUpperCase()}] ${ai.reasoning}`;
    formData.append(process.env.GOOGLE_FORM_FIELD_AI_EVAL, evalText);
  }

  if (process.env.GOOGLE_FORM_FIELD_CALL_BOOKED) {
    formData.append(process.env.GOOGLE_FORM_FIELD_CALL_BOOKED, '');
  }
  if (process.env.GOOGLE_FORM_FIELD_OUTREACH_SENT) {
    formData.append(process.env.GOOGLE_FORM_FIELD_OUTREACH_SENT, '');
  }
  if (process.env.GOOGLE_FORM_FIELD_STATUS) {
    formData.append(process.env.GOOGLE_FORM_FIELD_STATUS, 'Applied');
  }
  if (process.env.GOOGLE_FORM_FIELD_PURCHASE_STATUS) {
    formData.append(process.env.GOOGLE_FORM_FIELD_PURCHASE_STATUS, '');
  }
  if (process.env.GOOGLE_FORM_FIELD_NOTES) {
    formData.append(process.env.GOOGLE_FORM_FIELD_NOTES, '');
  }

  await fetch(formUrl, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

// ── Local Backup ──────────────────────────────────────────────────────

async function saveSubmission(
  data: FormData,
  qualification: QualificationResult
) {
  const dataDir = join(process.cwd(), 'data');
  const filePath = join(dataDir, 'submissions.json');

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  let submissions: any[] = [];
  if (existsSync(filePath)) {
    const content = await readFile(filePath, 'utf-8');
    submissions = JSON.parse(content);
  }

  submissions.push({
    timestamp: new Date().toISOString(),
    data,
    qualification,
  });

  await writeFile(filePath, JSON.stringify(submissions, null, 2));
}
