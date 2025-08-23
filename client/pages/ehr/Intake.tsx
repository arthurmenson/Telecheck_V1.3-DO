import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import {
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Camera,
  Upload,
  Download,
  Eye,
  Edit,
  Save,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Users,
  Activity,
  Star,
  Building,
  Stethoscope,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreatePatient } from "../../hooks/api/usePatients";
import { CreatePatientRequest } from "../../services/patient.service";
import { useToast } from "../../hooks/use-toast";

// Generate UUIDs for intake records to ensure backend compatibility
const generatePatientUUID = (intakeId: string): string => {
  // Create a consistent UUID based on intake ID for demo purposes
  const uuidMap: Record<string, string> = {
    'INT001': '550e8400-e29b-41d4-a716-446655440001',
    'INT002': '550e8400-e29b-41d4-a716-446655440002',
    'INT003': '550e8400-e29b-41d4-a716-446655440003',
    'INT004': '550e8400-e29b-41d4-a716-446655440004',
    'INT005': '550e8400-e29b-41d4-a716-446655440005',
    'INT006': '550e8400-e29b-41d4-a716-446655440006',
    'INT007': '550e8400-e29b-41d4-a716-446655440007',
    'INT008': '550e8400-e29b-41d4-a716-446655440008',
  };

  return uuidMap[intakeId] || intakeId;
};

// Enhanced mock patient intake data
const recentIntakes = [
  {
    id: "INT001",
    patientName: "Sarah Johnson",
    status: "completed",
    completedAt: "2024-02-15 10:30 AM",
    assignedTo: "Dr. Sarah Wilson",
    priority: "standard",
    forms: 5,
    completedForms: 5,
    age: 34,
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    insuranceProvider: "Blue Cross Blue Shield",
    specialtyType: "General Medicine"
  },
  {
    id: "INT002",
    patientName: "Michael Chen",
    status: "in-progress",
    startedAt: "2024-02-15 2:15 PM",
    assignedTo: "Nurse Williams",
    priority: "urgent",
    forms: 5,
    completedForms: 3,
    age: 67,
    phone: "(555) 234-5678",
    email: "m.chen@email.com",
    insuranceProvider: "Medicare",
    specialtyType: "Cardiology",
    currentStep: "Insurance & Payment"
  },
  {
    id: "INT003",
    patientName: "Emily Rodriguez",
    status: "pending",
    scheduledFor: "2024-02-16 9:00 AM",
    assignedTo: "Dr. Johnson",
    priority: "standard",
    forms: 5,
    completedForms: 0,
    age: 28,
    phone: "(555) 345-6789",
    email: "emily.r@email.com",
    insuranceProvider: "Aetna",
    specialtyType: "Pediatrics"
  },
  {
    id: "INT004",
    patientName: "Robert Davis",
    status: "completed",
    completedAt: "2024-02-15 8:45 AM",
    assignedTo: "Nurse Martinez",
    priority: "standard",
    forms: 5,
    completedForms: 5,
    age: 52,
    phone: "(555) 456-7890",
    email: "rob.davis@email.com",
    insuranceProvider: "Cigna",
    specialtyType: "Orthopedics"
  },
  {
    id: "INT005",
    patientName: "Lisa Thompson",
    status: "in-progress",
    startedAt: "2024-02-15 11:20 AM",
    assignedTo: "Dr. Sarah Wilson",
    priority: "high",
    forms: 5,
    completedForms: 4,
    age: 45,
    phone: "(555) 567-8901",
    email: "lisa.thompson@email.com",
    insuranceProvider: "United Healthcare",
    specialtyType: "Dermatology",
    currentStep: "Review & Submit"
  },
  {
    id: "INT006",
    patientName: "James Wilson",
    status: "pending",
    scheduledFor: "2024-02-16 2:30 PM",
    assignedTo: "Dr. Johnson",
    priority: "standard",
    forms: 5,
    completedForms: 0,
    age: 39,
    phone: "(555) 678-9012",
    email: "james.wilson@email.com",
    insuranceProvider: "Kaiser Permanente",
    specialtyType: "General Medicine"
  },
  {
    id: "INT007",
    patientName: "Maria Garcia",
    status: "completed",
    completedAt: "2024-02-14 4:15 PM",
    assignedTo: "Nurse Williams",
    priority: "urgent",
    forms: 5,
    completedForms: 5,
    age: 72,
    phone: "(555) 789-0123",
    email: "maria.garcia@email.com",
    insuranceProvider: "Medicare",
    specialtyType: "Endocrinology"
  },
  {
    id: "INT008",
    patientName: "David Kim",
    status: "in-progress",
    startedAt: "2024-02-15 3:45 PM",
    assignedTo: "Dr. Patel",
    priority: "standard",
    forms: 5,
    completedForms: 2,
    age: 31,
    phone: "(555) 890-1234",
    email: "david.kim@email.com",
    insuranceProvider: "Humana",
    specialtyType: "Neurology",
    currentStep: "Medical History"
  }
];

