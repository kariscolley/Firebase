
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import type { CostCode } from '@/lib/data';
import { saveCostCodesAction } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader, UploadCloud } from 'lucide-react';

const REQUIRED_HEADERS = ['Account', 'Name', 'Status'];

export function CostCodeImporter() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<CostCode[]>([]);
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

        const data = (results.data as any[]).map((row, index) => ({
            id: row.Account || `${index}`,
            account: row.Account || '',
            name: row.Name || '',
            status: row.Status === 'Active' ? 'Active' : 'Inactive',
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
      const result = await saveCostCodesAction(parsedData);
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
                        <TableHead>Account</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {parsedData.slice(0, 10).map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.account}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.status}</TableCell>
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
