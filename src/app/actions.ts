
'use server';

import { suggestCostCode, type SuggestCostCodeInput, type SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import { z } from 'zod';
import { saveAccountingFields } from '@/services/accounting-fields';
import { saveCostCodes } from '@/services/cost-codes';
import type { AccountingField, CostCode, CodedFields } from '@/lib/data';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
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

const codedFieldsSchema = z.object({
    accountingCode: z.string().optional().nullable(),
    memo: z.string().optional().nullable(),
    jobName: z.string().optional().nullable(),
    jobPhase: z.string().optional().nullable(),
    jobCategory: z.string().optional().nullable(),
});

const updateTransactionSchema = z.object({
    id: z.string(),
    updates: z.object({
        receiptUrl: z.string().optional().nullable(),
        codedFields: codedFieldsSchema.optional(),
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
    console.error("Invalid input for updateTransactionInFirestore:", validation.error);
    return { success: false, message: 'Invalid input.' };
  }

  const { id, updates } = validation.data;
  const transactionRef = doc(db, 'ramp_transactions', id);

  try {
    const updatePayload: { [key: string]: any } = {};
    
    if (updates.receiptUrl !== undefined) {
      updatePayload.receiptUrl = updates.receiptUrl;
    }

    if (updates.codedFields) {
        for (const [key, value] of Object.entries(updates.codedFields)) {
            if (value !== undefined) {
                updatePayload[`codedFields.${key}`] = value;
            }
        }
    }

    if (Object.keys(updatePayload).length === 0) {
        return { success: true, message: 'No updates to perform.' };
    }

    await updateDoc(transactionRef, updatePayload);
    return { success: true, message: 'Transaction updated successfully.' };
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update transaction: ${errorMessage}` };
  }
}


const sampleTransactions = [
  {
    id: 'txn_01HCNYKGBNKZXV1M4C9G8P7B4A',
    vendor: 'Amazon Web Services',
    amount: 150.75,
    date: new Date('2023-11-01T10:00:00Z'),
    description: 'Monthly AWS Hosting Bill',
    receiptUrl: null,
    syncedToRamp: false,
    codedFields: {
      accountingCode: null,
      memo: null,
      jobName: null,
      jobPhase: null,
      jobCategory: null,
    },
  },
  {
    id: 'txn_01HCNYKGBNKZXV1M4C9G8P7B4B',
    vendor: 'Figma',
    amount: 54.0,
    date: new Date('2023-11-02T11:30:00Z'),
    description: 'Design Tool Subscription',
    receiptUrl: 'https://placehold.co/1200x1600.png',
    syncedToRamp: false,
    codedFields: {
      accountingCode: '7210 - Software & Subscriptions',
      memo: 'Annual renewal',
      jobName: null,
      jobPhase: null,
      jobCategory: null,
    },
  },
  {
    id: 'txn_01HCNYKGBNKZXV1M4C9G8P7B4C',
    vendor: 'The Coffee Shop',
    amount: 12.5,
    date: new Date('2023-11-03T09:00:00Z'),
    description: 'Team Coffee Meeting',
    receiptUrl: null,
    syncedToRamp: false,
    codedFields: {
      accountingCode: null,
      memo: null,
      jobName: null,
      jobPhase: null,
      jobCategory: null,
    },
  },
];


export async function seedSampleData() {
  try {
    const batch = writeBatch(db);
    sampleTransactions.forEach(tx => {
      const docRef = doc(db, 'ramp_transactions', tx.id);
      batch.set(docRef, tx);
    });
    await batch.commit();
    return { success: true, message: 'Sample data seeded successfully.' };
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return { success: false, message: 'Failed to seed sample data.' };
  }
}
