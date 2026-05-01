import { NextRequest, NextResponse } from 'next/server';

/**
 * Fallback Discord invite endpoint for apply.boundlesscreator.com.
 * 
 * Reuses an existing invite to avoid generating hundreds of orphaned invites
 * from email client link prefetching, crawlers, etc.
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1472422228221235231'; // 🚀start-here
const INVITE_SECRET = process.env.INVITE_SECRET;

// In-memory cache for the fallback invite
let cachedInvite: { code: string; expiresAt: number } | null = null;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || token !== INVITE_SECRET) {
    return NextResponse.json({ error: 'Invalid or missing invite token.' }, { status: 403 });
  }

  if (!DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: 'Discord integration not configured.' }, { status: 500 });
  }

  const now = Date.now();

  // Return cached invite if still valid (1-hour buffer)
  if (cachedInvite && cachedInvite.expiresAt > now + 3600_000) {
    return NextResponse.redirect(`https://discord.gg/${cachedInvite.code}`);
  }

  try {
    // Check for an existing reusable invite first
    const existingRes = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/invites`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });

    if (existingRes.ok) {
      const invites = await existingRes.json();
      const reusable = invites.find((inv: any) =>
        inv.inviter?.bot === true &&
        inv.max_uses === 0 &&
        inv.max_age > 0 &&
        new Date(inv.expires_at).getTime() > now + 3600_000
      );

      if (reusable) {
        cachedInvite = {
          code: reusable.code,
          expiresAt: new Date(reusable.expires_at).getTime(),
        };
        return NextResponse.redirect(`https://discord.gg/${reusable.code}`);
      }
    }

    // Create a new reusable invite (unlimited uses, 7 days)
    const response = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/invites`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_age: 604800,
        max_uses: 0,     // unlimited — this is the fallback endpoint
        unique: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate invite.' }, { status: 500 });
    }

    const invite = await response.json();

    if (invite.code && typeof invite.code === 'string') {
      cachedInvite = {
        code: invite.code,
        expiresAt: now + 604800_000,
      };
      return NextResponse.redirect(`https://discord.gg/${invite.code}`);
    }

    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 });
  } catch (error) {
    console.error('Discord invite error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
