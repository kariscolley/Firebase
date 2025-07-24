import { AccountingFieldImporter } from "@/components/accounting-field-importer";
import { CostCodeImporter } from "@/components/cost-code-importer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your accounting fields and chart of accounts by importing CSV files.
        </p>
      </div>
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Accounting Fields</CardTitle>
            <CardDescription>
              Import your Jobs, Phases, and Categories from a CSV file. The required columns are:
              <code className="block bg-muted p-2 rounded-md my-2 text-sm">jobId, jobName, phaseId, phaseName, categoryId, categoryName</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountingFieldImporter />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>
             Import your chart of accounts from a CSV file. The required columns are:
             <code className="block bg-muted p-2 rounded-md my-2 text-sm">Account, Name, Status</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
             <CostCodeImporter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
