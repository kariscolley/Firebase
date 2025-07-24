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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, Receipt } from 'lucide-react';
import { transactions as initialTransactions, type Transaction, type TransactionStatus } from '@/lib/data';
import { CostCodeSuggester } from './cost-code-suggester';

const statusStyles: { [key in TransactionStatus]: string } = {
  'Complete': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'Needs Info': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  'Pending Sync': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
};

export function TransactionTable() {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);

  const handleCostCodeUpdate = (transactionId: string, newCostCode: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, costCode: newCostCode, status: newCostCode && t.receiptUrl ? "Pending Sync" : t.status } : t))
    );
  };
  
  const handleReceiptUpload = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, receiptUrl: `/receipts/new-receipt.pdf`, status: t.costCode ? "Pending Sync" : t.status } : t))
    );
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
                <TableHead className="w-[250px]">Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[350px]">Cost Code</TableHead>
                <TableHead className="text-center">Receipt</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.vendor}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">{transaction.description}</div>
                  </TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <CostCodeSuggester transaction={transaction} onUpdateCostCode={handleCostCodeUpdate} />
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.receiptUrl ? (
                      <Button variant="ghost" size="sm">
                         <Receipt className="h-4 w-4 text-green-500" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleReceiptUpload(transaction.id)}>
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[transaction.status]}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
