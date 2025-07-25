
'use client';

import * as React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, Search } from 'lucide-react';
import { type Transaction, type CodedFields } from '@/lib/data';
import { useAccountingFields } from '@/hooks/use-accounting-fields';
import { CostCodeSuggester } from './cost-code-suggester';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ImageLightbox } from './image-lightbox';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Combobox } from './ui/combobox';
import { updateTransactionInFirestore } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ReceiptUploader } from './receipt-uploader';

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    statusStyle: string;
    onClose: () => void;
}

export function TransactionDetailsDialog({ transaction, statusStyle, onClose }: TransactionDetailsDialogProps) {
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const { fields: accountingFields, loading: loadingFields } = useAccountingFields();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const [localTransaction, setLocalTransaction] = React.useState(transaction);
  React.useEffect(() => {
    setLocalTransaction(transaction);
  }, [transaction]);

  const availableJobs = React.useMemo(() => {
    return [...new Map(accountingFields.map(item => [item.jobName, item])).values()]
      .map(job => ({ value: job.jobName, label: `${job.jobId} - ${job.jobName}`}));
  }, [accountingFields]);

  const availablePhases = React.useMemo(() => {
    if (!localTransaction.codedFields.jobName) return [];
    return accountingFields
      .filter(f => f.jobName === localTransaction.codedFields.jobName)
      .filter((value, index, self) => self.findIndex(t => t.phaseName === value.phaseName) === index)
      .map(phase => ({ value: phase.phaseName, label: `${phase.phaseId} - ${phase.phaseName}`}));
  }, [localTransaction.codedFields.jobName, accountingFields]);

  const availableCategories = React.useMemo(() => {
    if (!localTransaction.codedFields.jobPhase) return [];
     return accountingFields
      .filter(f => f.jobName === localTransaction.codedFields.jobName && f.phaseName === localTransaction.codedFields.jobPhase)
      .filter((value, index, self) => self.findIndex(t => t.categoryName === value.categoryName) === index)
      .map(cat => ({ value: cat.categoryName, label: `${cat.categoryId} - ${cat.categoryName}`}));
  }, [localTransaction.codedFields.jobName, localTransaction.codedFields.jobPhase, accountingFields]);

  const handleCodedFieldChange = (field: keyof CodedFields, value: string | null) => {
    setLocalTransaction(prev => {
        const newCodedFields = { ...prev.codedFields, [field]: value };
        
        if (field === 'jobName') {
            newCodedFields.jobPhase = null;
            newCodedFields.jobCategory = null;
        }
        if (field === 'jobPhase') {
            newCodedFields.jobCategory = null;
        }

        return { ...prev, codedFields: newCodedFields };
    });
  }

  const handleCostCodeUpdate = (newCostCode: string) => {
    handleCodedFieldChange('accountingCode', newCostCode);
  }
  
  const handleDeleteReceipt = async () => {
    const result = await updateTransactionInFirestore({
        id: localTransaction.id,
        updates: { receiptUrl: null }
    });
    if (result.success) {
        toast({ title: 'Success', description: 'Receipt removed.' });
        setIsLightboxOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await updateTransactionInFirestore({
        id: localTransaction.id,
        updates: {
            codedFields: localTransaction.codedFields,
        }
    });

    if (result.success) {
        toast({ title: 'Success', description: 'Transaction updated.' });
        onClose();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{localTransaction.vendor}</DialogTitle>
          <DialogDescription>{localTransaction.description}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 py-4">
          <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                      <p className="font-medium text-muted-foreground">Amount</p>
                      <p className="font-mono text-lg font-semibold">${localTransaction.amount.toFixed(2)}</p>
                  </div>
                   <div>
                      <p className="font-medium text-muted-foreground">Date</p>
                      <p>{format(parseISO(localTransaction.date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                      <p className="font-medium text-muted-foreground">Status</p>
                       <Badge variant="outline" className={statusStyle}>
                          {localTransaction.status}
                      </Badge>
                  </div>
              </div>
              
              <div className="space-y-4 flex-grow">
                <div className="space-y-2">
                    <Label>Accounting Code</Label>
                    <CostCodeSuggester transaction={localTransaction} onUpdateCostCode={handleCostCodeUpdate} />
                </div>
                <div className="space-y-2">
                    <Label>Memo</Label>
                    <Input 
                        value={localTransaction.codedFields.memo || ''} 
                        onChange={(e) => handleCodedFieldChange('memo', e.target.value)}
                        placeholder="Enter memo..."/>
                </div>
                { loadingFields ? (
                   <div className="space-y-4">
                      <div className="space-y-2">
                          <Label>Job Name</Label>
                          <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                          <Label>Job Phase</Label>
                          <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                          <Label>Job Category</Label>
                          <Skeleton className="h-10 w-full" />
                      </div>
                   </div>
                ) : (
                <>
                <div className="space-y-2">
                    <Label>Job Name</Label>
                    <Combobox
                        options={availableJobs}
                        value={localTransaction.codedFields.jobName || ''}
                        onValueChange={(value) => handleCodedFieldChange('jobName', value)}
                        placeholder="Select job..."
                        searchPlaceholder="Search jobs..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Job Phase</Label>
                    <Combobox
                        options={availablePhases}
                        value={localTransaction.codedFields.jobPhase || ''}
                        onValueChange={(value) => handleCodedFieldChange('jobPhase', value)}
                        placeholder="Select phase..."
                        searchPlaceholder="Search phases..."
                        disabled={!localTransaction.codedFields.jobName}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Job Category</Label>
                    <Combobox
                        options={availableCategories}
                        value={localTransaction.codedFields.jobCategory || ''}
                        onValueChange={(value) => handleCodedFieldChange('jobCategory', value)}
                        placeholder="Select category..."
                        searchPlaceholder="Search categories..."
                        disabled={!localTransaction.codedFields.jobPhase}
                    />
                </div>
                </>
                )}
              </div>
          </div>
          <div className="space-y-2 flex flex-col">
              <Label>Receipt</Label>
              {localTransaction.receiptUrl ? (
                  <div className='relative group border rounded-lg overflow-hidden h-full'>
                      <button onClick={() => setIsLightboxOpen(true)} className="w-full h-full absolute inset-0 z-10">
                        <span className="sr-only">View full receipt</span>
                      </button>
                      <Image 
                        src={localTransaction.receiptUrl} 
                        alt="Transaction Receipt" 
                        fill
                        className="object-contain bg-muted"
                        data-ai-hint="invoice document"
                      />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Search className="h-8 w-8 text-white"/>
                       </div>
                  </div>
              ) : (
                  <ReceiptUploader transactionId={localTransaction.id} />
              )}
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
       {localTransaction.receiptUrl && (
        <ImageLightbox 
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onDelete={handleDeleteReceipt}
          imageUrl={localTransaction.receiptUrl}
        />
      )}
    </>
  );
}
