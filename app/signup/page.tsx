'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [userType, setUserType] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Driver-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const userData = {
        full_name: fullName,
        phone_number: `${countryCode}${phoneNumber}`,
        user_type: userType,
        language: 'en',
      };

      // Add driver-specific fields if user is a driver
      if (userType === 'driver') {
        Object.assign(userData, {
          license_number: licenseNumber,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_color: vehicleColor,
          plate_number: plateNumber,
        });
      }

      await signUp(email, password, userData);
      
      // Redirect based on user type
      if (userType === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push('/driver/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
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
          <div className="absolute inset-0 auth-bg-overlay flex flex-col justify-between p-16 bg-black bg-opacity-40 dark:bg-opacity-60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons text-white">construction</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">FleetPro</span>
            </div>
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                Join the future of fleet management.
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
        <div className="w-full lg:w-2/5 flex flex-col bg-white dark:bg-background-dark overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-md mx-auto py-12 px-8 md:px-12 flex flex-col min-h-full">
            {/* Mobile Logo (Hidden on desktop) */}
            <div className="lg:hidden flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="material-icons text-white text-sm">construction</span>
              </div>
              <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">FleetPro</span>
            </div>
            
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {userType === 'customer' ? 'Create your account' : 'Join FleetPro'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                {userType === 'customer' 
                  ? 'Join FleetPro to start managing your services today.' 
                  : 'Register as a professional driver and start your journey.'}
              </p>
            </div>
            
            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I am a...</label>
              <div className="role-selector grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                <div>
                  <input 
                    checked={userType === 'customer'} 
                    className="sr-only" 
                    id="role-customer" 
                    name="role" 
                    type="radio"
                    onChange={() => setUserType('customer')}
                  />
                  <label 
                    className={`flex items-center justify-center py-2.5 px-4 rounded-lg cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400 transition-all ${
                      userType === 'customer' 
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                        : ''
                    }`}
                    htmlFor="role-customer"
                  >
                    Customer
                  </label>
                </div>
                <div>
                  <input 
                    checked={userType === 'driver'} 
                    className="sr-only" 
                    id="role-driver" 
                    name="role" 
                    type="radio"
                    onChange={() => setUserType('driver')}
                  />
                  <label 
                    className={`flex items-center justify-center py-2.5 px-4 rounded-lg cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400 transition-all ${
                      userType === 'driver' 
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                        : ''
                    }`}
                    htmlFor="role-driver"
                  >
                    Driver
                  </label>
                </div>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="fullname">Full Name</label>
                <div className="relative">
                  <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person_outline</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                    id="fullname" 
                    placeholder="John Doe" 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="email">Email Address</label>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="phone">Phone Number</label>
                <div className="flex space-x-2">
                  <div className="relative w-28 shrink-0">
                    <select
                      className="w-full pl-4 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none appearance-none text-sm dark:text-white shadow-sm cursor-pointer"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+974">🇶🇦 +974</option>
                    </select>
                    <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                  <div className="relative flex-1">
                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone_iphone</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                      id="phone" 
                      placeholder="(555) 000-0000" 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Driver-specific fields - only show when driver is selected */}
              {userType === 'driver' && (
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 space-y-4">
                  <div className="flex items-center space-x-2 pb-1">
                    <span className="material-symbols-outlined text-primary text-xl">badge</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Professional Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="license_number">License Number</label>
                      <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">assignment_ind</span>
                        <input 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                          id="license_number" 
                          placeholder="ABC-12345678" 
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          required={userType === 'driver'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="vehicle_make">Vehicle Make</label>
                      <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">branding_watermark</span>
                        <input 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                          id="vehicle_make" 
                          placeholder="e.g. Mercedes" 
                          type="text"
                          value={vehicleMake}
                          onChange={(e) => setVehicleMake(e.target.value)}
                          required={userType === 'driver'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="vehicle_model">Vehicle Model</label>
                      <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">minor_crash</span>
                        <input 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                          id="vehicle_model" 
                          placeholder="e.g. Actros" 
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          required={userType === 'driver'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="vehicle_color">Vehicle Color</label>
                      <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">palette</span>
                        <input 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                          id="vehicle_color" 
                          placeholder="e.g. Silver" 
                          type="text"
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          required={userType === 'driver'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="plate_number">Plate Number</label>
                      <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">subtitles</span>
                        <input 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm" 
                          id="plate_number" 
                          placeholder="XYZ-890" 
                          type="text"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          required={userType === 'driver'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="password">Password</label>
                  <div className="relative">
                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_outline</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm text-sm" 
                      id="password" 
                      placeholder="••••••••" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="confirm_password">Confirm Password</label>
                  <div className="relative">
                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">verified_user</span>
                    <input 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-white shadow-sm text-sm" 
                      id="confirm_password" 
                      placeholder="••••••••" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div className="flex items-start pt-1">
                <div className="flex items-center h-5">
                  <input 
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" 
                    id="terms" 
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                </div>
                <label className="ml-3 text-xs md:text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">
                  I agree to the <a className="text-primary font-medium hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-medium hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>
              
              {/* Submit button */}
              <button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98] mt-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : userType === 'customer' ? 'Create account' : 'Complete Registration'}
              </button>
            </form>
            
            {/* Footer */}
            <div className="mt-auto pt-8">
              <p className="text-center text-slate-600 dark:text-slate-400">
                Already have an account?
                <Link className="font-semibold text-primary hover:underline ml-1" href="/login">Sign in</Link>
              </p>
              <div className="mt-8 flex justify-center space-x-6 text-xs text-slate-400">
                <Link className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Terms</Link>
                <Link className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Privacy</Link>
                <Link className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">Help Center</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
