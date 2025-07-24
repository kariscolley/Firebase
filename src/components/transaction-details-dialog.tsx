'use client';

import * as React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { type Transaction } from '@/lib/data';
import { CostCodeSuggester } from './cost-code-suggester';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    onUpdateField: (transactionId: string, field: keyof Transaction, value: string) => void;
    onReceiptUpload: (transactionId: string, file: File) => void;
    statusStyle: string;
}

export function TransactionDetailsDialog({ transaction, onUpdateField, onReceiptUpload, statusStyle }: TransactionDetailsDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onReceiptUpload(transaction.id, file);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onReceiptUpload(transaction.id, file);
    }
  };

  const handleFieldChange = (field: keyof Transaction) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(transaction.id, field, e.target.value);
  }

  const handleCostCodeUpdate = (transactionId: string, newCostCode: string) => {
    onUpdateField(transactionId, 'accountingCode', newCostCode);
  }

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{transaction.vendor}</DialogTitle>
        <DialogDescription>{transaction.description}</DialogDescription>
      </DialogHeader>
      <div className="grid md:grid-cols-2 gap-8 py-4">
        <div className="flex flex-col space-y-6">
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
            
            <div className="space-y-4 flex-grow">
              <div className="space-y-2">
                  <Label htmlFor="accountingCode">Accounting Code</Label>
                  <CostCodeSuggester transaction={transaction} onUpdateCostCode={handleCostCodeUpdate} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="memo">Memo</Label>
                  <Input id="memo" value={transaction.memo || ''} onChange={handleFieldChange('memo')} placeholder="Enter memo..."/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input id="jobName" value={transaction.jobName || ''} onChange={handleFieldChange('jobName')} placeholder="Enter job name..."/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="jobPhase">Job Phase</Label>
                  <Input id="jobPhase" value={transaction.jobPhase || ''} onChange={handleFieldChange('jobPhase')} placeholder="Enter job phase..."/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="jobCategory">Job Category</Label>
                  <Input id="jobCategory" value={transaction.jobCategory || ''} onChange={handleFieldChange('jobCategory')} placeholder="Enter job category..."/>
              </div>
            </div>
            <DialogClose asChild>
              <Button className="w-full mt-auto">
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit
              </Button>
            </DialogClose>
        </div>
        <div className="space-y-2 flex flex-col">
            <Label>Receipt</Label>
            {transaction.receiptUrl ? (
                <div className='relative group border rounded-lg overflow-hidden h-full'>
                    <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Image 
                        src={transaction.receiptUrl} 
                        alt="Transaction Receipt" 
                        layout="fill"
                        objectFit="contain"
                        className="bg-muted"
                        data-ai-hint="invoice document"
                      />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold">View Full Receipt</p>
                       </div>
                    </a>
                </div>
            ) : (
                <div
                    onClick={handleUploadClick}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                    className={cn(
                        "flex flex-col flex-grow items-center justify-center border-2 border-dashed rounded-lg p-8 text-center cursor-pointer h-full transition-colors",
                        "text-muted-foreground hover:text-primary hover:border-primary",
                        isDragging && "bg-accent border-primary"
                    )}
                >
                    <UploadCloud className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Drag & drop your receipt here</p>
                    <p className="text-sm">or click to browse</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                </div>
            )}
        </div>
      </div>
    </DialogContent>
  );
}
