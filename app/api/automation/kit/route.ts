import { NextRequest, NextResponse } from 'next/server';
import { validateCronAuth } from '@/lib/automation/cron-auth';
import { sendWhatsApp } from '@/lib/automation/whatsapp';
import { createDiscordInvite } from '@/lib/automation/discord';
import { 
  isApplicantProcessed, 
  isMemberProcessed,
  markApplicantProcessed,
  markMemberProcessed 
} from '@/lib/automation/state';

const KIT_API_KEY = process.env.KIT_API_KEY;
const KIT_TAG_APPLICANT = '15754298';
const KIT_TAG_MEMBER = '8240961';

export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    newApplicants: 0,
    newMembers: 0,
    errors: [] as string[]
  };

  try {
    // Check for new applicants
    const applicants = await fetchSubscribersWithTag(KIT_TAG_APPLICANT);
    for (const sub of applicants) {
      if (await isApplicantProcessed(sub.email_address)) continue;

      const name = sub.first_name || 'there';
      const phone = sub.fields?.phone;

      // Send to applicant if phone exists
      if (phone) {
        await sendWhatsApp(
          phone,
          `Hey ${name}! Thanks so much for applying to the Boundless Creator Program. I'm going to look through your application and get back to you soon!`
        );
      }

      // Notify Dave
      await sendWhatsApp(
        '+16163084220',
        `🔔 New BCP Application!\nName: ${name}\nEmail: ${sub.email_address}\nPhone: ${phone || 'N/A'}\nChannel: ${sub.fields?.channel_url || 'N/A'}`
      );

      await markApplicantProcessed(sub.email_address);
      results.newApplicants++;
    }

    // Check for new members
    const members = await fetchSubscribersWithTag(KIT_TAG_MEMBER);
    for (const sub of members) {
      if (await isMemberProcessed(sub.email_address)) continue;

      const name = sub.first_name || 'there';
      const phone = sub.fields?.phone;
      const discordInvite = await createDiscordInvite();

      // Send welcome to member if phone exists
      if (phone && discordInvite) {
        await sendWhatsApp(
          phone,
          `Hey ${name}! Welcome to the Boundless Creator Program! 🎉 Here's your personal Discord invite to join the community: ${discordInvite} — This link expires in 7 days and is just for you. Can't wait to get started!`
        );
      }

      // Notify Dave
      await sendWhatsApp(
        '+16163084220',
        `💰🎉 NEW BCP MEMBER!\nName: ${name}\nEmail: ${sub.email_address}\nPhone: ${phone || 'N/A'}\nDiscord: ${discordInvite || 'Failed to generate'}\n\nReminder: Reach out to schedule their onboarding call!`
      );

      await markMemberProcessed(sub.email_address);
      results.newMembers++;
    }
  } catch (error: any) {
    results.errors.push(error.message);
  }

  return NextResponse.json(results);
}

async function fetchSubscribersWithTag(tagId: string) {
  if (!KIT_API_KEY) throw new Error('KIT_API_KEY not set');

  const response = await fetch(
    `https://api.kit.com/v4/subscribers?tag_id=${tagId}`,
    {
      headers: { 'X-Kit-Api-Key': KIT_API_KEY }
    }
  );

  if (!response.ok) {
    throw new Error(`Kit API error: ${response.status}`);
  }

  const data = await response.json();
  return data.subscribers || [];
}
