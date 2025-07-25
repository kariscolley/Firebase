
'use server';

import { suggestCostCode, type SuggestCostCodeInput, type SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import { z } from 'zod';
import { saveAccountingFields } from '@/services/accounting-fields';
import { saveCostCodes } from '@/services/cost-codes';
import type { AccountingField, CostCode, CodedFields } from '@/lib/data';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

const updateTransactionSchema = z.object({
    id: z.string(),
    updates: z.object({
        receiptUrl: z.string().optional().nullable(),
        codedFields: z.object({
            accountingCode: z.string().optional().nullable(),
            memo: z.string().optional().nullable(),
            jobName: z.string().optional().nullable(),
            jobPhase: z.string().optional().nullable(),
            jobCategory: z.string().optional().nullable(),
        })
    })
})

/**
 * Updates a specific transaction document in the 'ramp_transactions' collection in Firestore.
 */
export async function updateTransactionInFirestore(
  input: z.infer<typeof updateTransactionSchema>
) {
  const validation = updateTransactionSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { id, updates } = validation.data;
  const transactionRef = doc(db, 'ramp_transactions', id);

  try {
    // Using dot notation to update nested fields in the 'codedFields' object
    const updatePayload: { [key: string]: any } = {};
    if (updates.receiptUrl !== undefined) {
      updatePayload.receiptUrl = updates.receiptUrl;
    }
    for (const [key, value] of Object.entries(updates.codedFields)) {
        if (value !== undefined) {
            updatePayload[`codedFields.${key}`] = value;
        }
    }

    await updateDoc(transactionRef, updatePayload);
    return { success: true, message: 'Transaction updated successfully.' };
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update transaction: ${errorMessage}` };
  }
}
