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
import { UploadCloud, CheckCircle, Trash2, Search } from 'lucide-react';
import { type Transaction, costCodes, accountingFields } from '@/lib/data';
import { CostCodeSuggester } from './cost-code-suggester';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ImageLightbox } from './image-lightbox';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    onUpdateField: (transactionId: string, field: keyof Transaction, value: string | null) => void;
    onReceiptUpload: (transactionId: string, file: File) => void;
    statusStyle: string;
}

export function TransactionDetailsDialog({ transaction, onUpdateField, onReceiptUpload, statusStyle }: TransactionDetailsDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  // Derive available options from the selected values
  const availableJobs = React.useMemo(() => {
    return [...new Map(accountingFields.map(item => [item.jobName, item])).values()];
  }, []);

  const availablePhases = React.useMemo(() => {
    if (!transaction.jobName) return [];
    return accountingFields
      .filter(f => f.jobName === transaction.jobName)
      .filter((value, index, self) => self.findIndex(t => t.phaseName === value.phaseName) === index);
  }, [transaction.jobName]);

  const availableCategories = React.useMemo(() => {
    if (!transaction.jobPhase) return [];
     return accountingFields
      .filter(f => f.jobName === transaction.jobName && f.phaseName === transaction.jobPhase)
      .filter((value, index, self) => self.findIndex(t => t.categoryName === value.categoryName) === index);
  }, [transaction.jobName, transaction.jobPhase]);


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

  const handleFieldChange = (field: keyof Transaction) => (value: string) => {
    onUpdateField(transaction.id, field, value);

    // Reset dependent fields if a parent changes
    if (field === 'jobName') {
        onUpdateField(transaction.id, 'jobPhase', null);
        onUpdateField(transaction.id, 'jobCategory', null);
    }
    if (field === 'jobPhase') {
        onUpdateField(transaction.id, 'jobCategory', null);
    }
  }

  const handleCostCodeUpdate = (transactionId: string, newCostCode: string) => {
    onUpdateField(transactionId, 'accountingCode', newCostCode);
  }
  
  const handleDeleteReceipt = () => {
    onUpdateField(transaction.id, 'receiptUrl', null);
    setIsLightboxOpen(false);
  };


  return (
    <>
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
                      <p>{format(parseISO(transaction.date), 'MMMM dd, yyyy')}</p>
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
                    <Label>Accounting Code</Label>
                    <CostCodeSuggester transaction={transaction} onUpdateCostCode={handleCostCodeUpdate} />
                </div>
                <div className="space-y-2">
                    <Label>Memo</Label>
                    <Input value={transaction.memo || ''} onChange={(e) => onUpdateField(transaction.id, 'memo', e.target.value)} placeholder="Enter memo..."/>
                </div>
                <div className="space-y-2">
                    <Label>Job Name</Label>
                    <Select value={transaction.jobName || ''} onValueChange={handleFieldChange('jobName')}>
                        <SelectTrigger><SelectValue placeholder="Select job name..." /></SelectTrigger>
                        <SelectContent>
                            {availableJobs.map(job => <SelectItem key={job.jobName} value={job.jobName}>{job.jobName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Job Phase</Label>
                    <Select value={transaction.jobPhase || ''} onValueChange={handleFieldChange('jobPhase')} disabled={!transaction.jobName}>
                        <SelectTrigger><SelectValue placeholder="Select job phase..." /></SelectTrigger>
                        <SelectContent>
                            {availablePhases.map(phase => <SelectItem key={phase.phaseName} value={phase.phaseName}>{phase.phaseName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Job Category</Label>
                    <Select value={transaction.jobCategory || ''} onValueChange={handleFieldChange('jobCategory')} disabled={!transaction.jobPhase}>
                        <SelectTrigger><SelectValue placeholder="Select job category..." /></SelectTrigger>
                        <SelectContent>
                            {availableCategories.map(category => <SelectItem key={category.categoryName} value={category.categoryName}>{category.categoryName}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                      <button onClick={() => setIsLightboxOpen(true)} className="w-full h-full absolute inset-0 z-10">
                        <span className="sr-only">View full receipt</span>
                      </button>
                      <Image 
                        src={transaction.receiptUrl} 
                        alt="Transaction Receipt" 
                        fill
                        className="object-contain bg-muted"
                        data-ai-hint="invoice document"
                      />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Search className="h-8 w-8 text-white"/>
                       </div>
                       <Button
                          variant="destructive"
                          size="icon"
                          onClick={handleDeleteReceipt}
                          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete receipt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
       {transaction.receiptUrl && (
        <ImageLightbox 
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onDelete={handleDeleteReceipt}
          imageUrl={transaction.receiptUrl}
        />
      )}
    </>
  );
}
