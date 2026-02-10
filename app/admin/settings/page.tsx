'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import {
  Search,
  Bell,
  LayoutDashboard,
  Clipboard,
  DollarSign,
  Users,
  Car,
  Square,
  CreditCard,
  Settings,
  Languages,
  BellDot,
  KeyRound,
  Shield,
  Save,
  Plus,
  Copy,
  RotateCcw,
  Map,
  CreditCard as CreditCardIcon,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces
interface LanguageString {
  id: string;
  key: string;
  english: string;
  arabic: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

interface ApiKey {
  id: string;
  name: string;
  description: string;
  key: string;
  icon: 'map' | 'credit_card' | 'message';
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('language');
  
  // State for language strings
  const [languageStrings, setLanguageStrings] = useState<LanguageString[]>([
    { id: '1', key: 'app_welcome_title', english: 'Welcome to RideMaster', arabic: 'مرحباً بك في رايد ماستر' },
    { id: '2', key: 'order_status_pending', english: 'Awaiting Driver', arabic: 'بانتظار السائق' },
    { id: '3', key: 'btn_request_ride', english: 'Request Now', arabic: 'اطلب الآن' }
  ]);
  
  // State for notification templates
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([
    { 
      id: '1', 
      name: 'Driver Arrival SMS', 
      template: 'Your driver {{driver_name}} has arrived in a {{vehicle_model}} ({{plate_number}}).', 
      variables: ['{{driver_name}}', '{{vehicle_model}}', '{{plate_number}}'] 
    },
    { 
      id: '2', 
      name: 'OTP Verification Push', 
      template: 'Your verification code for RideMaster is {{otp_code}}. Do not share this with anyone.', 
      variables: ['{{otp_code}}'] 
    }
  ]);
  
