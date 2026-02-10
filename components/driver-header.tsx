'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Navigation,
  User,
  Search
} from 'lucide-react';

export function DriverHeader() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/driver/dashboard') {
      // Special case: only match exact path for dashboard
      return pathname === path;
    }
    // For other paths, check if pathname starts with the path
    return pathname.startsWith(path);
  };

  const handleSignOut = () => {
    // Sign out logic would go here
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
            <Navigation className="h-5 w-5" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">ServiceStream</h2>
        </div>
        <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-primary">
            <div className="text-slate-500 flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-transparent focus:ring-0 placeholder:text-slate-500 text-sm font-normal"
              placeholder="Search requests..."
              defaultValue=""
            />
          </div>
        </label>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <div className="hidden lg:flex items-center gap-6">
          <a 
            className={`${isActive('/driver/dashboard') 
              ? 'text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1' 
              : 'text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors'}`}
            href="/driver/dashboard"
          >
            Dashboard
          </a>
          <a 
            className={`${isActive('/driver/earnings') 
              ? 'text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1' 
              : 'text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors'}`}
            href="/driver/earnings"
          >
            Earnings
          </a>
          <a 
            className={`${isActive('/driver/messagerie') 
              ? 'text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1' 
              : 'text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors'}`}
            href="/driver/messagerie"
          >
            Messages
          </a>
        </div>
        <div className="flex gap-2">
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
            <Bell />
          </button>
        </div>
        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">ONLINE</span>
            <span className="text-sm font-medium">{profile?.full_name || 'Driver'}</span>
          </div>
          <Avatar className="size-10 border-2 border-primary">
            <AvatarImage
              src={profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuC39cP2H9EdHXOrqCrlCGDHS26PIkX5xUdF1wZANeWfxnQAhRheQtMQhJ0Mt9kUdXZAHNQI1jmmqcznqH-bTuGANExwApgvGbDX7TcPI1s9VpNMeyuAGHvdK-ERGrV2WikG9oCpsiAFFC3XhoriQ2csXjOTmq9-uc5v-ZHXvmMHDncn0uVf-ZmjLVaKIY9tHI5Y9iWoNpZFln9lRYpQv2V6Xpb0LaFAUETmserky-Nxu2v3_a4jnsBtiJooT_oxXoQTJInSlIhJ3Xw"}
            />
            <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase() || 'D'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}