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
 * for the BCP coaching program ($6,000-$9,600).
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
  // Keep it concise for the sheet cell - max ~300 chars
  if (text.length <= 300) return text;
  return text.substring(0, 297) + '...';
}

function buildPrompt(data: FormData, channelStats?: VerifyResult): string {
  const statsSection = channelStats?.stats
    ? `
YOUTUBE CHANNEL DATA (verified):
- Total videos: ${channelStats.stats.videoCount}
- Videos in last 6 months: ${channelStats.stats.recentVideoCount}
- Average views per video: ${Math.round(channelStats.stats.averageViews)}
- Best video views: ${channelStats.stats.maxViews}
- Channel URL: ${data.channel_url || 'not provided'}
- Verification status: ${channelStats.verified ? 'PASSED' : `FAILED - ${channelStats.reason}`}`
    : `
YOUTUBE CHANNEL DATA: Could not verify (URL: ${data.channel_url || 'not provided'})`;

  return `You are evaluating applications for the Boundless Creator Program (BCP), a premium 1-on-1 YouTube coaching program costing $6,000-$9,600. The coach (Dave) personally prepares for each call and invests significant time, so unqualified calls are a serious waste.

WHAT THIS PROGRAM IS FOR:
- Educational/teaching YouTube creators who teach a skill, solve a problem, or share expertise
- People who are already in the game with an established channel showing real traction
- Creators making content to build a business or career, NOT just for views or entertainment
- Someone who can realistically afford a $6,000-$9,600 investment

WHAT THIS PROGRAM IS NOT FOR:
- Gaming channels, ASMR channels, entertainment/reaction channels, vlog channels
- Brand new creators who just started or are still figuring things out
- People who didn't watch the sales video and don't understand what this is
- Aspirational creators who want to learn the basics (a separate offer is being built for them)

GENERAL BENCHMARKS (not hard rules, use judgment):
- Channel active for more than 3 months
- More than 10 videos published
- Videos getting more than 500 views on average
- Content is clearly educational/skill-based/problem-solving
- Answers show genuine understanding of what they're signing up for

APPLICATION ANSWERS:
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
- "reasoning": A concise 1-3 sentence summary explaining why they are or aren't qualified. Include specific details from their application. This goes in a spreadsheet cell so keep it brief.
- "confidence": "high" if the decision is clear, "medium" if borderline, "low" if insufficient data.

Be selective. It's better to miss a borderline candidate than waste Dave's time on someone who clearly isn't ready or isn't the right type of creator.`;
}
