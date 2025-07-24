import { TransactionTable } from "@/components/transaction-table";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here are your transactions needing attention.
        </p>
      </div>
      <TransactionTable />
    </div>
  );
}
