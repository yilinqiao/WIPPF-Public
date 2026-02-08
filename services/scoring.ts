import { QUESTIONS } from "../constants";
import { AnswerValue, MacroScores } from "../types";

export function calculateScores(answers: Record<number, AnswerValue>): Record<string, number> {
  const scores: Record<string, number> = {};

  // Initialize scores for all numeric categories 1-27 plus the sub-categories for 24
  for (let i = 1; i <= 27; i++) {
    if (i === 24) {
        scores['24m'] = 0;
        scores['24f'] = 0;
        scores['24o'] = 0;
    } else {
        scores[i.toString()] = 0;
    }
  }

  // Iterate through all questions
  QUESTIONS.forEach(q => {
    // Check if this is category 24 which needs special handling
    // 24a, 24b, 24c -> 24m
    // 24d, 24e, 24f -> 24f
    // 24g, 24h, 24i -> 24o
    
    // Regex to capture number and optional letter
    const match = q.categoryCode.match(/^(\d+)([a-z])?/);
    
    if (match) {
      const num = match[1];
      const char = match[2]; // can be undefined
      const ans = answers[q.id];

      if (ans) {
        let categoryId = num;

        if (num === '24') {
          if (['a', 'b', 'c'].includes(char)) {
            categoryId = '24m';
          } else if (['d', 'e', 'f'].includes(char)) {
            categoryId = '24f';
          } else if (['g', 'h', 'i'].includes(char)) {
            categoryId = '24o';
          }
        }
        
        // Accumulate score if the category exists in our initialized map
        if (scores.hasOwnProperty(categoryId)) {
           scores[categoryId] += ans;
        }
      }
    }
  });

  return scores;
}

export function calculateMacroScores(answers: Record<number, AnswerValue>): MacroScores {
  const macro: MacroScores = {
    social: { active: 0, passive: 0, concept: 0 },
    emotional: { self: 0, we: 0, ideal: 0 }
  };

  QUESTIONS.forEach(q => {
    const match = q.categoryCode.match(/^(\d+)([a-z])?/);
    if (!match || !match[2]) return;

    const num = parseInt(match[1], 10);
    const char = match[2];
    const val = answers[q.id] || 0;

    if (val === 0) return;

    // Secondary Capacities (1-11)
    // a -> Active, b -> Passive, c -> Concept/Idea
    if (num >= 1 && num <= 11) {
      if (char === 'a') macro.social.active += val;
      if (char === 'b') macro.social.passive += val;
      if (char === 'c') macro.social.concept += val;
    }

    // Primary Capacities (12-19)
    // a -> Ego/Self, b -> We/You, c -> Ideal/Concept
    if (num >= 12 && num <= 19) {
      if (char === 'a') macro.emotional.self += val;
      if (char === 'b') macro.emotional.we += val;
      if (char === 'c') macro.emotional.ideal += val;
    }
  });

  return macro;
}