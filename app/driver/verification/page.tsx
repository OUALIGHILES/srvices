'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import {
  CheckCircle,
  Upload,
  Info,
  Lock,
  Headphones,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  FileText,
  Car,
  FileCheck,
  Loader2
} from 'lucide-react';

interface DocumentData {
  id?: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at?: string;
}

interface VerificationData {
  identity?: {
    document_type: string;
    license_number: string;
    front_url: string;
    back_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  };
  vehicle?: {
    vehicle_type: string;
    license_plate: string;
    registration_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  };
  insurance?: {
    provider: string;
    policy_number: string;
    document_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  };
}

export default function VerificationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const supabase = createClient();

  // Identity state
  const [documentType, setDocumentType] = useState("Driver's License");
  const [licenseNumber, setLicenseNumber] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  
  // Vehicle state
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState<string | null>(null);
  
  // Insurance state
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [insuranceDocument, setInsuranceDocument] = useState<string | null>(null);

  // Verification status from database
  const [verificationStatus, setVerificationStatus] = useState<VerificationData>({
    identity: {
      document_type: '',
      license_number: '',
      front_url: '',
      back_url: '',
      status: 'not_submitted'
    },
    vehicle: {
      vehicle_type: '',
      license_plate: '',
      registration_url: '',
      status: 'not_submitted'
    },
    insurance: {
      provider: '',
      policy_number: '',
      document_url: '',
      status: 'not_submitted'
    }
  });

  // Load existing verification data on mount
  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    if (!user) return;

    try {
      const { data: documents, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (documents && documents.length > 0) {
        // Process documents by category
        const identityDocs = documents.filter(d => ['identity_front', 'identity_back'].includes(d.document_type));
        const vehicleDoc = documents.find(d => d.document_type === 'vehicle_registration');
        const insuranceDoc = documents.find(d => d.document_type === 'insurance');

        // Load identity data
        if (identityDocs.length > 0) {
          const frontDoc = identityDocs.find(d => d.document_type === 'identity_front');
          const backDoc = identityDocs.find(d => d.document_type === 'identity_back');
          
          setVerificationStatus(prev => ({
            ...prev,
            identity: {
              document_type: frontDoc?.metadata?.document_type || "Driver's License",
              license_number: frontDoc?.metadata?.license_number || '',
              front_url: frontDoc?.document_url || '',
              back_url: backDoc?.document_url || '',
              status: frontDoc?.status || 'pending'
            }
          }));

          if (frontDoc?.document_url) setFrontImage(frontDoc.document_url);
          if (backDoc?.document_url) setBackImage(backDoc.document_url);
          if (frontDoc?.metadata?.document_type) setDocumentType(frontDoc.metadata.document_type);
          if (frontDoc?.metadata?.license_number) setLicenseNumber(frontDoc.metadata.license_number);
        }

        // Load vehicle data
        if (vehicleDoc) {
          setVerificationStatus(prev => ({
            ...prev,
            vehicle: {
              vehicle_type: vehicleDoc.metadata?.vehicle_type || '',
              license_plate: vehicleDoc.metadata?.license_plate || '',
              registration_url: vehicleDoc.document_url || '',
              status: vehicleDoc.status
            }
          }));
          if (vehicleDoc.document_url) setVehicleRegistration(vehicleDoc.document_url);
          if (vehicleDoc.metadata?.vehicle_type) setVehicleType(vehicleDoc.metadata.vehicle_type);
          if (vehicleDoc.metadata?.license_plate) setLicensePlate(vehicleDoc.metadata.license_plate);
        }

        // Load insurance data
        if (insuranceDoc) {
          setVerificationStatus(prev => ({
            ...prev,
            insurance: {
              provider: insuranceDoc.metadata?.provider || '',
              policy_number: insuranceDoc.metadata?.policy_number || '',
              document_url: insuranceDoc.document_url || '',
              status: insuranceDoc.status
            }
          }));
          if (insuranceDoc.document_url) setInsuranceDocument(insuranceDoc.document_url);
          if (insuranceDoc.metadata?.provider) setInsuranceProvider(insuranceDoc.metadata.provider);
          if (insuranceDoc.metadata?.policy_number) setPolicyNumber(insuranceDoc.metadata.policy_number);
        }
      }
    } catch (error: any) {
      console.error('Error loading verification data:', error);
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    const total = 4;

    if (verificationStatus.identity?.status === 'approved') completed++;
    if (verificationStatus.vehicle?.status === 'approved') completed++;
    if (verificationStatus.insurance?.status === 'approved') completed++;
    if (verificationStatus.identity?.status !== 'not_submitted' || 
        verificationStatus.vehicle?.status !== 'not_submitted' || 
        verificationStatus.insurance?.status !== 'not_submitted') {
      completed += 0.25; // Partial progress for submission
    }

    return Math.min(100, Math.round((completed / total) * 100));
  };

  const uploadToSupabaseStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}-${Date.now()}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFrontImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to preview image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to preview image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVehicleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleRegistration(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to preview image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInsuranceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInsuranceDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to preview image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSavingDraft(true);

    try {
      // Save identity documents
      if (frontImage || backImage) {
        const metadata = {
          document_type: documentType,
          license_number: licenseNumber
        };

        // Save front image
        if (frontImage && frontImage.startsWith('data:')) {
          const blob = await fetch(frontImage).then(r => r.blob());
          const file = new File([blob], 'identity_front.jpg', { type: 'image/jpeg' });
          const url = await uploadToSupabaseStorage(file, 'driver-documents', 'identity-front');
          
          await supabase.from('driver_documents').upsert({
            driver_id: user.id,
            document_type: 'identity_front',
            document_url: url,
            status: 'pending',
            metadata
          }, { onConflict: ['driver_id', 'document_type'] });
        }

        // Save back image
        if (backImage && backImage.startsWith('data:')) {
          const blob = await fetch(backImage).then(r => r.blob());
          const file = new File([blob], 'identity_back.jpg', { type: 'image/jpeg' });
          const url = await uploadToSupabaseStorage(file, 'driver-documents', 'identity-back');
          
          await supabase.from('driver_documents').upsert({
            driver_id: user.id,
            document_type: 'identity_back',
            document_url: url,
            status: 'pending',
            metadata
          }, { onConflict: ['driver_id', 'document_type'] });
        }
      }

      toast({
        title: 'Draft saved',
        description: 'Your progress has been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitIdentity = async () => {
    if (!user) return;
    if (!frontImage || !backImage) {
      toast({
        title: 'Missing documents',
        description: 'Please upload both front and back images of your ID.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        document_type: documentType,
        license_number: licenseNumber
      };

      // Upload front image
      let frontUrl = frontImage;
      if (frontImage.startsWith('data:')) {
        const blob = await fetch(frontImage).then(r => r.blob());
        const file = new File([blob], 'identity_front.jpg', { type: 'image/jpeg' });
        frontUrl = await uploadToSupabaseStorage(file, 'driver-documents', 'identity-front');
      }

      // Upload back image
      let backUrl = backImage;
      if (backImage.startsWith('data:')) {
        const blob = await fetch(backImage).then(r => r.blob());
        const file = new File([blob], 'identity_back.jpg', { type: 'image/jpeg' });
        backUrl = await uploadToSupabaseStorage(file, 'driver-documents', 'identity-back');
      }

      // Save to database
      const { error: frontError } = await supabase.from('driver_documents').upsert({
        driver_id: user.id,
        document_type: 'identity_front',
        document_url: frontUrl,
        status: 'pending',
        metadata
      }, { onConflict: ['driver_id', 'document_type'] });

      if (frontError) throw frontError;

      const { error: backError } = await supabase.from('driver_documents').upsert({
        driver_id: user.id,
        document_type: 'identity_back',
        document_url: backUrl,
        status: 'pending',
        metadata
      }, { onConflict: ['driver_id', 'document_type'] });

      if (backError) throw backError;

      // Update local state
      setVerificationStatus(prev => ({
        ...prev,
        identity: {
          document_type: documentType,
          license_number: licenseNumber,
          front_url: frontUrl,
          back_url: backUrl,
          status: 'pending'
        }
      }));

      toast({
        title: 'Documents submitted',
        description: 'Your identity documents have been submitted for verification.',
        action: <ToastAction altText="View status">View Status</ToastAction>,
      });

      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error submitting identity documents:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVehicle = async () => {
    if (!user) return;
    if (!vehicleRegistration) {
      toast({
        title: 'Missing document',
        description: 'Please upload your vehicle registration document.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        vehicle_type: vehicleType,
        license_plate: licensePlate
      };

      // Upload document
      let regUrl = vehicleRegistration;
      if (vehicleRegistration.startsWith('data:')) {
        const blob = await fetch(vehicleRegistration).then(r => r.blob());
        const file = new File([blob], 'vehicle_registration.jpg', { type: 'image/jpeg' });
        regUrl = await uploadToSupabaseStorage(file, 'driver-documents', 'vehicle-registration');
      }

      // Save to database
      const { error } = await supabase.from('driver_documents').upsert({
        driver_id: user.id,
        document_type: 'vehicle_registration',
        document_url: regUrl,
        status: 'pending',
        metadata
      }, { onConflict: ['driver_id', 'document_type'] });

      if (error) throw error;

      setVerificationStatus(prev => ({
        ...prev,
        vehicle: {
          vehicle_type: vehicleType,
          license_plate: licensePlate,
          registration_url: regUrl,
          status: 'pending'
        }
      }));

      toast({
        title: 'Vehicle registration submitted',
        description: 'Your vehicle documents have been submitted for verification.',
      });

      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error submitting vehicle documents:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInsurance = async () => {
    if (!user) return;
    if (!insuranceDocument) {
      toast({
        title: 'Missing document',
        description: 'Please upload your insurance policy document.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata = {
        provider: insuranceProvider,
        policy_number: policyNumber
      };

      // Upload document
      let insuranceUrl = insuranceDocument;
      if (insuranceDocument.startsWith('data:')) {
        const blob = await fetch(insuranceDocument).then(r => r.blob());
        const file = new File([blob], 'insurance_policy.jpg', { type: 'image/jpeg' });
        insuranceUrl = await uploadToSupabaseStorage(file, 'driver-documents', 'insurance');
      }

      // Save to database
      const { error } = await supabase.from('driver_documents').upsert({
        driver_id: user.id,
        document_type: 'insurance',
        document_url: insuranceUrl,
        status: 'pending',
        metadata
      }, { onConflict: ['driver_id', 'document_type'] });

      if (error) throw error;

      setVerificationStatus(prev => ({
        ...prev,
        insurance: {
          provider: insuranceProvider,
          policy_number: policyNumber,
          document_url: insuranceUrl,
          status: 'pending'
        }
      }));

      toast({
        title: 'Insurance submitted',
        description: 'Your insurance documents have been submitted for verification.',
      });

      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error submitting insurance documents:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    if (!user) return;

    // Check if all documents are submitted
    if (!verificationStatus.identity?.front_url || 
        !verificationStatus.vehicle?.registration_url || 
        !verificationStatus.insurance?.document_url) {
      toast({
        title: 'Incomplete submission',
        description: 'Please complete all document uploads before final submission.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user status to pending_verification
      const { error: userError } = await supabase
        .from('users')
        .update({ status: 'pending_approval' })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update profile locally
      if (profile) {
        profile.status = 'pending_approval';
      }

      toast({
        title: 'Verification submitted!',
        description: 'All documents have been submitted. Our team will review within 2-3 business days.',
      });

      // Refresh page to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStyles = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (stepId === currentStep) {
      return 'border-2 border-primary bg-primary/5';
    }
    if (status === 'approved') {
      return 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (status === 'rejected') {
      return 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20';
    }
    if (status === 'pending') {
      return 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
    }
    return 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70';
  };

  const getStepStatus = (stepId: number): string => {
    if (stepId === 1) return verificationStatus.identity?.status || 'not_submitted';
    if (stepId === 2) return verificationStatus.vehicle?.status || 'not_submitted';
    if (stepId === 3) return verificationStatus.insurance?.status || 'not_submitted';
    return 'locked';
  };

  const getStepNumberStyles = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (status === 'approved') {
      return 'size-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold';
    }
    if (status === 'rejected') {
      return 'size-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold';
    }
    if (status === 'pending') {
      return 'size-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold';
    }
    if (stepId === currentStep) {
      return 'size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold';
    }
    return 'size-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold';
  };

  const steps = [
    { id: 1, title: 'Identity Card', icon: FileText },
    { id: 2, title: 'Vehicle Registration', icon: Car },
    { id: 3, title: 'Insurance Policy', icon: FileCheck },
    { id: 4, title: 'Final Review', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="flex-1 px-4 md:px-20 lg:px-40 py-8">
        <div className="max-w-[1024px] mx-auto">
          {/* Page Header & Progress */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Document Verification Center</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl">
                To start receiving ride requests, please upload valid legal documents. Your information is encrypted and secure.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              SSL SECURED
            </div>
          </div>

          {/* Progress Bar Component */}
          <Card className="p-6 mb-8 shadow-sm">
            <div className="flex gap-6 justify-between items-center mb-3">
              <p className="text-slate-900 dark:text-white text-base font-bold">Overall Compliance Progress</p>
              <span className="text-primary text-sm font-black bg-primary/10 px-3 py-1 rounded-lg">{calculateProgress()}% Completed</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
            <div className="flex justify-between mt-3 text-xs font-medium text-slate-500">
              <span>{Object.values(verificationStatus).filter(s => s?.status === 'approved').length} of 4 documents verified</span>
              <span>
                {verificationStatus.identity?.status !== 'approved' && 'Identity '}
                {verificationStatus.vehicle?.status !== 'approved' && 'Vehicle '}
                {verificationStatus.insurance?.status !== 'approved' && 'Insurance '}
              </span>
            </div>
          </Card>

          {/* Main Workflow Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Navigation Stepper */}
            <div className="lg:w-1/3 flex flex-col gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${getStepStyles(step.id)} ${
                    step.id <= 3 || getStepStatus(step.id) !== 'not_submitted' ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    const status = getStepStatus(step.id);
                    if (status !== 'locked' && status !== 'not_submitted') {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <div className={getStepNumberStyles(step.id)}>
                    {getStepStatus(step.id) === 'approved' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : getStepStatus(step.id) === 'rejected' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                    <p className={`text-xs ${
                      getStepStatus(step.id) === 'approved' ? 'text-green-600 font-semibold' :
                      getStepStatus(step.id) === 'rejected' ? 'text-red-600 font-semibold' :
                      getStepStatus(step.id) === 'pending' ? 'text-amber-600 font-semibold' :
                      step.id === currentStep ? 'text-primary font-semibold' : 'text-slate-500'
                    }`}>
                      {getStepStatus(step.id) === 'approved' && 'Verified'}
                      {getStepStatus(step.id) === 'rejected' && 'Needs Attention'}
                      {getStepStatus(step.id) === 'pending' && 'Under Review'}
                      {getStepStatus(step.id) === 'not_submitted' && 'Pending Upload'}
                      {getStepStatus(step.id) === 'locked' && 'Locked'}
                    </p>
                  </div>
                  {step.id <= 3 && getStepStatus(step.id) !== 'locked' && (
                    <ChevronRight className="ml-auto text-primary w-4 h-4" />
                  )}
                </div>
              ))}

              {/* Help Card */}
              <div className="mt-4 p-5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-bold">Help & Guidelines</span>
                </div>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    Ensure all 4 corners of the ID are visible.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    Use high resolution (min 300dpi).
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    File types: JPG, PNG, or PDF.
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:w-2/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Step {currentStep}: {steps[currentStep - 1].title}
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                {currentStep === 1 && 'Please provide a clear scan or photo of your National ID or Driver\'s License.'}
                {currentStep === 2 && 'Upload your vehicle registration document to verify your vehicle.'}
                {currentStep === 3 && 'Upload your insurance policy document for verification.'}
                {currentStep === 4 && 'Review all your submitted documents before final submission.'}
              </p>

              {/* Step 1: Identity Verification */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Rejection Alert */}
                  {verificationStatus.identity?.status === 'rejected' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-800 dark:text-red-400">Documents rejected</p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Please re-upload clearer images of your identity documents.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending Alert */}
                  {verificationStatus.identity?.status === 'pending' && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Under review</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Your documents are being reviewed. This usually takes 2-3 business days.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Document Type</Label>
                      <Select value={documentType} onValueChange={setDocumentType} disabled={verificationStatus.identity?.status === 'pending'}>
                        <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Driver's License">Driver's License</SelectItem>
                          <SelectItem value="National Identity Card">National Identity Card</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">License Number</Label>
                      <Input
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="e.g. D12345678"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        disabled={verificationStatus.identity?.status === 'pending'}
                      />
                    </div>
                  </div>

                  {/* Front Upload */}
                  <div className="flex flex-col gap-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Front Side of Document</span>
                      {verificationStatus.identity?.status === 'approved' && (
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </Label>
                    {frontImage ? (
                      <div className="relative flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="size-16 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-600" style={{ backgroundImage: `url(${frontImage})` }} />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">identity_front.jpg</p>
                          <p className="text-xs text-slate-500">Uploaded {verificationStatus.identity?.front_url ? 'previously' : 'just now'}</p>
                        </div>
                        {verificationStatus.identity?.status !== 'pending' && verificationStatus.identity?.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary text-xs font-bold"
                            onClick={() => setFrontImage(null)}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <label className="relative group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all p-10 cursor-pointer text-center">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*" 
                          onChange={handleFrontImageUpload}
                          disabled={verificationStatus.identity?.status === 'pending'}
                        />
                        <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF (MAX. 10MB)</p>
                      </label>
                    )}
                  </div>

                  {/* Back Upload */}
                  <div className="flex flex-col gap-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Back Side of Document</span>
                      {verificationStatus.identity?.status === 'approved' && (
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </Label>
                    {backImage ? (
                      <div className="relative flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="size-16 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-600" style={{ backgroundImage: `url(${backImage})` }} />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">identity_back.jpg</p>
                          <p className="text-xs text-slate-500">Uploaded {verificationStatus.identity?.back_url ? 'previously' : 'just now'}</p>
                        </div>
                        {verificationStatus.identity?.status !== 'pending' && verificationStatus.identity?.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary text-xs font-bold"
                            onClick={() => setBackImage(null)}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <label className="relative group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all p-10 cursor-pointer text-center">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          onChange={handleBackImageUpload}
                          disabled={verificationStatus.identity?.status === 'pending'}
                        />
                        <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF (MAX. 10MB)</p>
                      </label>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Button 
                      variant="ghost" 
                      className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft}
                    >
                      {isSavingDraft && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Draft
                    </Button>
                    {verificationStatus.identity?.status === 'pending' ? (
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        disabled
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Under Review
                      </Button>
                    ) : verificationStatus.identity?.status === 'approved' ? (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue to Step 2
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        onClick={handleSubmitIdentity}
                        disabled={isSubmitting || !frontImage || !backImage}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit for Verification
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Registration */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  {verificationStatus.vehicle?.status === 'rejected' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-800 dark:text-red-400">Document rejected</p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Please re-upload a clearer image of your vehicle registration.
                        </p>
                      </div>
                    </div>
                  )}

                  {verificationStatus.vehicle?.status === 'pending' && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Under review</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Your documents are being reviewed. This usually takes 2-3 business days.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Vehicle Type</Label>
                      <Select value={vehicleType} onValueChange={setVehicleType} disabled={verificationStatus.vehicle?.status === 'pending'}>
                        <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">License Plate</Label>
                      <Input
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="e.g. ABC-123"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        disabled={verificationStatus.vehicle?.status === 'pending'}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Vehicle Registration Document</Label>
                    {vehicleRegistration ? (
                      <div className="relative flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="size-16 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-600" style={{ backgroundImage: `url(${vehicleRegistration})` }} />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">vehicle_registration.jpg</p>
                          <p className="text-xs text-slate-500">Uploaded {verificationStatus.vehicle?.registration_url ? 'previously' : 'just now'}</p>
                        </div>
                        {verificationStatus.vehicle?.status !== 'pending' && verificationStatus.vehicle?.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary text-xs font-bold"
                            onClick={() => setVehicleRegistration(null)}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <label className="relative group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all p-10 cursor-pointer text-center">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*,.pdf"
                          onChange={handleVehicleUpload}
                          disabled={verificationStatus.vehicle?.status === 'pending'}
                        />
                        <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF (MAX. 10MB)</p>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Button 
                      variant="ghost" 
                      className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors" 
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Step 1
                    </Button>
                    {verificationStatus.vehicle?.status === 'pending' ? (
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        disabled
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Under Review
                      </Button>
                    ) : verificationStatus.vehicle?.status === 'approved' ? (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        onClick={() => setCurrentStep(3)}
                      >
                        Continue to Step 3
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        onClick={handleSubmitVehicle}
                        disabled={isSubmitting || !vehicleRegistration || !vehicleType || !licensePlate}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit for Verification
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Insurance Policy */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  {verificationStatus.insurance?.status === 'rejected' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-red-800 dark:text-red-400">Document rejected</p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Please re-upload a clearer image of your insurance policy.
                        </p>
                      </div>
                    </div>
                  )}

                  {verificationStatus.insurance?.status === 'pending' && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Under review</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Your documents are being reviewed. This usually takes 2-3 business days.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Insurance Provider</Label>
                      <Input
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="e.g. State Farm"
                        value={insuranceProvider}
                        onChange={(e) => setInsuranceProvider(e.target.value)}
                        disabled={verificationStatus.insurance?.status === 'pending'}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Policy Number</Label>
                      <Input
                        className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="e.g. POL-12345678"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        disabled={verificationStatus.insurance?.status === 'pending'}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Insurance Policy Document</Label>
                    {insuranceDocument ? (
                      <div className="relative flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="size-16 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-600" style={{ backgroundImage: `url(${insuranceDocument})` }} />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">insurance_policy.jpg</p>
                          <p className="text-xs text-slate-500">Uploaded {verificationStatus.insurance?.document_url ? 'previously' : 'just now'}</p>
                        </div>
                        {verificationStatus.insurance?.status !== 'pending' && verificationStatus.insurance?.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary text-xs font-bold"
                            onClick={() => setInsuranceDocument(null)}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <label className="relative group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all p-10 cursor-pointer text-center">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*,.pdf"
                          onChange={handleInsuranceUpload}
                          disabled={verificationStatus.insurance?.status === 'pending'}
                        />
                        <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF (MAX. 10MB)</p>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Button 
                      variant="ghost" 
                      className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors" 
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Step 2
                    </Button>
                    {verificationStatus.insurance?.status === 'pending' ? (
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        disabled
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Under Review
                      </Button>
                    ) : verificationStatus.insurance?.status === 'approved' ? (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        onClick={() => setCurrentStep(4)}
                      >
                        Continue to Review
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        onClick={handleSubmitInsurance}
                        disabled={isSubmitting || !insuranceDocument || !insuranceProvider || !policyNumber}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit for Verification
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Final Review */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className={`size-10 rounded-full flex items-center justify-center ${
                        verificationStatus.identity?.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                        verificationStatus.identity?.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                        verificationStatus.identity?.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-primary/10'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          verificationStatus.identity?.status === 'approved' ? 'text-green-600' :
                          verificationStatus.identity?.status === 'rejected' ? 'text-red-600' :
                          verificationStatus.identity?.status === 'pending' ? 'text-amber-600' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Identity Document</p>
                        <p className="text-xs text-slate-500">
                          {verificationStatus.identity?.document_type || "Driver's License"} • {verificationStatus.identity?.license_number || 'Not provided'}
                        </p>
                      </div>
                      <Badge variant={
                        verificationStatus.identity?.status === 'approved' ? 'default' : 
                        verificationStatus.identity?.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {verificationStatus.identity?.status === 'approved' && 'Verified'}
                        {verificationStatus.identity?.status === 'rejected' && 'Rejected'}
                        {verificationStatus.identity?.status === 'pending' && 'Pending'}
                        {!verificationStatus.identity?.status && 'Not Submitted'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className={`size-10 rounded-full flex items-center justify-center ${
                        verificationStatus.vehicle?.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                        verificationStatus.vehicle?.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                        verificationStatus.vehicle?.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-primary/10'
                      }`}>
                        <Car className={`w-5 h-5 ${
                          verificationStatus.vehicle?.status === 'approved' ? 'text-green-600' :
                          verificationStatus.vehicle?.status === 'rejected' ? 'text-red-600' :
                          verificationStatus.vehicle?.status === 'pending' ? 'text-amber-600' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Vehicle Registration</p>
                        <p className="text-xs text-slate-500">
                          {verificationStatus.vehicle?.vehicle_type || 'Not specified'} • {verificationStatus.vehicle?.license_plate || 'Not provided'}
                        </p>
                      </div>
                      <Badge variant={
                        verificationStatus.vehicle?.status === 'approved' ? 'default' : 
                        verificationStatus.vehicle?.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {verificationStatus.vehicle?.status === 'approved' && 'Verified'}
                        {verificationStatus.vehicle?.status === 'rejected' && 'Rejected'}
                        {verificationStatus.vehicle?.status === 'pending' && 'Pending'}
                        {!verificationStatus.vehicle?.status && 'Not Submitted'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className={`size-10 rounded-full flex items-center justify-center ${
                        verificationStatus.insurance?.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                        verificationStatus.insurance?.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                        verificationStatus.insurance?.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-primary/10'
                      }`}>
                        <FileCheck className={`w-5 h-5 ${
                          verificationStatus.insurance?.status === 'approved' ? 'text-green-600' :
                          verificationStatus.insurance?.status === 'rejected' ? 'text-red-600' :
                          verificationStatus.insurance?.status === 'pending' ? 'text-amber-600' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Insurance Policy</p>
                        <p className="text-xs text-slate-500">
                          {verificationStatus.insurance?.provider || 'Not specified'} • {verificationStatus.insurance?.policy_number || 'Not provided'}
                        </p>
                      </div>
                      <Badge variant={
                        verificationStatus.insurance?.status === 'approved' ? 'default' : 
                        verificationStatus.insurance?.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }>
                        {verificationStatus.insurance?.status === 'approved' && 'Verified'}
                        {verificationStatus.insurance?.status === 'rejected' && 'Rejected'}
                        {verificationStatus.insurance?.status === 'pending' && 'Pending'}
                        {!verificationStatus.insurance?.status && 'Not Submitted'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Submission Guidelines</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Once you submit, our team will review your documents within 2-3 business days. You'll receive a notification once verified.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Button 
                      variant="ghost" 
                      className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors" 
                      onClick={() => setCurrentStep(3)}
                    >
                      Back to Step 3
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white px-10 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                      onClick={handleSubmitAll}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit for Verification
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Help Bar */}
          <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">24/7 Support</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              © 2024 DriverHub Platform. All verification processes are GDPR compliant.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
