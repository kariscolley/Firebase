
'use client';

import { useState, useEffect } from 'react';
import { type Transaction, type TransactionStatus } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData, Timestamp } from 'firebase/firestore';

const TRANSACTIONS_COLLECTION = 'ramp_transactions';

function docDataToTransaction(doc: DocumentData): Transaction {
    const data = doc.data();
    const codedFields = data.codedFields;
    
    const hasRequiredFields = codedFields?.accountingCode && data.receiptUrl;
    let status: TransactionStatus;

    if (data.syncedToRamp) {
      status = 'Complete';
    } else if (hasRequiredFields) {
      status = 'Pending Sync';
    } else {
      status = 'Needs Info';
    }
    
    let dateString: string;
    if (data.date instanceof Timestamp) {
        dateString = data.date.toDate().toISOString();
    } else if (typeof data.date === 'string') {
        dateString = data.date;
    } else {
        dateString = new Date().toISOString();
    }

    return {
        id: doc.id,
        vendor: data.vendor || 'Unknown Vendor',
        amount: data.amount || 0,
        date: dateString,
        description: data.description || '',
        status: status,
        receiptUrl: data.receiptUrl || null,
        codedFields: {
            accountingCode: codedFields?.accountingCode || null,
            memo: codedFields?.memo || null,
            jobName: codedFields?.jobName || null,
            jobPhase: codedFields?.jobPhase || null,
            jobCategory: codedFields?.jobCategory || null,
        },
        syncedToRamp: !!data.syncedToRamp,
    };
}


export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, TRANSACTIONS_COLLECTION));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push(docDataToTransaction(doc));
        });
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error processing transaction data:", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to transactions collection:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { transactions, loading };
}
