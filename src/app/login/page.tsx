import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <LinkIcon className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">Ramp Link</h1>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Log in to sync your transactions and manage expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard">Log In with Weber Group</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
