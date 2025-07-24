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
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>This is your settings page. More content to come!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Application settings will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
