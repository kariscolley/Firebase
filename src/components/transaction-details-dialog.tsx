'use client';

import * as React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, Receipt } from 'lucide-react';
import { type Transaction } from '@/lib/data';
import { CostCodeSuggester } from './cost-code-suggester';

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    onUpdateCostCode: (transactionId: string, newCostCode: string) => void;
    onReceiptUpload: (transactionId: string, file: File) => void;
    statusStyle: string;
}

export function TransactionDetailsDialog({ transaction, onUpdateCostCode, onReceiptUpload, statusStyle }: TransactionDetailsDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onReceiptUpload(transaction.id, file);
    }
  };

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
             <div>
                <p className="font-medium text-muted-foreground">Memo</p>
                <p>{transaction.memo || 'N/A'}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
             <div>
                <p className="font-medium text-muted-foreground">Job Name</p>
                <p>{transaction.jobName || 'N/A'}</p>
            </div>
             <div>
                <p className="font-medium text-muted-foreground">Job Phase</p>
                <p>{transaction.jobPhase || 'N/A'}</p>
            </div>
             <div>
                <p className="font-medium text-muted-foreground">Job Category</p>
                <p>{transaction.jobCategory || 'N/A'}</p>
            </div>
        </div>

        <div className="space-y-2">
            <p className="font-medium text-muted-foreground">Accounting Code</p>
            <CostCodeSuggester transaction={transaction} onUpdateCostCode={onUpdateCostCode} />
        </div>
        
        <div className="space-y-2">
             <p className="font-medium text-muted-foreground">Receipt</p>
              {transaction.receiptUrl ? (
                <div className='flex items-center gap-2'>
                    <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-green-500" />
                          <span>View Receipt</span>
                      </Button>
                    </a>
                </div>
            ) : (
                <>
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Receipt
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                />
                </>
            )}
        </div>
      </div>
    </DialogContent>
  );
}
