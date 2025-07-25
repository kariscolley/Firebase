
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
import { type Transaction, type TransactionStatus } from '@/lib/data';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionDetailsDialog } from './transaction-details-dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '@/hooks/use-transactions';
import { Skeleton } from './ui/skeleton';

const statusStyles: { [key in TransactionStatus]: string } = {
  'Complete': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'Needs Info': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  'Pending Sync': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
};

type SortKey = keyof Transaction | null;

export function TransactionTable() {
  const { transactions, loading } = useTransactions();
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });

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
    // This is simplified for brevity. You might want to show different arrows for asc/desc.
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const sortedAndFilteredTransactions = React.useMemo(() => {
    let sortableItems = [...transactions];

    sortableItems = sortableItems.filter(transaction => {
      const searchTermLower = searchTerm.toLowerCase();
      return transaction.vendor.toLowerCase().includes(searchTermLower) ||
             transaction.description.toLowerCase().includes(searchTermLower) ||
             (transaction.codedFields.accountingCode && transaction.codedFields.accountingCode.toLowerCase().includes(searchTermLower));
    });

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // We can't sort by the 'codedFields' object directly, handle special cases
        if (sortConfig.key === 'codedFields') return 0;
        
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

  const selectedTransaction = React.useMemo(() => {
    return transactions.find(t => t.id === selectedTransactionId) || null;
  }, [selectedTransactionId, transactions]);

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`loading-${i}`}>
          <TableCell>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        </TableRow>
      ));
    }
    
    if (sortedAndFilteredTransactions.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                    No transactions found.
                </TableCell>
            </TableRow>
        );
    }

    return sortedAndFilteredTransactions.map(transaction => (
      <Dialog key={transaction.id} onOpenChange={(isOpen) => {
          if (isOpen) {
              setSelectedTransactionId(transaction.id)
          } else {
              setSelectedTransactionId(null)
          }
      }}>
        <DialogTrigger asChild>
          <TableRow className="cursor-pointer">
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
      </Dialog>
    ));
  };
  
  return (
    <>
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
                   <Button variant="ghost" onClick={() => requestSort('vendor')} className="px-0 group">
                    Transaction
                    {getSortIndicator('vendor')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')} className="px-0 group">
                    Date
                    {getSortIndicator('date')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('amount')} className="px-0 group">
                    Amount
                    {getSortIndicator('amount')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')} className="px-0 group">
                    Status
                    {getSortIndicator('status')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    
    {/* Dialog is now outside the table render loop to avoid issues with state and triggers */}
     <Dialog open={!!selectedTransactionId} onOpenChange={(isOpen) => !isOpen && setSelectedTransactionId(null)}>
        {selectedTransaction && (
          <TransactionDetailsDialog
              transaction={selectedTransaction}
              statusStyle={statusStyles[selectedTransaction.status]}
              onClose={() => setSelectedTransactionId(null)}
          />
        )}
      </Dialog>
    </>
  );
}
