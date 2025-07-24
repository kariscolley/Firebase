
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import type { AccountingField } from '@/lib/data';
import { saveAccountingFieldsAction } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader, UploadCloud } from 'lucide-react';

const REQUIRED_HEADERS = ['jobId', 'jobName', 'phaseId', 'phaseName', 'categoryId', 'categoryName'];

export function AccountingFieldImporter() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<AccountingField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileParse = (file: File) => {
    setError(null);
    setParsedData([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          setError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }
        
        // Basic validation
        const data = (results.data as any[]).map(row => ({
            jobId: row.jobId || '',
            jobName: row.jobName || '',
            phaseId: row.phaseId || '',
            phaseName: row.phaseName || '',
            categoryId: row.categoryId || '',
            categoryName: row.categoryName || ''
        }));
        
        setParsedData(data);
      },
      error: (err) => {
        setError(`Error parsing file: ${err.message}`);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileParse(e.target.files[0]);
    }
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      const result = await saveAccountingFieldsAction(parsedData);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <UploadCloud className="mr-2" />
                Select CSV File
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv"
            />
        </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {parsedData.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-md border max-h-64 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Category</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {parsedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row.jobId} - {row.jobName}</TableCell>
                        <TableCell>{row.phaseId} - {row.phaseName}</TableCell>
                        <TableCell>{row.categoryId} - {row.categoryName}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
          {parsedData.length > 10 && (
            <p className="text-sm text-center text-muted-foreground">Showing first 10 of {parsedData.length} rows.</p>
          )}

          <Button onClick={handleSaveChanges} disabled={pending}>
            {pending && <Loader className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
