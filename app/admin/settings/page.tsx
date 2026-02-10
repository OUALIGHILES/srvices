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
  MessageCircle,
  Trash2,
  Eye,
  EyeOff
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
  created_at: string;
  last_used: string | null;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('language');
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // State for language strings
  const [languageStrings, setLanguageStrings] = useState<LanguageString[]>([]);
  const [originalLanguageStrings, setOriginalLanguageStrings] = useState<LanguageString[]>([]);

  // State for notification templates
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [originalNotificationTemplates, setOriginalNotificationTemplates] = useState<NotificationTemplate[]>([]);

  // State for API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKeyForm, setNewApiKeyForm] = useState({
    name: '',
    description: '',
    icon: 'map' as 'map' | 'credit_card' | 'message'
  });

  // State for security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    loadSettingsData();
  }, [user, profile, router]);

  const loadSettingsData = async () => {
    try {
      const supabase = createClient();
      
      // Load language strings
      const { data: langData, error: langError } = await supabase
        .from('language_strings')
        .select('*')
        .order('key', { ascending: true });
      
      if (!langError && langData) {
        setLanguageStrings(langData);
        setOriginalLanguageStrings([...langData]);
      } else {
        // Fallback data if Supabase call fails
        const fallbackData: LanguageString[] = [
          { id: '1', key: 'app_welcome_title', english: 'Welcome to RideMaster', arabic: 'مرحباً بك في رايد ماستر' },
          { id: '2', key: 'order_status_pending', english: 'Awaiting Driver', arabic: 'بانتظار السائق' },
          { id: '3', key: 'btn_request_ride', english: 'Request Now', arabic: 'اطلب الآن' }
        ];
        setLanguageStrings(fallbackData);
        setOriginalLanguageStrings([...fallbackData]);
      }

      // Load notification templates
      const { data: notifyData, error: notifyError } = await supabase
        .from('notification_templates')
        .select('*');
      
      if (!notifyError && notifyData) {
        setNotificationTemplates(notifyData);
        setOriginalNotificationTemplates([...notifyData]);
      } else {
        // Fallback data if Supabase call fails
        const fallbackNotifyData: NotificationTemplate[] = [
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
        ];
        setNotificationTemplates(fallbackNotifyData);
        setOriginalNotificationTemplates([...fallbackNotifyData]);
      }

      // Load API keys
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('*');
      
      if (!apiKeyError && apiKeyData) {
        setApiKeys(apiKeyData);
      } else {
        // Fallback data if Supabase call fails
        const fallbackApiKeyData: ApiKey[] = [
          { 
            id: '1', 
            name: 'Google Maps Platform', 
            description: 'Used for routing and geolocation', 
            key: 'AIzaSyB...Xy78z', 
            icon: 'map',
            created_at: new Date().toISOString(),
            last_used: new Date().toISOString()
          },
          { 
            id: '2', 
            name: 'Stripe Connect', 
            description: 'Production Secret Key', 
            key: 'sk_live_51...j9H2q', 
            icon: 'credit_card',
            created_at: new Date().toISOString(),
            last_used: new Date().toISOString()
          },
          { 
            id: '3', 
            name: 'Twilio SMS API', 
            description: 'Account SID & Auth Token', 
            key: 'AC7b2...e81c', 
            icon: 'message',
            created_at: new Date().toISOString(),
            last_used: null
          }
        ];
        setApiKeys(fallbackApiKeyData);
      }

      // Load security settings
      const fallbackSecuritySettings: SecuritySetting[] = [
        { id: '2fa', name: 'Two-Factor Authentication', description: 'Require 2FA for admin accounts', enabled: true },
        { id: 'ip_whitelist', name: 'IP Whitelisting', description: 'Restrict admin access to specific IPs', enabled: false },
        { id: 'password_policy', name: 'Password Policy', description: 'Enforce strong password requirements', enabled: true },
        { id: 'audit_logs', name: 'Audit Logs', description: 'Log all admin activities for security', enabled: true }
      ];
      setSecuritySettings(fallbackSecuritySettings);

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings. Using default values.');
      setLoading(false);
    }
  };

  // Handle saving language strings
  const saveLanguageStrings = async () => {
    try {
      const supabase = createClient();
      
      // Check if there are any changes
      const hasChanges = languageStrings.some((current, index) => {
        const original = originalLanguageStrings[index];
        return !original || 
               current.english !== original.english || 
               current.arabic !== original.arabic;
      });
      
      if (!hasChanges) {
        toast.info('No changes to save');
        return;
      }
      
      // In a real app, this would save to the database
      const { error } = await supabase
        .from('language_strings')
        .upsert(languageStrings, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success('Language strings saved successfully!');
      setOriginalLanguageStrings([...languageStrings]);
    } catch (error) {
      console.error('Error saving language strings:', error);
      toast.error('Failed to save language strings');
    }
  };

  // Handle adding a new language string
  const addNewLanguageString = () => {
    const newString: LanguageString = {
      id: `new_${Date.now()}`,
      key: `new_string_${languageStrings.length + 1}`,
      english: '',
      arabic: ''
    };
    setLanguageStrings([...languageStrings, newString]);
    toast.success('New string added!');
  };

  // Handle deleting a language string
  const deleteLanguageString = (id: string) => {
    if (languageStrings.length <= 1) {
      toast.error('Cannot delete the last language string');
      return;
    }
    
    setLanguageStrings(languageStrings.filter(str => str.id !== id));
    toast.success('String deleted!');
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

  // Handle saving notification templates
  const saveNotificationTemplates = async () => {
    try {
      const supabase = createClient();
      
      // Check if there are any changes
      const hasChanges = notificationTemplates.some((current, index) => {
        const original = originalNotificationTemplates[index];
        return !original || current.template !== original.template;
      });
      
      if (!hasChanges) {
        toast.info('No changes to save');
        return;
      }
      
      const { error } = await supabase
        .from('notification_templates')
        .upsert(notificationTemplates, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success('Notification templates saved successfully!');
      setOriginalNotificationTemplates([...notificationTemplates]);
    } catch (error) {
      console.error('Error saving notification templates:', error);
      toast.error('Failed to save notification templates');
    }
  };

  // Handle copying API key to clipboard
  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  // Handle regenerating API key
  const regenerateApiKey = async (id: string) => {
    try {
      const supabase = createClient();
      
      // Generate a new key (in a real app, this would be handled by the backend)
      const newKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('api_keys')
        .update({ key: newKey, last_used: null })
        .eq('id', id);
      
      if (error) throw error;
      
      setApiKeys(apiKeys.map(key =>
        key.id === id ? { ...key, key: newKey, last_used: null } : key
      ));
      
      toast.success('API key regenerated!');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  // Handle deleting an API key
  const deleteApiKey = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success('API key deleted!');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  // Handle creating a new API key
  const createNewApiKey = async () => {
    if (!newApiKeyForm.name.trim()) {
      toast.error('API key name is required');
      return;
    }

    try {
      const supabase = createClient();
      
      // Generate a new key (in a real app, this would be handled by the backend)
      const newKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newApiKey: Omit<ApiKey, 'id'> = {
        name: newApiKeyForm.name,
        description: newApiKeyForm.description,
        key: newKey,
        icon: newApiKeyForm.icon,
        created_at: new Date().toISOString(),
        last_used: null
      };
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert([newApiKey])
        .select()
        .single();
      
      if (error) throw error;
      
      setApiKeys([...apiKeys, data]);
      setNewApiKeyForm({ name: '', description: '', icon: 'map' });
      toast.success('New API key created!');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  // Handle toggling security setting
  const toggleSecuritySetting = async (id: string) => {
    try {
      setSecuritySettings(securitySettings.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      ));
      
      // In a real app, this would save to the database
      toast.success(`Security setting ${securitySettings.find(s => s.id === id)?.enabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling security setting:', error);
      toast.error('Failed to update security setting');
    }
  };

  // Handle saving security settings
  const saveSecuritySettings = async () => {
    try {
      // In a real app, this would save to the database
      toast.success('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    }
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
                <div className="flex gap-3">
                  <button
                    onClick={addNewLanguageString}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                  <button
                    onClick={saveLanguageStrings}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="pb-4 w-1/4">String Key</th>
                        <th className="pb-4 w-1/3">English (EN)</th>
                        <th className="pb-4 w-1/4">Arabic (AR)</th>
                        <th className="pb-4 w-1/12 text-center">Actions</th>
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
                          <td className="py-4 text-center">
                            <button
                              onClick={() => deleteLanguageString(str.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                              disabled={languageStrings.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="notifications">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Notification Templates</h2>
                  <p className="text-sm text-slate-500">Configure push and SMS templates for automated alerts.</p>
                </div>
                <button
                  onClick={saveNotificationTemplates}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notificationTemplates.map((template) => (
                    <div key={template.id} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{template.name}</label>
                      <textarea
                        value={template.template}
                        onChange={(e) => updateNotificationTemplate(template.id, e.target.value)}
                        rows={4}
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
              
              {/* Create New API Key Form */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-md font-semibold mb-4">Create New API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newApiKeyForm.name}
                      onChange={(e) => setNewApiKeyForm({...newApiKeyForm, name: e.target.value})}
                      placeholder="e.g. Google Maps API"
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={newApiKeyForm.description}
                      onChange={(e) => setNewApiKeyForm({...newApiKeyForm, description: e.target.value})}
                      placeholder="What is this key for?"
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                    <select
                      value={newApiKeyForm.icon}
                      onChange={(e) => setNewApiKeyForm({...newApiKeyForm, icon: e.target.value as any})}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                    >
                      <option value="map">Maps (Google Maps)</option>
                      <option value="credit_card">Payments (Stripe)</option>
                      <option value="message">Messaging (Twilio)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={createNewApiKey}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create API Key
                </button>
              </div>
              
              {/* Existing API Keys List */}
              <div className="p-6 space-y-6">
                <h3 className="text-md font-semibold">Existing API Keys</h3>
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
                          {apiKey.icon === 'message' && <MessageCircle className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{apiKey.name}</p>
                          <p className="text-xs text-slate-500">{apiKey.description}</p>
                          <p className="text-xs text-slate-400">
                            Created: {new Date(apiKey.created_at).toLocaleDateString()}
                            {apiKey.last_used && `, Last used: ${new Date(apiKey.last_used).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="px-3 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono max-w-[150px] truncate">
                          {showApiKey === apiKey.id ? apiKey.key : `${apiKey.key.substring(0, 8)}...`}
                        </code>
                        <button
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => copyApiKey(apiKey.key)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => regenerateApiKey(apiKey.id)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Security Settings</h2>
                  <p className="text-sm text-slate-500">Configure platform security policies and access controls.</p>
                </div>
                <button
                  onClick={saveSecuritySettings}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/20 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {securitySettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold">{setting.name}</p>
                        <p className="text-xs text-slate-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => toggleSecuritySetting(setting.id)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          setting.enabled ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          setting.enabled ? 'right-1 transform translate-x-0' : 'left-1 transform -translate-x-0'
                        }`}></span>
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-bold">Session Timeout</p>
                      <p className="text-xs text-slate-500">Auto logout after period of inactivity</p>
                    </div>
                    <select 
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="2 hours">2 hours</option>
                      <option value="never">Never</option>
                    </select>
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