const intakeStats = [
  {
    title: "Today's Intakes",
    value: "18",
    change: "+5 from yesterday",
    icon: UserPlus,
    color: "#10b981"
  },
  {
    title: "Completion Rate",
    value: "87%",
    change: "+3.2% this week",
    icon: CheckCircle,
    color: "#3b82f6"
  },
  {
    title: "Avg. Completion Time",
    value: "22 min",
    change: "-4 min improvement",
    icon: Clock,
    color: "#f59e0b"
  },
  {
    title: "Patient Satisfaction",
    value: "4.6/5",
    change: "+0.3 this month",
    icon: Star,
    color: "#8b5cf6"
  }
];

export function Intake() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showNewIntake, setShowNewIntake] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPatientMutation = useCreatePatient();

  // Form state for intake
  const [intakeForm, setIntakeForm] = useState<CreatePatientRequest & {
    chiefComplaint?: string;
    currentMedications?: string[];
    pastMedicalHistory?: string;
    familyHistory?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    insuranceProvider?: string;
    policyNumber?: string;
    groupNumber?: string;
    hipaaConsent?: boolean;
    treatmentConsent?: boolean;
    financialConsent?: boolean;
    telemedicineConsent?: boolean;
    communicationPreferences?: string[];
    electronicSignature?: string;
    signatureDate?: string;
    finalConfirmation?: boolean;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    allergies: [],
    emergencyContacts: {},
    insuranceInfo: {},
  });

  const intakeSteps = [
    { id: 1, title: "Patient Information", icon: UserPlus },
    { id: 2, title: "Medical History", icon: FileText },
    { id: 3, title: "Insurance & Payment", icon: Shield },
    { id: 4, title: "Consent & Authorization", icon: CheckCircle },
    { id: 5, title: "Review & Submit", icon: Save }
  ];

  // Handle form field updates
  const updateIntakeForm = (field: string, value: any) => {
    setIntakeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate required fields for Step 1
  const validateStep1 = () => {
    return intakeForm.firstName && intakeForm.lastName && intakeForm.email &&
           intakeForm.phone && intakeForm.dateOfBirth;
  };

  // Validate required consents for submission
  const validateConsents = () => {
    return intakeForm.hipaaConsent && intakeForm.treatmentConsent &&
           intakeForm.financialConsent && intakeForm.finalConfirmation &&
           intakeForm.electronicSignature;
  };

  // Handle intake submission
  const handleIntakeSubmission = async () => {
    if (!validateStep1()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields in Patient Information.",
        variant: "destructive"
      });
      setCurrentStep(1);
      return;
    }

    if (!validateConsents()) {
      toast({
        title: "Missing Consents",
        description: "Please complete all required consents and confirmations.",
        variant: "destructive"
      });
      setCurrentStep(4);
      return;
    }

    try {
      // Ensure date is in ISO format (YYYY-MM-DD)
      const formattedDateOfBirth = intakeForm.dateOfBirth ?
        new Date(intakeForm.dateOfBirth).toISOString().split('T')[0] : '';

      // Prepare patient data for creation
      const patientData: CreatePatientRequest = {
        firstName: intakeForm.firstName.trim(),
        lastName: intakeForm.lastName.trim(),
        email: intakeForm.email.trim().toLowerCase(),
        phone: intakeForm.phone?.trim(),
        dateOfBirth: formattedDateOfBirth,
        gender: intakeForm.gender,
        address: intakeForm.address?.trim(),
        city: intakeForm.city?.trim(),
        state: intakeForm.state?.trim(),
        zipCode: intakeForm.zipCode?.trim(),
        allergies: intakeForm.allergies || [],
        emergencyContacts: {
          name: intakeForm.emergencyContactName?.trim(),
          phone: intakeForm.emergencyContactPhone?.trim()
        },
        insuranceInfo: {
          provider: intakeForm.insuranceProvider?.trim(),
          policyNumber: intakeForm.policyNumber?.trim(),
          groupNumber: intakeForm.groupNumber?.trim()
        }
      };

      console.log('[Intake] Submitting patient data:', patientData);

      // Create the patient record
      await createPatientMutation.mutateAsync(patientData);

      toast({
        title: "Intake Completed Successfully!",
        description: "Patient has been registered and will appear in the Patient Registry.",
      });

      // Reset form and close modal
      setIntakeForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        allergies: [],
        emergencyContacts: {},
        insuranceInfo: {},
      });
      setShowNewIntake(false);
      setCurrentStep(1);

      // Navigate to Patient Registry to show the new patient
      navigate('/patient-registry');

    } catch (error: any) {
      console.error('[Intake] Failed to submit patient data:', error);

      let errorMessage = "Please try again or contact support.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = `Validation error: ${JSON.stringify(error.details)}`;
      }

      toast({
        title: "Intake Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary" />
              Patient Intake & Onboarding
            </h1>
            <p className="text-muted-foreground">Streamlined patient registration and onboarding process</p>
          </div>

          <Button onClick={() => setShowNewIntake(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Patient Intake
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {intakeStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* New Intake Form */}
        {showNewIntake && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>New Patient Intake</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewIntake(false)}
                >
                  Cancel
                </Button>
              </CardTitle>
              
              {/* Progress Steps */}
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Step {currentStep} of {intakeSteps.length}</span>
                  <span className="text-sm text-muted-foreground">{Math.round((currentStep / intakeSteps.length) * 100)}% Complete</span>
                </div>
                <Progress value={(currentStep / intakeSteps.length) * 100} className="w-full" />

                <div className="flex items-center justify-between">
                  {intakeSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center gap-2 ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-primary text-white' :
                            isCompleted ? 'bg-green-600 text-white' : 'bg-muted'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-medium hidden md:block">{step.title}</span>
                        </div>
                        {idx < intakeSteps.length - 1 && (
                          <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-muted'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Step 1: Patient Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        placeholder="Enter first name"
                        value={intakeForm.firstName}
                        onChange={(e) => updateIntakeForm('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        placeholder="Enter last name"
                        value={intakeForm.lastName}
                        onChange={(e) => updateIntakeForm('lastName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={intakeForm.dateOfBirth}
                        onChange={(e) => updateIntakeForm('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={intakeForm.gender}
                        onChange={(e) => updateIntakeForm('gender', e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="(555) 123-4567"
                        value={intakeForm.phone}
                        onChange={(e) => updateIntakeForm('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        placeholder="patient@email.com"
                        value={intakeForm.email}
                        onChange={(e) => updateIntakeForm('email', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <Input
                        placeholder="Street address"
                        value={intakeForm.address}
                        onChange={(e) => updateIntakeForm('address', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={intakeForm.city}
                        onChange={(e) => updateIntakeForm('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        placeholder="State"
                        value={intakeForm.state}
                        onChange={(e) => updateIntakeForm('state', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Zip Code</Label>
                      <Input
                        placeholder="12345"
                        value={intakeForm.zipCode}
                        onChange={(e) => updateIntakeForm('zipCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Medical History */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Medical History</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Chief Complaint</Label>
                      <Textarea
                        placeholder="What brings you in today?"
                        value={intakeForm.chiefComplaint || ''}
                        onChange={(e) => updateIntakeForm('chiefComplaint', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Current Medications</Label>
                      <Textarea
                        placeholder="List current medications, dosages, and frequency"
                        value={intakeForm.currentMedications?.join('\n') || ''}
                        onChange={(e) => updateIntakeForm('currentMedications', e.target.value.split('\n').filter(m => m.trim()))}
                      />
                    </div>
                    <div>
                      <Label>Allergies</Label>
                      <Textarea
                        placeholder="List any known allergies (medications, food, environmental)"
                        value={intakeForm.allergies?.join('\n') || ''}
                        onChange={(e) => updateIntakeForm('allergies', e.target.value.split('\n').filter(a => a.trim()))}
                      />
                    </div>
                    <div>
                      <Label>Past Medical History</Label>
                      <Textarea
                        placeholder="Previous surgeries, hospitalizations, chronic conditions"
                        value={intakeForm.pastMedicalHistory || ''}
                        onChange={(e) => updateIntakeForm('pastMedicalHistory', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Family History</Label>
                      <Textarea
                        placeholder="Relevant family medical history"
                        value={intakeForm.familyHistory || ''}
                        onChange={(e) => updateIntakeForm('familyHistory', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Insurance & Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Insurance & Payment Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Insurance Provider</Label>
                        <Input
                          placeholder="e.g., Blue Cross Blue Shield"
                          value={intakeForm.insuranceProvider || ''}
                          onChange={(e) => updateIntakeForm('insuranceProvider', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Policy Number</Label>
                        <Input
                          placeholder="Insurance policy number"
                          value={intakeForm.policyNumber || ''}
                          onChange={(e) => updateIntakeForm('policyNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Group Number</Label>
                        <Input
                          placeholder="Group number (if applicable)"
                          value={intakeForm.groupNumber || ''}
                          onChange={(e) => updateIntakeForm('groupNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Primary Insured</Label>
                        <Input
                          placeholder="Name of primary insured person"
                          value={intakeForm.emergencyContactName || ''}
                          onChange={(e) => updateIntakeForm('emergencyContactName', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Insurance Card Photos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Front of Insurance Card</p>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Back of Insurance Card</p>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Contact Name</Label>
                          <Input
                            placeholder="Emergency contact name"
                            value={intakeForm.emergencyContactName || ''}
                            onChange={(e) => updateIntakeForm('emergencyContactName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Input
                            placeholder="e.g., Spouse, Parent, Friend"
                            value={intakeForm.emergencyContacts?.relationship || ''}
                            onChange={(e) => updateIntakeForm('emergencyContacts', {...(intakeForm.emergencyContacts || {}), relationship: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            placeholder="Emergency contact phone"
                            value={intakeForm.emergencyContactPhone || ''}
                            onChange={(e) => updateIntakeForm('emergencyContactPhone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            placeholder="Emergency contact address"
                            value={intakeForm.emergencyContacts?.address || ''}
                            onChange={(e) => updateIntakeForm('emergencyContacts', {...(intakeForm.emergencyContacts || {}), address: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Consent & Authorization */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Consent & Authorization</h3>
                  <div className="space-y-6">

                    {/* HIPAA Consent */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={intakeForm.hipaaConsent || false}
                          onChange={(e) => updateIntakeForm('hipaaConsent', e.target.checked)}
                        />
                        <div>
                          <h4 className="font-medium mb-2">HIPAA Privacy Notice Acknowledgment</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            I acknowledge that I have received and understand the Notice of Privacy Practices
                            which describes how my health information is used and disclosed.
                          </p>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Full HIPAA Privacy Notice
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Consent */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={intakeForm.treatmentConsent || false}
                          onChange={(e) => updateIntakeForm('treatmentConsent', e.target.checked)}
                        />
                        <div>
                          <h4 className="font-medium mb-2">Consent for Treatment</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            I consent to examination, diagnosis, and treatment by the healthcare providers at this facility.
                            I understand that no guarantee has been made regarding the outcome of treatment.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Responsibility */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={intakeForm.financialConsent || false}
                          onChange={(e) => updateIntakeForm('financialConsent', e.target.checked)}
                        />
                        <div>
                          <h4 className="font-medium mb-2">Financial Responsibility</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            I understand that I am financially responsible for all charges not covered by my insurance.
                            I agree to pay co-pays, deductibles, and any services not covered at the time of service.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Telemedicine Consent */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={intakeForm.telemedicineConsent || false}
                          onChange={(e) => updateIntakeForm('telemedicineConsent', e.target.checked)}
                        />
                        <div>
                          <h4 className="font-medium mb-2">Telemedicine Services Consent</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            I consent to receive healthcare services through telemedicine technologies. I understand
                            the limitations of remote consultations and agree to follow up in person when recommended.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Communication Preferences */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Communication Preferences</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={intakeForm.communicationPreferences?.includes('email') || false}
                            onChange={(e) => {
                              const prefs = intakeForm.communicationPreferences || [];
                              if (e.target.checked) {
                                updateIntakeForm('communicationPreferences', [...prefs, 'email']);
                              } else {
                                updateIntakeForm('communicationPreferences', prefs.filter(p => p !== 'email'));
                              }
                            }}
                          />
                          <span className="text-sm">Email reminders and notifications</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={intakeForm.communicationPreferences?.includes('sms') || false}
                            onChange={(e) => {
                              const prefs = intakeForm.communicationPreferences || [];
                              if (e.target.checked) {
                                updateIntakeForm('communicationPreferences', [...prefs, 'sms']);
                              } else {
                                updateIntakeForm('communicationPreferences', prefs.filter(p => p !== 'sms'));
                              }
                            }}
                          />
                          <span className="text-sm">SMS text message reminders</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={intakeForm.communicationPreferences?.includes('phone') || false}
                            onChange={(e) => {
                              const prefs = intakeForm.communicationPreferences || [];
                              if (e.target.checked) {
                                updateIntakeForm('communicationPreferences', [...prefs, 'phone']);
                              } else {
                                updateIntakeForm('communicationPreferences', prefs.filter(p => p !== 'phone'));
                              }
                            }}
                          />
                          <span className="text-sm">Phone call reminders</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={intakeForm.communicationPreferences?.includes('appointments') || false}
                            onChange={(e) => {
                              const prefs = intakeForm.communicationPreferences || [];
                              if (e.target.checked) {
                                updateIntakeForm('communicationPreferences', [...prefs, 'appointments']);
                              } else {
                                updateIntakeForm('communicationPreferences', prefs.filter(p => p !== 'appointments'));
                              }
                            }}
                          />
                          <span className="text-sm">Appointment confirmations</span>
                        </div>
                      </div>
                    </div>

                    {/* Electronic Signature */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Electronic Signature</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Full Legal Name</Label>
                          <Input
                            placeholder="Type your full legal name as your electronic signature"
                            value={intakeForm.electronicSignature || ''}
                            onChange={(e) => updateIntakeForm('electronicSignature', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={intakeForm.signatureDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => updateIntakeForm('signatureDate', e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          By typing your name above, you are providing your electronic signature and agreeing to all
                          consents and authorizations on this form.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                  <div className="space-y-4">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Patient Information Summary */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Patient Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span>John Doe</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">DOB:</span>
                              <span>01/15/1985</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phone:</span>
                              <span>(555) 123-4567</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span>john.doe@email.com</span>
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Medical History Summary */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Medical History
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Chief Complaint:</span>
                              <p className="mt-1">Annual check-up and routine screening</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Allergies:</span>
                              <p className="mt-1">Penicillin, Shellfish</p>
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Insurance Summary */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Insurance Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Provider:</span>
                              <span>Blue Cross Blue Shield</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Policy #:</span>
                              <span>***-***-1234</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Emergency Contact:</span>
                              <span>Jane Doe (Spouse)</span>
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Consent Status */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Consent Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>HIPAA Privacy Notice</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Treatment Consent</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Financial Responsibility</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Telemedicine Consent</span>
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                            <Edit className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Final Confirmation */}
                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Ready to Submit</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Please review all information above. Once submitted, your intake will be processed
                              and you'll receive a confirmation email with next steps.
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <input
                              type="checkbox"
                              checked={intakeForm.finalConfirmation || false}
                              onChange={(e) => updateIntakeForm('finalConfirmation', e.target.checked)}
                            />
                            <span className="text-sm">
                              I confirm that all information provided is accurate and complete
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentStep < intakeSteps.length) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      handleIntakeSubmission();
                    }
                  }}
                  disabled={createPatientMutation.isPending}
                  className={currentStep === intakeSteps.length ? 'bg-primary text-white' : ''}
                >
                  {currentStep === intakeSteps.length
                    ? (createPatientMutation.isPending ? 'Submitting...' : 'Submit Intake')
                    : 'Next'}
                  {currentStep < intakeSteps.length ? <ArrowRight className="w-4 h-4 ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Patient Intake Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selectedPatient.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{selectedPatient.age} years old</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{selectedPatient.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-sm">{selectedPatient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Insurance:</span>
                          <span className="text-sm">{selectedPatient.insuranceProvider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Specialty:</span>
                          <span className="text-sm">{selectedPatient.specialtyType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Intake Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={
                            selectedPatient.status === 'completed' ? 'bg-green-100 text-green-700' :
                            selectedPatient.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {selectedPatient.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Priority:</span>
                          <Badge variant={
                            selectedPatient.priority === 'urgent' ? 'destructive' :
                            selectedPatient.priority === 'high' ? 'secondary' : 'outline'
                          }>
                            {selectedPatient.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assigned to:</span>
                          <span className="font-medium">{selectedPatient.assignedTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{selectedPatient.completedForms}/{selectedPatient.forms} forms</span>
                        </div>
                        {selectedPatient.currentStep && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Step:</span>
                            <span className="text-sm">{selectedPatient.currentStep}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {selectedPatient.status === 'completed' ? 'Completed:' :
                             selectedPatient.status === 'in-progress' ? 'Started:' : 'Scheduled:'}
                          </span>
                          <span className="text-sm">
                            {selectedPatient.completedAt || selectedPatient.startedAt || selectedPatient.scheduledFor}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Form Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Form Completion Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((selectedPatient.completedForms / selectedPatient.forms) * 100)}%
                        </span>
                      </div>
                      <Progress value={(selectedPatient.completedForms / selectedPatient.forms) * 100} className="w-full" />

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                        {intakeSteps.map((step, idx) => {
                          const isCompleted = idx < selectedPatient.completedForms;
                          const isCurrent = selectedPatient.currentStep && step.title === selectedPatient.currentStep;
                          const Icon = step.icon;

                          return (
                            <div key={step.id} className={`p-3 rounded-lg border text-center ${
                              isCompleted ? 'bg-green-50 border-green-200' :
                              isCurrent ? 'bg-blue-50 border-blue-200' :
                              'bg-gray-50 border-gray-200'
                            }`}>
                              <Icon className={`w-5 h-5 mx-auto mb-2 ${
                                isCompleted ? 'text-green-600' :
                                isCurrent ? 'text-blue-600' :
                                'text-gray-400'
                              }`} />
                              <p className={`text-xs font-medium ${
                                isCompleted ? 'text-green-700' :
                                isCurrent ? 'text-blue-700' :
                                'text-gray-500'
                              }`}>
                                {step.title}
                              </p>
                              {isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    {selectedPatient.status === 'in-progress' && (
                      <Button
                        className="gap-2"
                        onClick={() => {
                          // For in-progress intakes, open the intake form at the current step
                          setSelectedPatient(null);
                          setShowNewIntake(true);
                          // Set the current step based on completed forms
                          setCurrentStep(selectedPatient.completedForms + 1);
                          // Pre-populate form with patient data
                          setIntakeForm({
                            firstName: selectedPatient.patientName.split(' ')[0] || '',
                            lastName: selectedPatient.patientName.split(' ').slice(1).join(' ') || '',
                            email: selectedPatient.email,
                            phone: selectedPatient.phone,
                            dateOfBirth: '',
                            gender: '',
                            address: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            allergies: [],
                            emergencyContacts: {},
                            insuranceInfo: {
                              provider: selectedPatient.insuranceProvider
                            },
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Continue Intake
                      </Button>
                    )}
                    {selectedPatient.status === 'completed' && (
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        // Navigate to patient records using the mapped UUID
                        const patientUUID = generatePatientUUID(selectedPatient.id);
                        navigate(`/patient-records/${patientUUID}`);
                        setSelectedPatient(null);
                        toast({
                          title: "Opening Patient Records",
                          description: `Loading full records for ${selectedPatient.patientName}`,
                        });
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View Full Records
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Intakes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Patient Intakes</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIntakes.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => setSelectedPatient(intake)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      intake.status === 'completed' ? 'bg-green-100 text-green-600' :
                      intake.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {intake.status === 'completed' ? <CheckCircle className="w-6 h-6" /> :
                       intake.status === 'in-progress' ? <Activity className="w-6 h-6" /> :
                       <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{intake.patientName}</h4>
                        <Badge variant={
                          intake.priority === 'urgent' ? 'destructive' :
                          intake.priority === 'high' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {intake.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ID: {intake.id} • Age: {intake.age} • {intake.specialtyType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {intake.phone} • {intake.insuranceProvider}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Assigned to</p>
                      <p className="font-medium text-sm">{intake.assignedTo}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(intake.completedForms / intake.forms) * 100} className="w-20 h-2" />
                        <span className="text-sm">{intake.completedForms}/{intake.forms}</span>
                      </div>
                      {intake.currentStep && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {intake.currentStep}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <Badge className={
                        intake.status === 'completed' ? 'bg-green-100 text-green-700' :
                        intake.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {intake.status.replace('-', ' ')}
                      </Badge>
                      {intake.priority === 'urgent' && (
                        <Badge className="bg-red-100 text-red-700 ml-2">Urgent</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(intake);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {intake.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const patientUUID = generatePatientUUID(intake.id);
                            navigate(`/patient-records/${patientUUID}`);
                            toast({
                              title: "Opening Patient Records",
                              description: `Loading full records for ${intake.patientName}`,
                            });
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Records
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intake Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Intake Form Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "General Medicine",
                  forms: 5,
                  time: "18-22 min",
                  icon: Stethoscope,
                  description: "Standard adult primary care intake",
                  color: "#3b82f6"
                },
                {
                  name: "Pediatric Care",
                  forms: 6,
                  time: "20-25 min",
                  icon: Heart,
                  description: "Child and adolescent care with guardian consent",
                  color: "#10b981"
                },
                {
                  name: "Cardiology",
                  forms: 7,
                  time: "25-30 min",
                  icon: Activity,
                  description: "Cardiac care with detailed medical history",
                  color: "#ef4444"
                },
                {
                  name: "Orthopedics",
                  forms: 6,
                  time: "20-25 min",
                  icon: Building,
                  description: "Bone and joint care intake",
                  color: "#f59e0b"
                },
                {
                  name: "Mental Health",
                  forms: 8,
                  time: "30-35 min",
                  icon: Users,
                  description: "Comprehensive psychological assessment",
                  color: "#8b5cf6"
                },
                {
                  name: "Emergency/Urgent",
                  forms: 4,
                  time: "10-15 min",
                  icon: AlertTriangle,
                  description: "Streamlined intake for urgent cases",
                  color: "#dc2626"
                }
              ].map((template, idx) => {
                const Icon = template.icon;
                return (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${template.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: template.color }} />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Forms:</span>
                        <span className="font-medium">{template.forms} sections</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. time:</span>
                        <span className="font-medium">{template.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sample medical data for demonstration purposes
export const sampleMedicalData = {
  commonAllergies: [
    "Penicillin", "Peanuts", "Shellfish", "Latex", "Sulfa drugs", "Aspirin", "Ibuprofen", "Eggs", "Milk", "Soy"
  ],
  commonMedications: [
    "Lisinopril 10mg daily", "Metformin 500mg twice daily", "Atorvastatin 20mg daily",
    "Amlodipine 5mg daily", "Omeprazole 20mg daily", "Levothyroxine 75mcg daily",
    "Metoprolol 50mg twice daily", "Gabapentin 300mg three times daily"
  ],
  commonConditions: [
    "Hypertension", "Type 2 Diabetes", "High Cholesterol", "Osteoarthritis",
    "GERD", "Hypothyroidism", "Anxiety", "Depression", "Asthma", "COPD"
  ],
  chiefComplaints: [
    "Chest pain", "Shortness of breath", "Abdominal pain", "Headache",
    "Back pain", "Knee pain", "Fatigue", "Dizziness", "Cough", "Fever"
  ]
};
