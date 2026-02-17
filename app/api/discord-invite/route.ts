import { NextRequest, NextResponse } from 'next/server';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1469126752919097479'; // #general
const INVITE_SECRET = process.env.INVITE_SECRET; // Simple shared secret for Kit emails

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  // Verify the secret token (included in Kit email links)
  if (!token || token !== INVITE_SECRET) {
    return NextResponse.json(
      { error: 'Invalid or missing invite token.' },
      { status: 403 }
    );
  }

  if (!DISCORD_BOT_TOKEN) {
    return NextResponse.json(
      { error: 'Discord integration not configured.' },
      { status: 500 }
    );
  }

  try {
    // Log env vars for debugging
    console.log('DISCORD_BOT_TOKEN exists:', !!DISCORD_BOT_TOKEN);
    console.log('DISCORD_CHANNEL_ID:', DISCORD_CHANNEL_ID);
    console.log('INVITE_SECRET exists:', !!INVITE_SECRET);
    
    // Generate a unique 7-day, 1-use invite
    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/invites`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_age: 604800, // 7 days
          max_uses: 1,
          unique: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error status:', response.status);
      console.error('Discord API error body:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate invite. Please contact hello@boundlesscreator.com', debug: { status: response.status, body: errorText } },
        { status: 500 }
      );
    }

    const invite = await response.json();
    const inviteUrl = `https://discord.gg/${invite.code}`;

    // Redirect the user to Discord
    return NextResponse.redirect(inviteUrl);
  } catch (error) {
    console.error('Discord invite error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please contact hello@boundlesscreator.com' },
      { status: 500 }
    );
  }
}
