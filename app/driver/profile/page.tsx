'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Star,
  Bell,
  Navigation,
  User,
  LogOut,
  Car,
  Badge as BadgeIcon,
  FileCheck,
  Fingerprint,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Camera,
  ChevronUp,
  FileText,
  Shield,
  Upload,
  X,
  Loader2,
} from 'lucide-react';

interface DriverProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  phone?: string;
  location?: string;
  rating?: number;
  is_available?: boolean;
  verification_status?: string;
  status?: string;
  created_at?: string;
}

interface VerificationStatus {
  license: boolean;
  vehicle_registration: boolean;
  insurance: boolean;
  background_check: boolean;
  overall_status: string;
  rejection_reason?: string;
}

interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  service_class: string;
  is_primary: boolean;
  verification_status: string;
}

interface Stats {
  totalTrips: number;
  yearsActive: number;
  points: number;
  rank: number;
  tier: string;
  totalEarnings: number;
}

interface DocumentItem {
  id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export default function DriverProfile() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const supabase = createClient();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    license: false,
    vehicle_registration: false,
    insurance: false,
    background_check: false,
    overall_status: 'incomplete',
  });
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [primaryVehicle, setPrimaryVehicle] = useState<VehicleInfo | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    yearsActive: 0,
    points: 0,
    rank: 0,
    tier: 'bronze',
    totalEarnings: 0,
  });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    license_plate: '',
    service_class: 'Comfort',
  });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch driver data
  const fetchDriverData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch driver profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user:', userError);
      }

      if (userData) {
        setDriverProfile(userData);
        setFormData({
          full_name: userData.full_name || '',
          phone: userData.phone_number || '',
          location: userData.location || '',
          bio: userData.bio || '',
        });
      }

      // Fetch verification status
      const { data: verificationData, error: verificationError } = await supabase
        .from('driver_verifications')
        .select('*')
        .eq('driver_id', user.id)
        .single();

      if (verificationData) {
        setVerificationStatus({
          license: verificationData.license_verified || false,
          vehicle_registration: verificationData.vehicle_verified || false,
          insurance: verificationData.insurance_verified || false,
          background_check: verificationData.background_check_verified || false,
          overall_status: verificationData.overall_status || 'incomplete',
          rejection_reason: verificationData.rejection_reason,
        });
      }

      // Fetch driver stats
      const { data: statsData, error: statsError } = await supabase
        .from('driver_stats')
        .select('*')
        .eq('driver_id', user.id)
        .single();

      if (statsData) {
        setStats({
          totalTrips: statsData.total_rides || 0,
          yearsActive: Number(statsData.years_active) || 0,
          points: statsData.points || 0,
          rank: statsData.rank || 0,
          tier: statsData.tier || 'bronze',
          totalEarnings: Number(statsData.total_earnings) || 0,
        });
      }

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', user.id);

      if (vehiclesData) {
        setVehicles(vehiclesData);
        const primary = vehiclesData.find(v => v.is_primary) || vehiclesData[0];
        if (primary) {
          setPrimaryVehicle(primary);
          setVehicleForm({
            make: primary.make,
            model: primary.model || '',
            year: primary.year,
            color: primary.color,
            license_plate: primary.license_plate,
            service_class: primary.service_class || 'Comfort',
          });
        }
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsData) {
        setDocuments(documentsData);
      }

    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchDriverData();
    }
  }, [user, fetchDriverData]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone,
          location: formData.location,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update auth context profile
      if (profile) {
        await updateProfile({
          ...profile,
          full_name: formData.full_name,
          phone_number: formData.phone,
          location: formData.location,
          bio: formData.bio,
        });
      }

      setDriverProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        phone_number: formData.phone,
        location: formData.location,
        bio: formData.bio,
      } : null);

      setIsEditDialogOpen(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle vehicle update
  const handleUpdateVehicle = async () => {
    if (!user) return;

    try {
      setSaving(true);

      if (primaryVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            make: vehicleForm.make,
            model: vehicleForm.model,
            year: vehicleForm.year,
            color: vehicleForm.color,
            license_plate: vehicleForm.license_plate,
            service_class: vehicleForm.service_class,
          })
          .eq('id', primaryVehicle.id);

        if (error) throw error;
      } else {
        // Insert new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert({
            driver_id: user.id,
            make: vehicleForm.make,
            model: vehicleForm.model,
            year: vehicleForm.year,
            color: vehicleForm.color,
            license_plate: vehicleForm.license_plate,
            service_class: vehicleForm.service_class,
            is_primary: true,
          })
          .select()
          .single();

        if (error) throw error;
        
        setPrimaryVehicle(data);
        setVehicles(prev => [...prev, data]);
      }

      setIsVehicleDialogOpen(false);
      alert('Vehicle updated successfully!');
      
      // Refresh data
      fetchDriverData();
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!user || !selectedFile || !selectedDocumentType) return;

    try {
      setUploading(true);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${selectedDocumentType}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { error: insertError } = await supabase
        .from('driver_documents')
        .insert({
          driver_id: user.id,
          document_type: selectedDocumentType,
          document_url: urlData.publicUrl,
          status: 'pending',
        });

      if (insertError) throw insertError;

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedDocumentType('');
      alert('Document uploaded successfully! It will be reviewed shortly.');
      
      // Refresh data
      fetchDriverData();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  // Get document by type
  const getDocumentByType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  // Get completed verification count
  const getCompletedCount = () => {
    return Object.values({
      license: verificationStatus.license,
      vehicle_registration: verificationStatus.vehicle_registration,
      insurance: verificationStatus.insurance,
      background_check: verificationStatus.background_check,
    }).filter(Boolean).length;
  };

  // Get status badge
  const getStatusBadge = () => {
    const completed = getCompletedCount();
    if (completed === 4) {
      return { text: 'Verified', color: 'green' };
    } else if (completed >= 2) {
      return { text: 'Pending Approval', color: 'amber' };
    } else {
      return { text: 'Incomplete', color: 'red' };
    }
  };

  // Open upload dialog for specific document type
  const openUploadDialog = (docType: string) => {
    setSelectedDocumentType(docType);
    setIsUploadDialogOpen(true);
  };

  // Get document display info
  const getDocumentInfo = (type: string) => {
    const doc = getDocumentByType(type);
    if (!doc) {
      return { status: 'not_submitted', displayText: 'Not submitted' };
    }
    
    if (doc.status === 'approved') {
      return { status: 'verified', displayText: 'Verified' };
    } else if (doc.status === 'rejected') {
      return { status: 'rejected', displayText: `Rejected: ${doc.rejection_reason || 'Please resubmit'}` };
    } else {
      return { status: 'pending', displayText: 'Under Review' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Page Layout */}
      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 py-8 lg:px-10">
          {/* Page Title & Primary Status Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Profile & Verification
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                Manage your driver identity, vehicle details, and track your platform verification status.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                  statusBadge.color === 'green'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                    : statusBadge.color === 'amber'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                }`}
              >
                {statusBadge.color === 'green' ? (
                  <CheckCircle className="text-sm h-4 w-4" />
                ) : statusBadge.color === 'amber' ? (
                  <Clock className="text-sm h-4 w-4" />
                ) : (
                  <AlertCircle className="text-sm h-4 w-4" />
                )}
                <span className="text-sm font-bold uppercase tracking-wider">{statusBadge.text}</span>
              </div>
              <Button 
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <Edit className="h-4 w-4" />
                Update Info
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Metrics & Documents */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Metric Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cumulative Rating</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-black">
                      {(driverProfile?.rating || 0).toFixed(2)}
                    </h3>
                    <span className="text-green-600 text-sm font-bold flex items-center">
                      +0.05 <ChevronUp className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 text-amber-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                    <Star className="h-5 w-5" />
                  </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Trips</p>
                  <h3 className="text-3xl font-black mt-2">{stats.totalTrips.toLocaleString()}</h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase font-semibold">
                    {stats.tier === 'gold' ? 'Gold' : stats.tier === 'silver' ? 'Silver' : stats.tier === 'platinum' ? 'Platinum' : 'Bronze'} Tier Driver
                  </p>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Years Active</p>
                  <h3 className="text-3xl font-black mt-2">{stats.yearsActive}</h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase font-semibold">
                    Since {driverProfile?.created_at ? new Date(driverProfile.created_at).getFullYear() : new Date().getFullYear() - Math.floor(stats.yearsActive)}
                  </p>
                </Card>
              </div>

              {/* Verification Hub */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Shield className="text-primary h-5 w-5" />
                    Verification Checklist
                  </h2>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {getCompletedCount()} of 4 Completed
                  </span>
                </div>
                <div className="p-0">
                  {/* Driver's License */}
                  <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-lg flex items-center justify-center ${
                          verificationStatus.license
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <BadgeIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">Driver&apos;s License</p>
                        <p className="text-sm text-slate-500">
                          {getDocumentInfo('license_front').displayText}
                        </p>
                      </div>
                    </div>
                    {verificationStatus.license ? (
                      <CheckCircle className="text-green-500 h-6 w-6" />
                    ) : (
                      <Button
                        onClick={() => openUploadDialog('license_front')}
                        className="text-xs font-bold text-white bg-primary px-3 py-1.5 border border-primary rounded hover:opacity-90 transition-all"
                      >
                        UPLOAD
                      </Button>
                    )}
                  </div>

                  {/* Vehicle Registration */}
                  <div
                    className={`flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 ${
                      !verificationStatus.vehicle_registration &&
                      'bg-amber-50/30 dark:bg-amber-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-lg flex items-center justify-center ${
                          verificationStatus.vehicle_registration
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                        }`}
                      >
                        <Car className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">Vehicle Registration</p>
                        <p className="text-sm text-slate-500">
                          {getDocumentInfo('vehicle_registration').displayText}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {verificationStatus.vehicle_registration ? (
                        <CheckCircle className="text-green-500 h-6 w-6" />
                      ) : (
                        <>
                          <Button
                            onClick={() => openUploadDialog('vehicle_registration')}
                            className="text-xs font-bold text-white bg-amber-600 px-3 py-1.5 border border-amber-600 rounded hover:opacity-90 transition-all"
                          >
                            UPLOAD
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Insurance Certificate */}
                  <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-lg flex items-center justify-center ${
                          verificationStatus.insurance
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <FileCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">Insurance Certificate</p>
                        <p className="text-sm text-slate-500">
                          {getDocumentInfo('insurance').displayText}
                        </p>
                      </div>
                    </div>
                    {verificationStatus.insurance ? (
                      <CheckCircle className="text-green-500 h-6 w-6" />
                    ) : (
                      <Button
                        onClick={() => openUploadDialog('insurance')}
                        className="text-xs font-bold text-white bg-primary px-3 py-1.5 border border-primary rounded hover:opacity-90 transition-all"
                      >
                        UPLOAD
                      </Button>
                    )}
                  </div>

                  {/* Background Check */}
                  <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-lg flex items-center justify-center border-2 ${
                          verificationStatus.background_check
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 border-solid border-green-200 dark:border-green-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <Fingerprint className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">Background Check</p>
                        <p className="text-sm text-slate-500">Required annual update</p>
                      </div>
                    </div>
                    {verificationStatus.background_check ? (
                      <CheckCircle className="text-green-500 h-6 w-6" />
                    ) : (
                      <Button
                        onClick={() => alert('Background check initiation will be implemented. This typically redirects to a third-party service.')}
                        className="text-xs font-bold text-white bg-primary px-3 py-1.5 border border-primary rounded hover:opacity-90 transition-all"
                      >
                        START NOW
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Professional Details Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">Professional Information</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="text-primary text-sm font-bold flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Full Legal Name
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {driverProfile?.full_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Primary Email
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {driverProfile?.email || profile?.email || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Mobile Phone
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {driverProfile?.phone || profile?.phone_number || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Address
                    </label>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {driverProfile?.location || 'Not set'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Vehicle & Photo */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Profile Photo Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="size-32 border-4 border-background-light dark:border-slate-800 shadow-xl">
                    <AvatarImage src={driverProfile?.avatar_url || profile?.avatar_url} />
                    <AvatarFallback>
                      {(driverProfile?.full_name || profile?.full_name || 'D').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => alert('Profile photo upload will be implemented.')}
                    className="absolute bottom-0 right-0 size-10 rounded-full bg-primary text-white border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="mt-4 text-xl font-bold">{driverProfile?.full_name || profile?.full_name || 'Driver'}</h3>
                <p className="text-slate-500 text-sm">
                  Member since {driverProfile?.created_at ? new Date(driverProfile.created_at).getFullYear() : new Date().getFullYear()}
                </p>
                <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-around">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Points</p>
                    <p className="text-lg font-black text-primary">{stats.points.toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Rank</p>
                    <p className="text-lg font-black text-primary">#{stats.rank}</p>
                  </div>
                </div>
              </Card>

              {/* Vehicle Details Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-900 p-4 relative overflow-hidden h-32 flex items-end">
                  <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: primaryVehicle 
                        ? `url(https://source.unsplash.com/400x200/?${primaryVehicle.make},${primaryVehicle.model})`
                        : 'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=200&fit=crop")',
                    }}
                  ></div>
                  <div className="relative z-20">
                    <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">
                      Primary Vehicle
                    </p>
                    <h4 className="text-white font-black text-xl">
                      {primaryVehicle ? `${primaryVehicle.year} ${primaryVehicle.make}` : 'No Vehicle'}
                    </h4>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500">License Plate</span>
                    <span className="font-bold text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                      {primaryVehicle?.license_plate || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500">Year / Color</span>
                    <span className="font-bold text-sm">
                      {primaryVehicle ? `${primaryVehicle.year} • ${primaryVehicle.color}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500">Service Class</span>
                    <span className="font-bold text-sm text-primary">
                      {primaryVehicle?.service_class || 'N/A'}
                    </span>
                  </div>
                  <Button 
                    onClick={() => setIsVehicleDialogOpen(true)}
                    className="mt-2 w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {primaryVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                  </Button>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
                <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6">
                  Application Timeline
                </h2>
                <div className="relative flex flex-col gap-6">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="size-6 rounded-full bg-green-500 flex items-center justify-center text-white z-10">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Profile Submitted</p>
                      <p className="text-xs text-slate-400">
                        {driverProfile?.created_at 
                          ? new Date(driverProfile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className={`size-6 rounded-full flex items-center justify-center text-white z-10 ${
                      verificationStatus.license ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}>
                      {verificationStatus.license ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Identity Verified</p>
                      <p className="text-xs text-slate-400">
                        {verificationStatus.license ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className={`size-6 rounded-full flex items-center justify-center text-white z-10 ${
                      verificationStatus.overall_status === 'verified' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                    }`}>
                      {verificationStatus.overall_status === 'verified' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-600">Re-Verification</p>
                      <p className="text-xs text-slate-400">
                        {verificationStatus.overall_status === 'verified' ? 'Completed' : 'In Progress (Annual Review)'}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-4 opacity-30">
                    <div className="size-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-white z-10">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Review Completed</p>
                      <p className="text-xs text-slate-400">Expected in 48h</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{primaryVehicle ? 'Edit' : 'Add'} Vehicle</DialogTitle>
            <DialogDescription>
              {primaryVehicle ? 'Update' : 'Add'} your vehicle information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  placeholder="Toyota"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="Camry"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  placeholder="2023"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                  placeholder="Blue"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                value={vehicleForm.license_plate}
                onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value.toUpperCase() })}
                placeholder="ABC-123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service_class">Service Class</Label>
              <select
                id="service_class"
                value={vehicleForm.service_class}
                onChange={(e) => setVehicleForm({ ...vehicleForm, service_class: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Economy">Economy</option>
                <option value="Comfort">Comfort</option>
                <option value="Premium">Premium</option>
                <option value="Van">Van</option>
                <option value="Green">Green</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVehicle} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Vehicle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload your {selectedDocumentType.replace('_', ' ')} document. Accepted formats: JPG, PNG, PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="document">Select File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-slate-500">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload} disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
