import axios from 'axios';

/** Statistics gathered from YouTube channel verification */
export interface VerifyStats {
  videoCount: number;
  recentVideoCount: number;
  averageViews: number;
  maxViews: number;
}

/** Result of a channel verification */
export interface VerifyResult {
  verified: boolean;
  reason?: string;
  stats?: VerifyStats;
}

const API_KEY = process.env.YOUTUBE_API_KEY || process.env.YT_API_KEY;
const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Derives a YouTube channel ID from its public URL.
 * Supports /channel/{id}, /user/{username}, and /@handle URLs.
 */
async function getChannelId(url: string): Promise<string> {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  
  // Direct ID
  if (parts[0] === 'channel' && parts[1]) {
    return parts[1];
  }
  
  // Handle (@username)
  if (parts[0] && parts[0].startsWith('@')) {
    const handle = parts[0];
    const res = await axios.get(`${API_BASE}/channels`, {
      params: { key: API_KEY, part: 'id', forHandle: handle },
    });
    const item = res.data.items?.[0];
    if (item && item.id) {
      return item.id;
    }
  }
  
  // Legacy username
  if (parts[0] === 'user' && parts[1]) {
    const res = await axios.get(`${API_BASE}/channels`, {
      params: { key: API_KEY, part: 'id', forUsername: parts[1] },
    });
    const item = res.data.items?.[0];
    if (item && item.id) {
      return item.id;
    }
  }
  
  throw new Error(`Could not resolve channel identifier from URL: ${url}`);
}

/**
 * Verifies a channel against minimum and performance criteria.
 * If hasOtherPlatform is true, only minimums are enforced.
 */
export async function verifyChannel(
  channelUrl: string,
  hasOtherPlatform: boolean
): Promise<VerifyResult> {
  if (!API_KEY) {
    console.warn('YOUTUBE_API_KEY not set – skipping YouTube verification');
    return { verified: true };
  }
  
  try {
    const channelId = await getChannelId(channelUrl);
    
    // 1) Fetch channel statistics
    const ch = await axios.get(`${API_BASE}/channels`, {
      params: { key: API_KEY, part: 'statistics', id: channelId },
    });
    const stats = ch.data.items?.[0]?.statistics;
    const totalVideos = parseInt(stats?.videoCount || '0', 10);
    
    if (totalVideos < 10) {
      return {
        verified: false,
        reason: `Only ${totalVideos} total videos (minimum 10 required)`,
      };
    }

    // 2) Fetch up to 50 most recent videos
    const search = await axios.get(`${API_BASE}/search`, {
      params: {
        key: API_KEY,
        channelId,
        part: 'snippet',
        type: 'video',
        order: 'date',
        maxResults: 50,
      },
    });
    
    const items = search.data.items || [];
    const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000; // 6 months
    const recentVideos = items.filter((i: any) =>
      new Date(i.snippet.publishedAt).getTime() > cutoff
    );
    const recentCount = recentVideos.length;
    
    if (recentCount < 1) {
      return {
        verified: false,
        reason: `No videos published in the last 6 months`,
      };
    }

    // 3) Fetch statistics for these videos
    const ids = items.map((i: any) => i.id.videoId).join(',');
    const vids = await axios.get(`${API_BASE}/videos`, {
      params: { key: API_KEY, part: 'statistics', id: ids },
    });
    
    const views = vids.data.items.map(
      (v: any) => parseInt(v.statistics.viewCount || '0', 10)
    );
    const maxViews = Math.max(...views);
    const avgViews =
      views.reduce((sum: number, v: number) => sum + v, 0) / views.length;

    // 4) Performance check (unless exception)
    if (
      !hasOtherPlatform &&
      maxViews < 5000 &&
      avgViews <= 500
    ) {
      return {
        verified: false,
        reason: `Performance unmet (max views ${maxViews}, avg ${Math.round(
          avgViews
        )})`,
        stats: {
          videoCount: totalVideos,
          recentVideoCount: recentCount,
          averageViews: avgViews,
          maxViews,
        },
      };
    }

    // All checks passed
    return {
      verified: true,
      stats: {
        videoCount: totalVideos,
        recentVideoCount: recentCount,
        averageViews: avgViews,
        maxViews,
      },
    };
  } catch (err: any) {
    console.error('YouTube verification error:', err.message || err);
    // Don't block qualification on API failures
    return { verified: true, reason: 'Verification error, skipped' };
  }
}
