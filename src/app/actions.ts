
'use server';

import { suggestCostCode, type SuggestCostCodeInput, type SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import { z } from 'zod';
import { saveAccountingFields } from '@/services/accounting-fields';
import { saveCostCodes } from '@/services/cost-codes';
import type { AccountingField, CostCode } from '@/lib/data';
import { getCostCodes as getCostCodesFromDb } from '@/services/cost-codes';
import { getAccountingFields as getAccountingFieldsFromDb } from '@/services/accounting-fields';


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
  // 1. Get the data from Firestore that you want to sync.
  const costCodes = await getCostCodesFromDb();
  const accountingFields = await getAccountingFieldsFromDb();

  // This is where you would access your secret key, likely from environment variables.
  // For example: const accessToken = process.env.RAMP_ACCESS_TOKEN;
  const accessToken = "YOUR_RAMP_ACCESS_TOKEN"; // Replace this with your actual token retrieval logic

  if (!accessToken || accessToken === "YOUR_RAMP_ACCESS_TOKEN") {
    console.log("Ramp access token is not configured. Please add it to your environment variables.");
    return { success: false, message: 'Ramp access token is not configured. This is a placeholder.' };
  }

  try {
    // 2. This is a placeholder for the actual API call.
    // You must replace this URL with the correct one from Ramp's API documentation.
    const rampApiUrl = 'https://api.ramp.com/v1/your-endpoint'; // <-- REPLACE THIS

    const response = await fetch(rampApiUrl, {
      method: 'POST', // Or 'PUT', 'PATCH', etc., depending on the API
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // The structure of this body depends entirely on Ramp's API documentation.
      body: JSON.stringify({
        costCodes: costCodes,
        accountingFields: accountingFields,
      }),
    });

    if (!response.ok) {
      // If Ramp's server returns an error, handle it.
      const errorData = await response.json();
      throw new Error(`Ramp API Error: ${errorData.message}`);
    }

    // 3. Return a success message.
    return { success: true, message: 'Successfully synced data with Ramp.' };

  } catch (error) {
    console.error("Error syncing with Ramp:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to sync with Ramp: ${errorMessage}` };
  }
}
