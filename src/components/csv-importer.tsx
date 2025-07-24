'use client';

import React, { useState, useTransition } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { UploadCloud, CheckCircle, Loader } from 'lucide-react';
import { type AccountingField } from '@/lib/data';
import { saveAccountingFields } from '@/services/accounting-fields';

interface CsvRow {
  [key: string]: string;
}

export function CsvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AccountingField[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setData([]); // Reset preview on new file selection
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredHeaders = ['Job', 'Job Name', 'Phase', 'Phase Name', 'Category', 'Category Name'];
        const actualHeaders = results.meta.fields || [];
        const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

        if (missingHeaders.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid CSV Headers',
            description: `The following headers are missing: ${missingHeaders.join(', ')}`,
          });
          return;
        }

        const parsedData = (results.data as CsvRow[]).map(row => ({
            jobId: row['Job'],
            jobName: row['Job Name'],
            phaseId: row['Phase'],
            phaseName: row['Phase Name'],
            categoryId: row['Category'],
            categoryName: row['Category Name'],
        }));
        
        setData(parsedData);
        toast({
          title: 'Preview Ready',
          description: `Successfully parsed ${parsedData.length} rows. Click Save to apply.`,
        });
      },
      error: (error) => {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message,
        });
      },
    });
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
       try {
        await saveAccountingFields(data);
        toast({
            title: 'Changes Saved',
            description: 'The new accounting fields have been saved to the database.',
        });
    } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Failed to Save',
          description: 'Could not save the accounting fields to the database. Please check console for details.',
        });
        console.error(error);
    }
    })
  }
  
  const isSaveDisabled = isPending || data.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="flex-grow"
        />
        <Button onClick={handleImport} disabled={!file}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Preview CSV
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Imported Data Preview</h3>
          <ScrollArea className="h-72 w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0]).map((header) => (
                    <TableHead key={header}>{header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
           <Button onClick={handleSaveChanges} className="w-full" disabled={isSaveDisabled}>
            {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
