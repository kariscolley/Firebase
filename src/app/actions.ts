'use server';

import { suggestCostCode, type SuggestCostCodeInput, type SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import { z } from 'zod';

const actionInputSchema = z.object({
  transactionDescription: z.string(),
  transactionAmount: z.number(),
  previousCostCodes: z.array(z.string()).optional(),
});

export async function getCostCodeSuggestion(
  input: SuggestCostCodeInput
): Promise<SuggestCostCodeOutput> {
  const parsedInput = actionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input for cost code suggestion.');
  }

  try {
    const result = await suggestCostCode(parsedInput.data);
    return result;
  } catch (error) {
    console.error("Error getting cost code suggestion:", error);
    throw new Error("Failed to get AI suggestion. Please try again.");
  }
}
