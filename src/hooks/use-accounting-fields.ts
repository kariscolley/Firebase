'use client';

import { useState, useEffect } from 'react';
import { accountingFields as defaultAccountingFields, type AccountingField } from '@/lib/data';
import { getAccountingFields, onAccountingFieldsUpdate } from '@/services/accounting-fields';

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
    const unsubscribe = onAccountingFieldsUpdate((updatedFields) => {
       setFields(updatedFields.length > 0 ? updatedFields : defaultAccountingFields);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { fields, loading };
}
