'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions as initialTransactions, type Transaction, type TransactionStatus } from '@/lib/data';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionDetailsDialog } from './transaction-details-dialog';

const statusStyles: { [key in TransactionStatus]: string } = {
  'Complete': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'Needs Info': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  'Pending Sync': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
};

export function TransactionTable() {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  const handleCostCodeUpdate = (transactionId: string, newCostCode: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, accountingCode: newCostCode, status: newCostCode && t.receiptUrl ? "Pending Sync" : t.status } : t))
    );
     if (selectedTransaction?.id === transactionId) {
      setSelectedTransaction(prev => prev ? {...prev, accountingCode: newCostCode, status: newCostCode && prev.receiptUrl ? "Pending Sync" : prev.status} : null);
    }
  };
  
  const handleReceiptUpload = (transactionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const receiptUrl = event.target?.result as string;
         setTransactions(prev =>
            prev.map(t => (t.id === transactionId ? { ...t, receiptUrl, status: t.accountingCode ? "Pending Sync" : t.status } : t))
        );
         if (selectedTransaction?.id === transactionId) {
            setSelectedTransaction(prev => prev ? {...prev, receiptUrl, status: prev.accountingCode ? "Pending Sync" : prev.status} : null);
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transactions</CardTitle>
        <CardDescription>
          Review transactions that require a cost code or receipt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                 <Dialog key={transaction.id} onOpenChange={(isOpen) => !isOpen && setSelectedTransaction(null)}>
                  <DialogTrigger asChild>
                    <TableRow 
                      onClick={() => setSelectedTransaction(transaction)} 
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium">{transaction.vendor}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">{transaction.description}</div>
                      </TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-mono">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[transaction.status]}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  {selectedTransaction && selectedTransaction.id === transaction.id && (
                     <TransactionDetailsDialog
                        transaction={selectedTransaction}
                        onUpdateCostCode={handleCostCodeUpdate}
                        onReceiptUpload={handleReceiptUpload}
                        statusStyle={statusStyles[selectedTransaction.status]}
                     />
                  )}
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
