
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
import { UploadCloud, CheckCircle, Trash2, Search, Loader } from 'lucide-react';
import { type Transaction } from '@/lib/data';
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface TransactionDetailsDialogProps {
    transaction: Transaction;
    statusStyle: string;
    onClose: () => void;
}

export function TransactionDetailsDialog({ transaction, statusStyle, onClose }: TransactionDetailsDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const { fields: accountingFields, loading: loadingFields } = useAccountingFields();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
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
    if (!localTransaction.jobName) return [];
    return accountingFields
      .filter(f => f.jobName === localTransaction.jobName)
      .filter((value, index, self) => self.findIndex(t => t.phaseName === value.phaseName) === index)
      .map(phase => ({ value: phase.phaseName, label: `${phase.phaseId} - ${phase.phaseName}`}));
  }, [localTransaction.jobName, accountingFields]);

  const availableCategories = React.useMemo(() => {
    if (!localTransaction.jobPhase) return [];
     return accountingFields
      .filter(f => f.jobName === localTransaction.jobName && f.phaseName === localTransaction.jobPhase)
      .filter((value, index, self) => self.findIndex(t => t.categoryName === value.categoryName) === index)
      .map(cat => ({ value: cat.categoryName, label: `${cat.categoryId} - ${cat.categoryName}`}));
  }, [localTransaction.jobName, localTransaction.jobPhase, accountingFields]);


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleReceiptUpload(file);
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
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleReceiptUpload(file);
    }
  };

  const handleFieldChange = (field: keyof Transaction, value: string | null) => {
    setLocalTransaction(prev => {
        const newState = { ...prev, [field]: value };
        // Reset dependent fields if a parent changes
        if (field === 'jobName') {
            newState.jobPhase = null;
            newState.jobCategory = null;
        }
        if (field === 'jobPhase') {
            newState.jobCategory = null;
        }
        return newState;
    });
  }

  const handleCostCodeUpdate = (newCostCode: string) => {
    handleFieldChange('accountingCode', newCostCode);
  }
  
  const handleDeleteReceipt = () => {
    handleFieldChange('receiptUrl', null);
    setIsLightboxOpen(false);
  };

  const handleReceiptUpload = async (file: File) => {
      setIsUploading(true);
      const storage = getStorage();
      // Create a unique path for the file
      const filePath = `receipts/${transaction.id}/${file.name}`;
      const storageRef = ref(storage, filePath);

      try {
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          handleFieldChange('receiptUrl', downloadURL);
          toast({ title: "Success", description: "Receipt uploaded successfully." });
      } catch (error) {
          console.error("Error uploading receipt:", error);
          toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload the receipt." });
      } finally {
          setIsUploading(false);
      }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await updateTransactionInFirestore({
        id: localTransaction.id,
        updates: {
            accountingCode: localTransaction.accountingCode,
            memo: localTransaction.memo,
            jobName: localTransaction.jobName,
            jobPhase: localTransaction.jobPhase,
            jobCategory: localTransaction.jobCategory,
            receiptUrl: localTransaction.receiptUrl,
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
                        value={localTransaction.memo || ''} 
                        onChange={(e) => handleFieldChange('memo', e.target.value)}
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
                        value={localTransaction.jobName || ''}
                        onValueChange={(value) => handleFieldChange('jobName', value)}
                        placeholder="Select job..."
                        searchPlaceholder="Search jobs..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Job Phase</Label>
                    <Combobox
                        options={availablePhases}
                        value={localTransaction.jobPhase || ''}
                        onValueChange={(value) => handleFieldChange('jobPhase', value)}
                        placeholder="Select phase..."
                        searchPlaceholder="Search phases..."
                        disabled={!localTransaction.jobName}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Job Category</Label>
                    <Combobox
                        options={availableCategories}
                        value={localTransaction.jobCategory || ''}
                        onValueChange={(value) => handleFieldChange('jobCategory', value)}
                        placeholder="Select category..."
                        searchPlaceholder="Search categories..."
                        disabled={!localTransaction.jobPhase}
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
                          isDragging && "bg-accent border-primary",
                          isUploading && "cursor-wait"
                      )}
                  >
                    { isUploading ? (
                        <>
                           <Loader className="h-12 w-12 mb-4 animate-spin" />
                           <p className="font-semibold">Uploading...</p>
                        </>
                    ) : (
                       <>
                         <UploadCloud className="h-12 w-12 mb-4" />
                         <p className="font-semibold">Drag & drop your receipt here</p>
                         <p className="text-sm">or click to browse</p>
                       </>
                    )}
                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*,application/pdf"
                          disabled={isUploading}
                      />
                  </div>
              )}
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
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
