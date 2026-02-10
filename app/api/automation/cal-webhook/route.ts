import { NextRequest, NextResponse } from 'next/server';

const KIT_API_KEY = process.env.KIT_API_KEY;
const KIT_TAG_CALL_BOOKED = '15773882';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Cal.com sends booking.created, booking.rescheduled, etc.
    if (payload.triggerEvent !== 'BOOKING_CREATED') {
      return NextResponse.json({ message: 'Ignored' });
    }

    const email = payload.payload?.responses?.email || payload.payload?.attendees?.[0]?.email;
    
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Apply "BCP Call Booked" tag to stop the nudge sequence
    await applyKitTag(email, KIT_TAG_CALL_BOOKED);

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    console.error('Cal webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function applyKitTag(email: string, tagId: string) {
  if (!KIT_API_KEY) throw new Error('KIT_API_KEY not set');

  // First get subscriber ID
  const subResponse = await fetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`,
    {
      headers: { 'X-Kit-Api-Key': KIT_API_KEY }
    }
  );

  if (!subResponse.ok) {
    throw new Error(`Kit API error: ${subResponse.status}`);
  }

  const subData = await subResponse.json();
  const subscriber = subData.subscribers?.[0];

  if (!subscriber) {
    throw new Error(`Subscriber not found: ${email}`);
  }

  // Apply tag
  const tagResponse = await fetch(
    `https://api.kit.com/v4/subscribers/${subscriber.id}/tags`,
    {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': KIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tag_ids: [parseInt(tagId)] })
    }
  );

  if (!tagResponse.ok) {
    throw new Error(`Failed to apply tag: ${tagResponse.status}`);
  }
}
