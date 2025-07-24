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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, SlidersHorizontal, Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusStyles: { [key in TransactionStatus]: string } = {
  'Complete': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
  'Needs Info': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  'Pending Sync': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
};

const statusOptions: TransactionStatus[] = ['Needs Info', 'Pending Sync', 'Complete'];

export function TransactionTable() {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TransactionStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = React.useState<DateRange | undefined>(undefined);

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

  const filteredTransactions = transactions.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.vendor.toLowerCase().includes(searchTermLower) ||
      transaction.description.toLowerCase().includes(searchTermLower);
    
    const matchesStatus =
      statusFilter === 'all' || transaction.status === statusFilter;

    const transactionDate = new Date(transaction.date);
    const matchesDate = 
      !dateFilter ||
      (dateFilter.from && !dateFilter.to && transactionDate >= dateFilter.from) ||
      (dateFilter.from && dateFilter.to && transactionDate >= dateFilter.from && transactionDate <= dateFilter.to);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transactions</CardTitle>
        <CardDescription>
          Review transactions that require a cost code or receipt.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vendor or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter?.from ? (
                    dateFilter.to ? (
                      <>
                        {format(dateFilter.from, "LLL dd, y")} -{" "}
                        {format(dateFilter.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateFilter.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date</span>
                  )}
                </Button>
              </PopoverTrigger>
               {dateFilter && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDateFilter(undefined)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateFilter?.from}
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
              {filteredTransactions.map(transaction => (
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
