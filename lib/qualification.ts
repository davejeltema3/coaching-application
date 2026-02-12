import { FormData, questions } from './questions';
import { verifyChannel, VerifyResult } from './youtube-verify';

export interface QualificationResult {
  qualified: boolean;
  score: number;
  disqualified: boolean;
  disqualifyReason?: string;
  channelVerified?: VerifyResult;
}

export async function calculateQualification(data: FormData): Promise<QualificationResult> {
  let score = 0;
  let disqualified = false;
  let disqualifyReason: string | undefined;

  // Check each question
  for (const question of questions) {
    if (question.type === 'multiple-choice' && question.choices) {
      const answer = data[question.id as keyof FormData];
      
      if (answer) {
        const choice = question.choices.find((c) => c.value === answer);
        
        if (choice) {
          // Add score
          score += choice.score;
          
          // Check for disqualification
          if (choice.disqualifies) {
            disqualified = true;
            disqualifyReason = question.id;
            break; // Stop scoring if disqualified
          }
        }
      }
    }
  }

  // Qualification criteria: score >= 3 AND not disqualified
  // Scoring is generous — we'd rather talk to someone borderline than miss a good fit
  let qualified = score >= 3 && !disqualified;
  let channelVerified: VerifyResult | undefined;

  // If questionnaire passes, verify YouTube channel
  if (qualified && data.channel_url) {
    try {
      const hasOtherPlatform = data.subscribers === 'other-platform';
      channelVerified = await verifyChannel(data.channel_url, hasOtherPlatform);
      
      if (!channelVerified.verified) {
        qualified = false;
        disqualifyReason = 'channel_verification';
      }
    } catch (err) {
      console.error('Channel verification failed:', err);
      // Don't block on verification errors - verifyChannel already handles this
    }
  }

  return {
    qualified,
    score,
    disqualified,
    disqualifyReason,
    channelVerified,
  };
}
