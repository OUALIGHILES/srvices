'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Wallet,
  Languages,
  Building,
  Map as MapIcon,
  User
} from 'lucide-react';

export function CustomerHeader() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    // Sign out logic would go here
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ServiceHailing</h2>
        </div>
        <div className="flex items-center gap-6">
          {/* Pricing Information - Wallet Balance */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-bold">
            <Wallet className="h-5 w-5" />
            <span>{(profile?.wallet_balance || 0).toFixed(0)} SR</span>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/dashboard">Dashboard</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/bookings">Bookings</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/messagerie">Messages</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/wallet">Wallet</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Languages className="h-4 w-4" />
            <span>AR/EN</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-500">Welcome,</p>
              <p className="text-sm font-bold group-hover:text-primary transition-colors">
                {profile?.full_name || 'User'}
              </p>
            </div>
            <div className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-200">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                  alt={profile?.full_name || 'User profile portrait'}
                />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}