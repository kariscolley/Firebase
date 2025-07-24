'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type AccountingField } from '@/lib/data';

const ACCOUNTING_FIELDS_COLLECTION = 'configuration';
const ACCOUNTING_FIELDS_DOCUMENT = 'accountingFields';


/**
 * Saves the provided accounting fields to the Firestore database, overwriting any existing data.
 * @param fields - An array of AccountingField objects to save.
 */
export async function saveAccountingFields(fields: AccountingField[]): Promise<void> {
  try {
    const docRef = doc(db, ACCOUNTING_FIELDS_COLLECTION, ACCOUNTING_FIELDS_DOCUMENT);
    // We store the fields inside a parent object to make the document structure more flexible for future additions.
    await setDoc(docRef, { fields }); 
  } catch (error) {
    console.error("Error saving accounting fields to Firestore:", error);
    throw new Error("Failed to save accounting fields.");
  }
}


/**
 * Retrieves the accounting fields from the Firestore database.
 * @returns A promise that resolves to an array of AccountingField objects.
 */
export async function getAccountingFields(): Promise<AccountingField[]> {
  try {
    const docRef = doc(db, ACCOUNTING_FIELDS_COLLECTION, ACCOUNTING_FIELDS_DOCUMENT);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // The fields are stored under the 'fields' key in the document.
      return data.fields || [];
    } else {
      console.log("No accounting fields document found in Firestore. Returning empty array.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching accounting fields from Firestore:", error);
    throw new Error("Failed to fetch accounting fields.");
  }
}
