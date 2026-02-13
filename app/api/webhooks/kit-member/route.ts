import { NextResponse } from 'next/server';

// Disable body size limit for webhooks
export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Kit webhook payload structure:
    // {
    //   "subscriber": {
    //     "id": 123,
    //     "first_name": "John",
    //     "email_address": "john@example.com",
    //     "tags": [...]
    //   },
    //   "tag": {
    //     "id": 8240961,
    //     "name": "BCP Member"
    //   }
    // }

    const subscriber = payload.subscriber;
    const tag = payload.tag;

    // Only process BCP Member tags
    if (tag?.id !== 8240961) {
      return NextResponse.json({ received: true, skipped: 'Not BCP Member tag' });
    }

    const email = subscriber?.email_address;
    const name = subscriber?.first_name;

    console.log('New BCP Member tagged:', { email, name });

    // Send notifications
    await sendNotifications({ email, name });

    return NextResponse.json({ received: true, notified: true });
  } catch (error: any) {
    console.error('Kit webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function sendNotifications(data: { email?: string; name?: string }) {
  const { email, name } = data;

  const message = `## 🎉 **New BCP Member!**

**Email:** ${email || 'Unknown'}
${name ? `**Name:** ${name}` : ''}
**Tagged:** ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST

---
✅ They were automatically tagged as "BCP Member" in Kit.

**Next steps:**
- Send welcome DM/email
- Add to Discord server
- Schedule onboarding call`;

  // Send to Discord
  if (process.env.DISCORD_WEBHOOK_DASHBOARD) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_DASHBOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      console.log('Discord notification sent');
    } catch (error) {
      console.error('Discord notification failed:', error);
    }
  }

  // Send to WhatsApp via OpenClaw (optional)
  const whatsappMessage = `🎉 NEW BCP MEMBER!\n\nEmail: ${email || 'Unknown'}\n${name ? `Name: ${name}\n` : ''}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST\n\nNext: Send welcome + add to Discord`;

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
      console.log('WhatsApp notification sent');
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
    }
  }
}
