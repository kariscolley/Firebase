'use server';

import { suggestCostCode, type SuggestCostCodeInput, type SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import { z } from 'zod';
import { saveAccountingFields } from '@/services/accounting-fields';
import { saveCostCodes } from '@/services/cost-codes';
import type { AccountingField, CostCode } from '@/lib/data';


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
    throw new Error('Invalid input for accounting code suggestion.');
  }

  try {
    const result = await suggestCostCode(parsedInput.data);
    return result;
  } catch (error) {
    console.error("Error getting accounting code suggestion:", error);
    throw new Error("Failed to get AI suggestion. Please try again.");
  }
}

export async function saveAccountingFieldsAction(fields: AccountingField[]) {
  try {
    await saveAccountingFields(fields);
    return { success: true, message: 'Successfully saved accounting fields.' };
  } catch (error) {
    console.error("Error saving accounting fields:", error);
    return { success: false, message: 'Failed to save accounting fields.' };
  }
}

export async function saveCostCodesAction(codes: CostCode[]) {
  try {
    await saveCostCodes(codes);
    return { success: true, message: 'Successfully saved chart of accounts.' };
  } catch (error) {
    console.error("Error saving cost codes:", error);
    return { success: false, message: 'Failed to save chart of accounts.' };
  }
}


export async function syncWithRamp() {
    // This is a placeholder for the real Ramp API integration.
    // In a real application, this would fetch the latest data from Firestore
    // and push it to the Ramp API.
    console.log('syncWithRamp action triggered');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return { success: true, message: 'Data sync with Ramp initiated. (This is a placeholder)' };
}
