'use client';

import { useState, useEffect } from 'react';
import { accountingFields as defaultAccountingFields, type AccountingField } from '@/lib/data';

export function useAccountingFields() {
  const [fields, setFields] = useState<AccountingField[]>(defaultAccountingFields);

  useEffect(() => {
    try {
      const storedFields = localStorage.getItem('accountingFields');
      if (storedFields) {
        setFields(JSON.parse(storedFields));
      }
    } catch (error) {
      console.error("Failed to parse accounting fields from localStorage", error);
      // Fallback to default fields if parsing fails
      setFields(defaultAccountingFields);
    }

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'accountingFields' && event.newValue) {
            try {
                setFields(JSON.parse(event.newValue));
            } catch (error) {
                console.error("Failed to parse updated accounting fields from localStorage", error);
            }
        }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }

  }, []);

  return fields;
}
