
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type CostCode } from '@/lib/data';

const COST_CODES_COLLECTION = 'configuration';
const COST_CODES_DOCUMENT = 'costCodes';

/**
 * Saves the provided cost codes to the Firestore database, overwriting any existing data.
 * @param codes - An array of CostCode objects to save.
 */
export async function saveCostCodes(codes: CostCode[]): Promise<void> {
  try {
    const docRef = doc(db, COST_CODES_COLLECTION, COST_CODES_DOCUMENT);
    // We store the codes inside a parent object to make the document structure more flexible for future additions.
    await setDoc(docRef, { codes });
  } catch (error) {
    console.error("Error saving cost codes to Firestore:", error);
    throw new Error("Failed to save cost codes.");
  }
}

/**
 * Retrieves the cost codes from the Firestore database.
 * @returns A promise that resolves to an array of CostCode objects.
 */
export async function getCostCodes(): Promise<CostCode[]> {
  try {
    const docRef = doc(db, COST_CODES_COLLECTION, COST_CODES_DOCUMENT);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // The codes are stored under the 'codes' key in the document.
      return data.codes || [];
    } else {
      console.log("No cost codes document found in Firestore. Returning empty array.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching cost codes from Firestore:", error);
    throw new Error("Failed to fetch cost codes.");
  }
}
