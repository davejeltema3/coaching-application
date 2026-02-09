import { NextRequest, NextResponse } from 'next/server';

// Cal.com webhook — fires when someone books a call
// Tags them "BCP Call Booked" in Kit, which stops the qualified nurture sequence

const KIT_CALL_BOOKED_TAG = process.env.KIT_TAG_CALL_BOOKED || '15773882';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Cal.com sends different event types — we only care about BOOKING_CREATED
    const eventType = payload.triggerEvent;
    if (eventType !== 'BOOKING_CREATED') {
      return NextResponse.json({ ok: true, skipped: true, reason: eventType });
    }

    // Extract attendee email from the booking
    const attendees = payload.payload?.attendees || [];
    if (attendees.length === 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'no attendees' });
    }

    const apiKey = process.env.KIT_API_KEY;
    if (!apiKey) {
      console.error('Cal webhook: KIT_API_KEY not configured');
      return NextResponse.json({ error: 'Kit not configured' }, { status: 500 });
    }

    // Tag each attendee as "BCP Call Booked"
    for (const attendee of attendees) {
      const email = attendee.email;
      const name = attendee.name;

      if (!email) continue;

      console.log(`Cal webhook: Tagging ${email} (${name}) as BCP Call Booked`);

      // Ensure subscriber exists
      await fetch('https://api.kit.com/v4/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': apiKey,
        },
        body: JSON.stringify({
          email_address: email,
          ...(name ? { first_name: name.split(' ')[0] } : {}),
        }),
      });

      // Tag with "BCP Call Booked"
      const tagResponse = await fetch(
        `https://api.kit.com/v4/tags/${KIT_CALL_BOOKED_TAG}/subscribers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Kit-Api-Key': apiKey,
          },
          body: JSON.stringify({ email_address: email }),
        }
      );

      if (!tagResponse.ok) {
        console.error(`Cal webhook: Kit tagging failed for ${email}:`, await tagResponse.text());
      }
    }

    return NextResponse.json({ ok: true, tagged: attendees.length });
  } catch (error) {
    console.error('Cal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
