
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, UploadCloud, Image as ImageIcon, FileWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateTransactionInFirestore } from '@/app/actions';
import { Progress } from './ui/progress';

interface ReceiptUploaderProps {
  transactionId: string;
}

export function ReceiptUploader({ transactionId }: ReceiptUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload an image file (e.g., PNG, JPG, GIF).',
        });
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `receipts/${transactionId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'There was an error uploading your receipt. Please try again.',
        });
        setIsUploading(false);
        setUploadProgress(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const result = await updateTransactionInFirestore({
            id: transactionId,
            updates: { receiptUrl: downloadURL },
          });

          if (result.success) {
            toast({
              title: 'Success!',
              description: 'Your receipt has been uploaded.',
            });
          } else {
             throw new Error(result.message);
          }
        } catch (error) {
             console.error('Error updating firestore:', error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'The receipt was uploaded, but we failed to link it to the transaction.',
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
      }
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col flex-grow items-center justify-center border-2 border-dashed rounded-lg p-8 text-center h-full transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50',
        isUploading ? 'cursor-default' : 'cursor-pointer'
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Uploading...</p>
            {uploadProgress !== null && (
                <Progress value={uploadProgress} className="w-48 h-2" />
            )}
        </div>

      ) : isDragActive ? (
        <div className="flex flex-col items-center gap-4 text-primary">
            <ImageIcon className="h-10 w-10" />
            <p className="font-semibold">Drop the receipt here!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <UploadCloud className="h-10 w-10" />
          <p className="font-semibold">Drag & drop or click to upload</p>
          <p className="text-xs">Image (JPG, PNG, GIF)</p>
        </div>
      )}
    </div>
  );
}
