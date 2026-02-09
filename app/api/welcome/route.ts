import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  });
}

const KIT_BCP_MEMBER_TAG_ID = '8240961';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const testMode = request.nextUrl.searchParams.get('test') === 'true';

    // Test mode — show the welcome page without Stripe verification
    if (testMode) {
      return NextResponse.json({
        success: true,
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        planName: 'test',
        duration: '3 months',
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session ID' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'line_items'],
    });

    // Verify payment was successful
    if (
      session.payment_status !== 'paid' &&
      session.status !== 'complete'
    ) {
      return NextResponse.json(
        { success: false, error: 'Payment not confirmed' },
        { status: 400 }
      );
    }

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // Tag as BCP Member in Kit
    if (process.env.KIT_API_KEY && customerEmail) {
      try {
        await tagKitMember(customerEmail, customerName || undefined);
      } catch (error) {
        console.error('Kit tagging error:', error);
        // Don't fail the welcome page if Kit fails
      }
    }

    return NextResponse.json({
      success: true,
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
      planName: session.metadata?.plan_code || undefined,
      duration: session.metadata?.duration || undefined,
    });
  } catch (error: any) {
    console.error('Welcome verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

async function tagKitMember(email: string, name?: string) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) return;

  // Create/update subscriber
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

  // Tag with BCP Member
  const tagId = process.env.KIT_BCP_MEMBER_TAG_ID || KIT_BCP_MEMBER_TAG_ID;
  await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiKey,
    },
    body: JSON.stringify({ email_address: email }),
  });
}
