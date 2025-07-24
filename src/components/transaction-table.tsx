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
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const statusStyles: { [key in TransactionStatus]: string } = {
  'Complete': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'Needs Info': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  'Pending Sync': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
};

type SortKey = keyof Transaction | null;

export function TransactionTable() {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });


  const handleFieldUpdate = (transactionId: string, field: keyof Transaction, value: string | null) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          const updatedTransaction = { ...t, [field]: value };
          if (field === 'accountingCode' || field === 'receiptUrl') {
            const isComplete = updatedTransaction.accountingCode && updatedTransaction.receiptUrl;
            return { ...updatedTransaction, status: isComplete ? "Pending Sync" : "Needs Info" };
          }
          return updatedTransaction;
        }
        return t;
      })
    );

    if (selectedTransaction?.id === transactionId) {
      setSelectedTransaction(prev => {
        if (!prev) return null;
        const updatedTransaction = { ...prev, [field]: value };
        if (field === 'accountingCode' || field === 'receiptUrl') {
          const isComplete = updatedTransaction.accountingCode && updatedTransaction.receiptUrl;
          return { ...updatedTransaction, status: isComplete ? "Pending Sync" : "Needs Info" };
        }
        return updatedTransaction;
      });
    }
  };
  
  const handleReceiptUpload = (transactionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const receiptUrl = event.target?.result as string;
         setTransactions(prev =>
            prev.map(t => {
              if (t.id === transactionId) {
                const isComplete = t.accountingCode && receiptUrl;
                return { ...t, receiptUrl, status: isComplete ? "Pending Sync" : "Needs Info" };
              }
              return t;
            })
        );
         if (selectedTransaction?.id === transactionId) {
            setSelectedTransaction(prev => {
              if (!prev) return null;
              const isComplete = prev.accountingCode && receiptUrl;
              return { ...prev, receiptUrl, status: isComplete ? "Pending Sync" : "Needs Info" };
            });
        }
    };
    reader.readAsDataURL(file);
  };

  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Transaction) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const sortedAndFilteredTransactions = React.useMemo(() => {
    let sortableItems = [...transactions];

    sortableItems = sortableItems.filter(transaction => {
      const searchTermLower = searchTerm.toLowerCase();
      return transaction.vendor.toLowerCase().includes(searchTermLower) ||
             transaction.description.toLowerCase().includes(searchTermLower) ||
             (transaction.accountingCode && transaction.accountingCode.toLowerCase().includes(searchTermLower));
    });

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || bValue === null) {
            if (aValue === bValue) return 0;
            return aValue === null ? 1 : -1;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [transactions, searchTerm, sortConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transactions</CardTitle>
        <CardDescription>
          Review transactions that require a cost code or receipt. Click headers to sort.
        </CardDescription>
        <div className="flex items-center gap-2 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">
                   <Button variant="ghost" onClick={() => requestSort('vendor')} className="px-0">
                    Transaction
                    {getSortIndicator('vendor')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')} className="px-0">
                    Date
                    {getSortIndicator('date')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('amount')} className="px-0">
                    Amount
                    {getSortIndicator('amount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')} className="px-0">
                    Status
                    {getSortIndicator('status')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredTransactions.map(transaction => (
                 <Dialog key={transaction.id} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedTransaction(null)
                    }
                 }}>
                  <DialogTrigger asChild>
                    <TableRow 
                      onClick={() => setSelectedTransaction(transaction)} 
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="font-medium">{transaction.vendor}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">{transaction.description}</div>
                      </TableCell>
                      <TableCell>{format(parseISO(transaction.date), 'MM/dd/yyyy')}</TableCell>
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
                        onUpdateField={handleFieldUpdate}
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
