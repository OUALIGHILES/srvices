'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Wallet, Languages } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HomeHeader() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ServiceHailing</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-semibold hover:text-primary transition-colors" href="/bookings">
            My Bookings
          </Link>
          <Link className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors" href="/customer/wallet">
            <Wallet className="h-5 w-5" />
            <span>Wallet ({(profile?.wallet_balance || 0).toFixed(0)} SR)</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Languages className="h-4 w-4" />
            <span>AR/EN</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          {/* User Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                      alt={profile?.full_name || 'User profile portrait'}
                    />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  {profile?.user_type === 'driver' ? (
                    <Link href="/driver/dashboard">Profile</Link>
                  ) : profile?.user_type === 'admin' ? (
                    <Link href="/admin/dashboard">Profile</Link>
                  ) : (
                    <Link href="/customer/dashboard">Profile</Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {profile?.user_type === 'driver' ? (
                    <Link href="/driver/earnings">My Earnings</Link>
                  ) : profile?.user_type === 'admin' ? (
                    <Link href="/admin/dashboard">My Dashboard</Link>
                  ) : (
                    <Link href="/customer/wallet">My Wallet</Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {profile?.user_type === 'driver' ? (
                    <Link href="/driver/bookings">My Bookings</Link>
                  ) : profile?.user_type === 'admin' ? (
                    <Link href="/admin/bookings">Manage Bookings</Link>
                  ) : (
                    <Link href="/bookings">My Bookings</Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-500">Welcome,</p>
                <p className="text-sm font-bold group-hover:text-primary transition-colors">
                  {profile?.full_name || 'Ahmed Al-Saud'}
                </p>
              </div>
              <div className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-200">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                    alt={profile?.full_name || 'User profile portrait'}
                  />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}