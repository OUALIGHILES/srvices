'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/auth-redirect');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center overflow-hidden">
      <div className="flex w-full min-h-screen">
        {/* Left Side: Marketing Panel (Visible on large screens) */}
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
          <img 
            alt="Heavy machinery at dusk" 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCydVSgTxb5LPUZkRYTBv9iFhBjrlnJmY1w8IlfieUxb78HSCVaLPCeo_V7qcj7gMbZSGWysifD1BprVWa7kjhLsypDJdvPu2IF2xDR5pFujV2vpTVA2UYCWzIJOUtqFy5jyLsbBPoQhZFUJwOOTTEJjuKoRkk7280hOuN86SLJZbztopp3R1gh8pn3kbeSSH7WvYpUb941fgd4E5xpSkmhJlP3QiG-cdhbLXL3-jf_gzFDlVOe9IJm0DvP_4mKrg-pLEYTdESBFA4" 
          />
          <div className="absolute inset-0 auth-bg-overlay flex flex-col justify-between p-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons text-white">construction</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">FleetPro</span>
            </div>
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                Manage your fleet and services with ease.
              </h1>
              <p className="text-blue-100 text-xl leading-relaxed">
                The all-in-one platform for modern construction logistics. Track, schedule, and optimize your operations from a single dashboard.
              </p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-white">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Active Fleets</div>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-white">
                <div className="text-3xl font-bold">12k</div>
                <div className="text-blue-200 text-sm">Service Points</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Authentication Form */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center items-center p-8 md:p-16 bg-white dark:bg-background-dark">
          <div className="w-full max-w-md">
            {/* Mobile Logo (Hidden on desktop) */}
            <div className="lg:hidden flex items-center space-x-2 mb-12">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="material-icons text-white text-sm">construction</span>
              </div>
              <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">FleetPro</span>
            </div>
            
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400">Please enter your details to access your dashboard.</p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail_outline</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline transition-all">Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_outline</span>
                  <input 
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-icons text-xl">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" 
                  id="remember-me" 
                  type="checkbox" 
                />
                <label className="ml-3 block text-sm text-slate-700 dark:text-slate-300" htmlFor="remember-me">Remember me for 30 days</label>
              </div>
              
              <button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98]" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              
              <Link 
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200" 
                href="#"
              >
                <span className="material-icons text-xl">person_outline</span>
                <span>Continue as Guest</span>
              </Link>
              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>
            
            {/* Footer */}
            <p className="mt-10 text-center text-slate-600 dark:text-slate-400">
              Don't have an account?
              <Link className="font-semibold text-primary hover:underline ml-1" href="/signup">Create an account</Link>
            </p>
            
            {/* Bottom Support */}
            <div className="mt-12 flex justify-center space-x-6 text-sm text-slate-400">
              <Link className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Terms of Service</Link>
              <Link className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Privacy Policy</Link>
              <Link className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Support</Link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
