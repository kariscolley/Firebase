
'use client';

import { useState, useEffect } from 'react';
import { type Transaction, type TransactionStatus } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';

const TRANSACTIONS_COLLECTION = 'ramp_transactions';

function docDataToTransaction(doc: DocumentData): Transaction {
    const data = doc.data();
    const isComplete = data.accountingCode && data.receiptUrl;
    
    let status: TransactionStatus = 'Needs Info';
    if(isComplete) {
      // This is a simplified status. A real app might check a `syncedAt` timestamp.
      status = 'Pending Sync'; 
    }
    
    return {
        id: doc.id,
        vendor: data.vendor || 'Unknown Vendor',
        amount: data.amount || 0,
        date: data.date, // Assuming date is stored as an ISO string
        description: data.description || '',
        status: status, // This status is now derived
        accountingCode: data.accountingCode || null,
        memo: data.memo || null,
        jobName: data.jobName || null,
        jobPhase: data.jobPhase || null,
        jobCategory: data.jobCategory || null,
        receiptUrl: data.receiptUrl || null,
    };
}


export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, TRANSACTIONS_COLLECTION));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push(docDataToTransaction(doc));
      });
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to transactions collection:", error);
      // Handle the error appropriately in a real app
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { transactions, loading };
}