  // State for API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Google Maps Platform', description: 'Used for routing and geolocation', key: 'AIzaSyB...Xy78z', icon: 'map' },
    { id: '2', name: 'Stripe Connect', description: 'Production Secret Key', key: 'sk_live_51...j9H2q', icon: 'credit_card' },
    { id: '3', name: 'Twilio SMS API', description: 'Account SID & Auth Token', key: 'AC7b2...e81c', icon: 'message' }
  ]);

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [user, profile, router]);

  // Handle saving language strings
  const saveLanguageStrings = () => {
    toast.success('Language strings saved successfully!');
    // In a real app, this would save to the database
  };

  // Handle adding a new language string
  const addNewLanguageString = () => {
    const newString: LanguageString = {
      id: (languageStrings.length + 1).toString(),
      key: `new_string_${languageStrings.length + 1}`,
      english: '',
      arabic: ''
    };
    setLanguageStrings([...languageStrings, newString]);
    toast.success('New string added!');
  };

  // Handle updating a language string
  const updateLanguageString = (id: string, field: 'english' | 'arabic', value: string) => {
    setLanguageStrings(languageStrings.map(str => 
      str.id === id ? { ...str, [field]: value } : str
    ));
  };

  // Handle updating a notification template
  const updateNotificationTemplate = (id: string, template: string) => {
    setNotificationTemplates(notificationTemplates.map(temp => 
      temp.id === id ? { ...temp, template } : temp
    ));
  };

  // Handle copying API key to clipboard
  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  // Handle regenerating API key
  const regenerateApiKey = (id: string) => {
    // In a real app, this would call an API to regenerate the key
    const newKey = `new_key_${Math.random().toString(36).substr(2, 9)}`;
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, key: newKey } : key
    ));
    toast.success('API key regenerated!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-slate-500 text-sm">Configure global platform parameters, localizations, and integrations.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveSection('language')}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all ${
              activeSection === 'language' 
                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Languages className="h-5 w-5" />
            Language Strings
          </button>
          <button 
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all ${
              activeSection === 'notifications' 
                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BellDot className="h-5 w-5" />
            Notification Templates
          </button>
          <button 
            onClick={() => setActiveSection('api')}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all ${
              activeSection === 'api' 
                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <KeyRound className="h-5 w-5" />
            API Keys & Webhooks
          </button>
          <button 
            onClick={() => setActiveSection('security')}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg transition-all ${
              activeSection === 'security' 
                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="h-5 w-5" />
            Security Settings
          </button>
        </aside>
        
        <div className="lg:col-span-3 space-y-8">
          {activeSection === 'language' && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="language">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Language Strings (AR/EN)</h2>
                  <p className="text-sm text-slate-500">Manage localized text across the mobile apps and web portal.</p>
                </div>
                <button 
                  onClick={saveLanguageStrings}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="pb-4 w-1/4">String Key</th>
                        <th className="pb-4 w-1/3">English (EN)</th>
                        <th className="pb-4 w-1/3 text-right">Arabic (AR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {languageStrings.map((str) => (
                        <tr key={str.id}>
                          <td className="py-4 text-xs font-mono text-slate-500">{str.key}</td>
                          <td className="py-4">
                            <input
                              type="text"
                              value={str.english}
                              onChange={(e) => updateLanguageString(str.id, 'english', e.target.value)}
                              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                            />
                          </td>
                          <td className="py-4" dir="rtl">
                            <input
                              type="text"
                              value={str.arabic}
                              onChange={(e) => updateLanguageString(str.id, 'arabic', e.target.value)}
                              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2 text-right font-sans"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={addNewLanguageString}
                  className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add New String
                </button>
              </div>
            </section>
          )}
          
          {activeSection === 'notifications' && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="notifications">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">Notification Templates</h2>
                <p className="text-sm text-slate-500">Configure push and SMS templates for automated alerts.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notificationTemplates.map((template) => (
                    <div key={template.id} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{template.name}</label>
                      <textarea
                        value={template.template}
                        onChange={(e) => updateNotificationTemplate(template.id, e.target.value)}
                        rows={3}
                        className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                      />
                      <p className="text-[10px] text-slate-400">
                        Available variables: {template.variables.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {activeSection === 'api' && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="api">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">API Keys & Integrations</h2>
                <p className="text-sm text-slate-500">Manage connections to third-party services.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div 
                      key={apiKey.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                          {apiKey.icon === 'map' && <Map className="h-5 w-5 text-blue-500" />}
                          {apiKey.icon === 'credit_card' && <CreditCardIcon className="h-5 w-5 text-purple-500" />}
                          {apiKey.icon === 'message' && <MessageCircle className="h-5 w-5 text-orange-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{apiKey.name}</p>
                          <p className="text-xs text-slate-500">{apiKey.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="px-3 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {apiKey.key}
                        </code>
                        <button 
                          onClick={() => copyApiKey(apiKey.key)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => regenerateApiKey(apiKey.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {activeSection === 'security' && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="security">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">Security Settings</h2>
                <p className="text-sm text-slate-500">Configure platform security policies and access controls.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-bold">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Require 2FA for admin accounts</p>
                    </div>
                    <button className="w-10 h-6 bg-primary rounded-full relative transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-bold">Session Timeout</p>
                      <p className="text-xs text-slate-500">Auto logout after period of inactivity</p>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-bold">IP Whitelisting</p>
                      <p className="text-xs text-slate-500">Restrict admin access to specific IPs</p>
                    </div>
                    <button className="w-10 h-6 bg-slate-300 rounded-full relative transition-colors">
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      
      <footer className="p-6 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            © 2023 RideMaster Admin Dashboard. All system changes are logged for security audits.
          </div>
          <div className="flex items-center gap-6">
            <a className="text-xs font-medium text-slate-400 hover:text-primary" href="#">Documentation</a>
            <a className="text-xs font-medium text-slate-400 hover:text-primary" href="#">API Reference</a>
            <a className="text-xs font-medium text-slate-400 hover:text-primary" href="#">System Health</a>
          </div>
        </div>
      </footer>
    </div>
  );
}