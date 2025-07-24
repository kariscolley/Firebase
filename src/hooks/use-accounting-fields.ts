'use client';

import { useState, useEffect } from 'react';
import { accountingFields as defaultAccountingFields, type AccountingField } from '@/lib/data';
import { getAccountingFields } from '@/services/accounting-fields';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ACCOUNTING_FIELDS_COLLECTION = 'configuration';
const ACCOUNTING_FIELDS_DOCUMENT = 'accountingFields';


export function useAccountingFields() {
  const [fields, setFields] = useState<AccountingField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    getAccountingFields()
      .then(initialFields => {
        setFields(initialFields.length > 0 ? initialFields : defaultAccountingFields);
      })
      .catch(error => {
        console.error("Failed to fetch accounting fields from Firestore", error);
        setFields(defaultAccountingFields); // Fallback to default
      })
      .finally(() => {
        setLoading(false);
      });

    // Subscribe to real-time updates
    const docRef = doc(db, ACCOUNTING_FIELDS_COLLECTION, ACCOUNTING_FIELDS_DOCUMENT);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            // The fields are stored under the 'fields' key in the document.
            const newFields = data.fields || [];
            setFields(newFields.length > 0 ? newFields : defaultAccountingFields);
        } else {
             // If the document doesn't exist, use the default fields
            setFields(defaultAccountingFields);
        }
    }, (error) => {
        console.error("Error listening to accounting fields updates:", error);
        setFields(defaultAccountingFields); // Fallback on error
    });


    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { fields, loading };
}
