'use client';

import * as React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, Receipt } from 'lucide-react';
import { type Transaction } from '@/lib/data';
import { CostCodeSuggester } from './cost-code-suggester';

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    onUpdateCostCode: (transactionId: string, newCostCode: string) => void;
    onReceiptUpload: (transactionId: string) => void;
    statusStyle: string;
}

export function TransactionDetailsDialog({ transaction, onUpdateCostCode, onReceiptUpload, statusStyle }: TransactionDetailsDialogProps) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{transaction.vendor}</DialogTitle>
        <DialogDescription>{transaction.description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="font-medium text-muted-foreground">Amount</p>
                <p className="font-mono text-lg font-semibold">${transaction.amount.toFixed(2)}</p>
            </div>
             <div>
                <p className="font-medium text-muted-foreground">Date</p>
                <p>{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div>
                <p className="font-medium text-muted-foreground">Status</p>
                 <Badge variant="outline" className={statusStyle}>
                    {transaction.status}
                </Badge>
            </div>
        </div>

        <div className="space-y-2">
            <p className="font-medium text-muted-foreground">Cost Code</p>
            <CostCodeSuggester transaction={transaction} onUpdateCostCode={onUpdateCostCode} />
        </div>
        
        <div className="space-y-2">
             <p className="font-medium text-muted-foreground">Receipt</p>
              {transaction.receiptUrl ? (
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-500" />
                        <span>View Receipt</span>
                    </Button>
                </div>
            ) : (
                <Button variant="outline" size="sm" onClick={() => onReceiptUpload(transaction.id)}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload Receipt
                </Button>
            )}
        </div>
      </div>
    </DialogContent>
  );
}
