'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User } from 'lucide-react';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profile, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await signOut();
      // The auth-context now handles the redirect
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Generate initials from the user's full name
  const getInitials = (fullName: string) => {
    if (!fullName) return 'AU';
    const names = fullName.trim().split(' ');
    const initials = names.map(name => name.charAt(0)).join('');
    return initials.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
        aria-label="Profile menu"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold leading-none">
            {profile?.full_name || 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {profile?.user_type || 'Admin'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {getInitials(profile?.full_name || 'Admin User')}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile?.full_name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email || 'admin@example.com'}
            </p>
          </div>
          
          <div className="px-2 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;