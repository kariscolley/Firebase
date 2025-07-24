import Header from '@/components/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  );
}
