import { FormData, questions } from './questions';

export interface QualificationResult {
  qualified: boolean;
  score: number;
  disqualified: boolean;
  disqualifyReason?: string;
}

export function calculateQualification(data: FormData): QualificationResult {
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
  const qualified = score >= 3 && !disqualified;

  return {
    qualified,
    score,
    disqualified,
    disqualifyReason,
  };
}
