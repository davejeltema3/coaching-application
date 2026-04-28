import { FormData } from './questions';
import { VerifyResult } from './youtube-verify';

export interface AIQualificationResult {
  qualified: boolean;
  reasoning: string; // Concise summary for the Google Sheet column
  confidence: 'high' | 'medium' | 'low';
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Uses Gemini to evaluate whether an applicant is a genuine fit
 * for the BCA coaching program ($6,000-$9,600).
 */
export async function aiQualify(
  data: FormData,
  channelStats?: VerifyResult
): Promise<AIQualificationResult> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set - falling back to score-based qualification');
    return { qualified: false, reasoning: 'AI evaluation unavailable', confidence: 'low' };
  }

  const prompt = buildPrompt(data, channelStats);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              qualified: { type: 'BOOLEAN' },
              reasoning: { type: 'STRING' },
              confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
            },
            required: ['qualified', 'reasoning', 'confidence'],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return { qualified: false, reasoning: `AI error: ${response.status}`, confidence: 'low' };
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No content in Gemini response');
      return { qualified: false, reasoning: 'AI returned empty response', confidence: 'low' };
    }

    const parsed = JSON.parse(text);
    return {
      qualified: parsed.qualified === true,
      reasoning: truncateReasoning(parsed.reasoning || 'No reasoning provided'),
      confidence: parsed.confidence || 'low',
    };
  } catch (err: any) {
    console.error('AI qualification error:', err.message || err);
    return { qualified: false, reasoning: `AI error: ${err.message}`, confidence: 'low' };
  }
}

function truncateReasoning(text: string): string {
  // Allow full reasoning — 1500 chars is plenty for a sheet cell
  if (text.length <= 1500) return text;
  return text.substring(0, 1497) + '...';
}

function buildPrompt(data: FormData, channelStats?: VerifyResult): string {
  const statsSection = channelStats?.stats
    ? `
YOUTUBE CHANNEL DATA (verified via API — these are FACTS, not self-reported):
- Total videos: ${channelStats.stats.videoCount}
- Videos in last 6 months: ${channelStats.stats.recentVideoCount}
- Average views per video: ${Math.round(channelStats.stats.averageViews)}
- Best video views: ${channelStats.stats.maxViews}
- Channel URL: ${data.channel_url || 'not provided'}
- Verification status: ${channelStats.verified ? 'PASSED' : `FAILED - ${channelStats.reason}`}`
    : `
YOUTUBE CHANNEL DATA: Could not verify (URL: ${data.channel_url || 'not provided'})
NOTE: If channel data is unavailable, be MORE skeptical of self-reported claims.`;

  return `You are evaluating applications for the Boundless Creator Accelerator, a premium 1-on-1 YouTube coaching program costing $6,000-$9,600. The coach (Dave) personally prepares for each sales call and invests significant time per client. An unqualified call wastes 30-60 minutes of his day.

YOUR JOB IS NOT TO REPHRASE THEIR ANSWERS. Your job is to VERIFY and CROSS-REFERENCE their claims against real data, then make an independent judgment.

WHAT THIS PROGRAM IS FOR:
- Educational/teaching YouTube creators who teach a skill, solve a problem, or share expertise
- People who are already in the game with an established channel showing real traction
- Creators making content to build a business or career, NOT just for views or entertainment
- Someone who can realistically afford a $6,000-$9,600 investment

WHAT THIS PROGRAM IS NOT FOR:
- Gaming channels, ASMR channels, entertainment/reaction channels, vlog channels
- Brand new creators who just started or are still figuring things out
- People who didn't watch the sales video and don't understand what this is
- Aspirational creators who want to learn the basics

CRITICAL — CROSS-REFERENCE THEIR ANSWERS AGAINST THE DATA:
- If they say they upload weekly but the channel data shows 3 videos in 6 months, FLAG THAT.
- If they claim thousands of views but verified average is under 100, FLAG THAT.
- If they say they're an educational creator but you can see from their content type it's gaming/vlogs/entertainment, FLAG THAT.
- If they describe ambitious goals but their channel shows minimal effort (few videos, long gaps), FLAG THAT.
- People tend to present themselves in the best light. Your job is to see through that using the real data.
- DO NOT take their self-reported answers at face value. Always compare claims to verified channel stats.

GENERAL BENCHMARKS (not hard rules, use judgment):
- Channel active for more than 3 months with consistent uploads
- More than 10 videos published
- Videos getting more than 500 views on average (verified, not self-reported)
- Content is clearly educational/skill-based/problem-solving
- Answers show genuine understanding of what they're signing up for and realistic expectations
- Their stated goals align with what this program actually offers

APPLICATION ANSWERS (self-reported — verify against channel data where possible):
- Name: ${data.first_name || ''} ${data.last_name || ''}
- Active creator: ${data.active_creator || 'not answered'}
- Time creating: ${data.duration || 'not answered'}
- Subscribers: ${data.subscribers || 'not answered'}
- Monetized: ${data.monetized || 'not answered'}
- Content type: ${data.content_type || 'not answered'}
- Primary goal: ${data.goal || 'not answered'}
- Target audience: ${data.target_audience || 'not answered'}
- Program goals: ${data.program_goals || 'not answered'}
- Upload schedule: ${data.upload_schedule || 'not answered'}
- Investment ready: ${data.investment_ready || 'not answered'}
- Biggest challenge: ${data.challenge || 'not answered'}
${statsSection}

EVALUATE THIS APPLICATION. Return JSON with:
- "qualified": true/false - Is this person worth Dave's time for a sales call?
- "reasoning": A thorough evaluation. Start with what the verified data actually shows. Note any discrepancies between self-reported answers and real data. Then give your assessment of fit. Be specific — cite numbers, flag mismatches, explain your reasoning. This goes in a spreadsheet so Dave can quickly understand your verdict without re-reviewing the application himself.
- "confidence": "high" if the decision is clear, "medium" if borderline, "low" if insufficient data.

LEAN TOWARD UNQUALIFIED. It's better to miss a borderline candidate than waste Dave's time. Most applicants are not qualified — that's normal. A "qualified" result should mean you'd genuinely bet money this person is a good fit.`;
}
