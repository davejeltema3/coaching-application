import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
  const currency = session.currency?.toUpperCase() || 'USD';

  console.log('Checkout completed:', {
    email: customerEmail,
    name: customerName,
    amount: amountTotal,
    currency,
  });

  // Send notifications
  await sendNotifications({
    email: customerEmail,
    name: customerName,
    amount: amountTotal,
    currency,
    type: 'checkout',
  });

  // Tag as BCP Member in Kit
  if (customerEmail && process.env.KIT_API_KEY) {
    await tagKitMember(customerEmail, customerName);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const amount = paymentIntent.amount / 100;
  const currency = paymentIntent.currency.toUpperCase();
  const customerEmail = paymentIntent.receipt_email;

  console.log('Payment succeeded:', {
    email: customerEmail,
    amount,
    currency,
  });

  await sendNotifications({
    email: customerEmail,
    amount,
    currency,
    type: 'payment',
  });
}

async function sendNotifications(data: {
  email?: string | null;
  name?: string | null;
  amount: number;
  currency: string;
  type: 'checkout' | 'payment';
}) {
  const { email, name, amount, currency, type } = data;

  const message = `## 💰 **New BCP Payment Received!**

**Amount:** ${currency} $${amount.toFixed(2)}
**Email:** ${email || 'Unknown'}
${name ? `**Name:** ${name}` : ''}
**Type:** ${type === 'checkout' ? 'Checkout Session' : 'Payment Intent'}
**Time:** ${new Date().toISOString()}

---
✅ Customer should be automatically tagged as "BCP Member" in Kit.`;

  // Send to Discord
  if (process.env.DISCORD_WEBHOOK_DASHBOARD) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_DASHBOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  }

  // Send to WhatsApp via OpenClaw (optional)
  const whatsappMessage = `💰 NEW BCP PAYMENT!\n\nAmount: ${currency} $${amount.toFixed(2)}\nEmail: ${email || 'Unknown'}\n${name ? `Name: ${name}\n` : ''}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`;

  if (process.env.OPENCLAW_GATEWAY_URL && process.env.OPENCLAW_GATEWAY_TOKEN) {
    try {
      await fetch(`${process.env.OPENCLAW_GATEWAY_URL}/api/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          channel: 'whatsapp',
          to: '+16163084220',
          message: whatsappMessage,
        }),
      });
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
    }
  }
}

async function tagKitMember(email: string, name?: string | null) {
  const kitApiKey = process.env.KIT_API_KEY;
  const kitMemberTagId = process.env.KIT_TAG_MEMBER || '8240961'; // BCP Member tag

  if (!kitApiKey) return;

  try {
    // First, ensure subscriber exists (upsert)
    if (name) {
      const firstName = name.split(' ')[0];
      await fetch('https://api.kit.com/v4/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': kitApiKey,
        },
        body: JSON.stringify({
          email_address: email,
          first_name: firstName,
        }),
      });
    }

    // Tag as BCP Member
    const tagResponse = await fetch(
      `https://api.kit.com/v4/tags/${kitMemberTagId}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': kitApiKey,
        },
        body: JSON.stringify({ email_address: email }),
      }
    );

    if (!tagResponse.ok) {
      console.error('Kit tagging failed:', await tagResponse.text());
    } else {
      console.log(`Successfully tagged ${email} as BCP Member in Kit`);
    }
  } catch (error) {
    console.error('Kit API error:', error);
  }
}
