import { CsvImporter } from "@/components/csv-importer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Import Accounting Fields</CardTitle>
          <CardDescription>
            Upload a CSV file to update the accounting fields (Jobs, Phases, Categories) available for transactions. 
            The CSV must have the headers: Job, Job Name, Phase, Phase Name, Category, Category Name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvImporter />
        </CardContent>
      </Card>
    </div>
  );
}
