
'use client';

import { useState, useEffect } from 'react';
import { costCodes as defaultCostCodes, type CostCode } from '@/lib/data';
import { getCostCodes } from '@/services/cost-codes';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COST_CODES_COLLECTION = 'configuration';
const COST_CODES_DOCUMENT = 'costCodes';

export function useCostCodes() {
  const [codes, setCodes] = useState<CostCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    getCostCodes()
      .then(initialCodes => {
        setCodes(initialCodes.length > 0 ? initialCodes : defaultCostCodes);
      })
      .catch(error => {
        console.error("Failed to fetch cost codes from Firestore", error);
        setCodes(defaultCostCodes); // Fallback to default
      })
      .finally(() => {
        setLoading(false);
      });

    // Subscribe to real-time updates
    const docRef = doc(db, COST_CODES_COLLECTION, COST_CODES_DOCUMENT);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // The codes are stored under the 'codes' key in the document.
        const newCodes = data.codes || [];
        setCodes(newCodes.length > 0 ? newCodes : defaultCostCodes);
      } else {
        // If the document doesn't exist, use the default codes
        setCodes(defaultCostCodes);
      }
    }, (error) => {
      console.error("Error listening to cost codes updates:", error);
      setCodes(defaultCostCodes); // Fallback on error
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { codes, loading };
}
