'use client'

import Link from 'next/link'
import { MoonIcon, SunIcon, User, Menu, Home, Briefcase, Wallet, MessageSquare, Bell, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading state or determine navigation items based on user type
  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">ServiceHailing</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  // Navigation items for authenticated users (customers)
  const customerNavItems = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'Bookings', href: '/bookings', icon: Briefcase },
    { name: 'Wallet', href: '/customer/wallet', icon: Wallet },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ]

  // Navigation items for drivers
  const driverNavItems = [
    { name: 'Dashboard', href: '/driver/dashboard', icon: Home },
    { name: 'Bookings', href: '/driver/bookings', icon: Briefcase },
    { name: 'Earnings', href: '/driver/earnings', icon: Wallet },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ]

  // Navigation items for admins
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Bookings', href: '/admin/bookings', icon: Briefcase },
    { name: 'Pricing', href: '/admin/pricing', icon: Briefcase },
  ]

  // Navigation items for unauthenticated users
  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'About', href: '/about', icon: Home },
    { name: 'Contact', href: '/contact', icon: Home },
  ]

  // Determine navigation items based on user type
  let navItems = publicNavItems;
  if (user && profile) {
    if (profile.user_type === 'driver') {
      navItems = driverNavItems;
    } else if (profile.user_type === 'admin') {
      navItems = adminNavItems;
    } else {
      // Default to customer items for customers and any other user types
      navItems = customerNavItems;
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={user ?
              (profile?.user_type === 'driver' ? '/driver/dashboard' :
               profile?.user_type === 'admin' ? '/admin/dashboard' :
               '/customer/dashboard') :
              '/'
            }
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold">ServiceHailing</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href={item.href}>
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Dashboard Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex items-center gap-2"
          >
            <Link href={
              user ?
                (profile?.user_type === 'driver' ? '/driver/dashboard' :
                 profile?.user_type === 'admin' ? '/admin/dashboard' :
                 '/customer/dashboard') :
                '/'
            }>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>

          {/* Messages Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex items-center gap-2"
          >
            <Link href="/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Link>
          </Button>

          {/* Profile Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex items-center gap-2"
          >
            <Link href={
              profile?.user_type === 'driver' ? '/driver/dashboard' :
              profile?.user_type === 'admin' ? '/admin/dashboard' :
              '/customer/dashboard'
            }>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>

          {/* Center Helper Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex items-center gap-2"
          >
            <Link href="/help">
              <Briefcase className="h-4 w-4 mr-2" />
              Center Helper
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-6">
                {/* Quick Access Buttons for Mobile */}
                <Button
                  variant="outline"
                  asChild
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={
                    user ?
                      (profile?.user_type === 'driver' ? '/driver/dashboard' :
                       profile?.user_type === 'admin' ? '/admin/dashboard' :
                       '/customer/dashboard') :
                      '/'
                  }>
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  asChild
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  asChild
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={
                    profile?.user_type === 'driver' ? '/driver/dashboard' :
                    profile?.user_type === 'admin' ? '/admin/dashboard' :
                    '/customer/dashboard'
                  }>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  asChild
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/help">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Center Helper
                  </Link>
                </Button>

                {/* Original Navigation Items */}
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      asChild
                      className="justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={item.href}>
                        <IconComponent className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notification Bell */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Profile with Welcome Message and Reactions */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Welcome Message */}
              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  Welcome, <span className="font-semibold text-primary">{profile?.full_name || 'User'}</span>!
                </p>
              </div>
              
              {/* Reactions */}
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="text-lg">👍</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="text-lg">❤️</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="text-lg">😊</span>
                </Button>
              </div>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={profile?.avatar_url || ''}
                        alt={profile?.full_name || 'User'}
                      />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
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
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}