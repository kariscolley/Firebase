
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader, Sparkles, CheckCircle } from 'lucide-react';
import { getCostCodeSuggestion } from '@/app/actions';
import type { SuggestCostCodeOutput } from '@/ai/flows/suggest-cost-code';
import type { Transaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { useCostCodes } from '@/hooks/use-cost-codes';
import { Skeleton } from './ui/skeleton';
import { Combobox } from './ui/combobox';

interface CostCodeSuggesterProps {
  transaction: Transaction;
  onUpdateCostCode: (transactionId: string, newCostCode: string) => void;
}

export function CostCodeSuggester({ transaction, onUpdateCostCode }: CostCodeSuggesterProps) {
  const [suggestion, setSuggestion] = useState<SuggestCostCodeOutput | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { codes: costCodes, loading: loadingCodes } = useCostCodes();

  const handleSuggestion = () => {
    startTransition(async () => {
      try {
        const result = await getCostCodeSuggestion({
          transactionDescription: transaction.description,
          transactionAmount: transaction.amount,
          previousCostCodes: costCodes.filter(c => c.status === 'Active').map(c => `${c.account} - ${c.name}`)
        });
        setSuggestion(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
        setIsPopoverOpen(false);
      }
    });
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onUpdateCostCode(transaction.id, suggestion.suggestedCostCode);
      setIsPopoverOpen(false);
    }
  };

  const handleValueChange = (value: string | null) => {
    if (value) {
      onUpdateCostCode(transaction.id, value);
    }
  };

  if (loadingCodes) {
    return <Skeleton className="h-10 w-full" />
  }

  const activeCostCodes = costCodes.filter(c => c.status === 'Active').map(code => ({
      value: `${code.account} - ${code.name}`,
      label: `${code.account} - ${code.name}`
  }));

  return (
    <div className="flex items-center gap-2 w-full">
       <Combobox
            options={activeCostCodes}
            value={transaction.accountingCode || ''}
            onValueChange={handleValueChange}
            placeholder="Select accounting code..."
            searchPlaceholder="Search codes..."
        />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={handleSuggestion}
            aria-label="Get AI Suggestion"
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-headline">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Suggestion
              </CardTitle>
              <CardDescription>Based on transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex items-center justify-center h-24">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : suggestion ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="suggested-code">Suggested Code</Label>
                    <p id="suggested-code" className="font-semibold text-primary">{suggestion.suggestedCostCode}</p>
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence</Label>
                     <Progress value={suggestion.confidenceScore * 100} className="w-full h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{(suggestion.confidenceScore * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <Label htmlFor="reasoning">Reasoning</Label>
                    <p id="reasoning" className="text-sm text-muted-foreground italic">
                      "{suggestion.reasoning}"
                    </p>
                  </div>
                </div>
              ) : (
                 <div className="flex items-center justify-center h-24 text-muted-foreground">
                  No suggestion available.
                </div>
              )}
            </CardContent>
            {suggestion && !isPending && (
               <CardFooter>
                <Button className="w-full" onClick={handleApplySuggestion}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply Suggestion
                </Button>
              </CardFooter>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
