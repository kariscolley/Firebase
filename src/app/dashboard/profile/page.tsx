import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>This is your profile page. More content to come!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Profile details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
