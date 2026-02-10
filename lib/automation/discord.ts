const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_WELCOME_CHANNEL_ID = '1470652218825019442'; // #general in BCP server (1470652210038968466)

export async function createDiscordInvite(): Promise<string | null> {
  if (!DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_WELCOME_CHANNEL_ID}/invites`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_age: 604800, // 7 days
          max_uses: 1,
          unique: true
        })
      }
    );

    if (!response.ok) {
      console.error('Discord API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return `https://discord.gg/${data.code}`;
  } catch (error) {
    console.error('Discord invite creation failed:', error);
    return null;
  }
}
