'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link as LinkIcon, LogOut, Settings, User, RefreshCw, Loader } from "lucide-react";
import Link from "next/link";
import { syncWithRamp } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


export default function Header() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncWithRamp();
       if (result.success) {
        toast({ title: 'Sync Initiated', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Sync Failed', description: result.message });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsSyncing(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <LinkIcon className="h-5 w-5" />
          </div>
          <span className="font-headline text-lg font-bold">Ramp Link</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
           <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm">
            {isSyncing ? <Loader className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
            Sync with Ramp
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@weber.co
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
