import { FormData, questions } from './questions';
import { verifyChannel, VerifyResult } from './youtube-verify';
import { aiQualify, AIQualificationResult } from './ai-qualify';

export interface QualificationResult {
  qualified: boolean;
  score: number;
  disqualified: boolean;
  disqualifyReason?: string;
  channelVerified?: VerifyResult;
  aiEvaluation?: AIQualificationResult;
}

export async function calculateQualification(data: FormData): Promise<QualificationResult> {
  let score = 0;
  let disqualified = false;
  let disqualifyReason: string | undefined;

  // Step 1: Basic scoring (kept for backward compatibility + hard disqualifiers)
  for (const question of questions) {
    if (question.type === 'multiple-choice' && question.choices) {
      const answer = data[question.id as keyof FormData];
      
      if (answer) {
        const choice = question.choices.find((c) => c.value === answer);
        
        if (choice) {
          score += choice.score;
          
          if (choice.disqualifies) {
            disqualified = true;
            disqualifyReason = question.id;
            break;
          }
        }
      }
    }
  }

  // Step 2: If hard-disqualified (not active creator, not ready to invest), skip AI
  if (disqualified) {
    const readableReasons: Record<string, string> = {
      active_creator: 'Not an active YouTube creator',
      investment_ready: 'Not ready to invest at this time',
    };
    const readableReason = readableReasons[disqualifyReason || ''] || disqualifyReason || 'Unknown disqualifier';
    return {
      qualified: false,
      score,
      disqualified,
      disqualifyReason,
      aiEvaluation: {
        qualified: false,
        reasoning: `Auto-disqualified: ${readableReason}. No AI evaluation performed — this is a hard disqualifier from the application form.`,
        confidence: 'high',
      },
    };
  }

  // Step 3: Verify YouTube channel (get real stats for AI)
  let channelVerified: VerifyResult | undefined;
  if (data.channel_url) {
    try {
      const hasOtherPlatform = data.subscribers === 'other-platform';
      channelVerified = await verifyChannel(data.channel_url, hasOtherPlatform);
    } catch (err) {
      console.error('Channel verification failed:', err);
    }
  }

  // Step 4: AI evaluation (primary decision maker)
  let aiEvaluation: AIQualificationResult | undefined;
  try {
    aiEvaluation = await aiQualify(data, channelVerified);
  } catch (err) {
    console.error('AI qualification failed:', err);
  }

  // Step 5: Determine final qualification
  // AI is the sole decision maker. No fallback to old scoring.
  // If AI is unavailable, default to unqualified (safe — Dave can review manually).
  let qualified: boolean;
  if (aiEvaluation) {
    qualified = aiEvaluation.qualified;
  } else {
    // AI unavailable — don't auto-qualify anyone
    qualified = false;
  }

  return {
    qualified,
    score,
    disqualified,
    disqualifyReason,
    channelVerified,
    aiEvaluation,
  };
}
