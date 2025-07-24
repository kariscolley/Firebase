'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting accounting codes for transactions based on their details.
 *
 * - suggestCostCode - A function that takes transaction details as input and returns a suggested accounting code.
 * - SuggestCostCodeInput - The input type for the suggestCostCode function.
 * - SuggestCostCodeOutput - The return type for the suggestCostCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCostCodeInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction, including vendor and purpose.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
  previousCostCodes: z
    .array(z.string())
    .optional()
    .describe('A list of previously used accounting codes for similar transactions.'),
});

export type SuggestCostCodeInput = z.infer<typeof SuggestCostCodeInputSchema>;

const SuggestCostCodeOutputSchema = z.object({
  suggestedCostCode: z
    .string()
    .describe('The suggested accounting code for the transaction.'),
  confidenceScore: z
    .number()
    .describe(
      'A score between 0 and 1 indicating the confidence level of the suggestion.'
    ),
  reasoning: z
    .string()
    .optional()
    .describe('The reasoning behind the accounting code suggestion.'),
});

export type SuggestCostCodeOutput = z.infer<typeof SuggestCostCodeOutputSchema>;

export async function suggestCostCode(
  input: SuggestCostCodeInput
): Promise<SuggestCostCodeOutput> {
  return suggestCostCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCostCodePrompt',
  input: {schema: SuggestCostCodeInputSchema},
  output: {schema: SuggestCostCode_OutputSchema},
  prompt: `You are an expert accounting assistant specializing in accounting code assignment.

You will be provided with transaction details and must suggest the most appropriate accounting code.

Transaction Description: {{{transactionDescription}}}
Transaction Amount: {{{transactionAmount}}}

{{#if previousCostCodes}}
Previously Used Accounting Codes for Similar Transactions:
{{#each previousCostCodes}}
- {{{this}}}
{{/each}}
{{/if}}

Consider all available information and provide a single, best-suited accounting code. You MUST respond with JSON that contains a suggestedCostCode, a confidenceScore, and a reasoning field.
`,
});

const suggestCostCodeFlow = ai.defineFlow(
  {
    name: 'suggestCostCodeFlow',
    inputSchema: SuggestCostCodeInputSchema,
    outputSchema: SuggestCostCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
