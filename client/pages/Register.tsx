import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Heart,
  Sparkles,
  FileText,
  AlertCircle,
  Users,
  Activity,
  Settings,
} from "lucide-react";

interface RegistrationData {
  // Step 1: Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Step 2: Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 3: Account Security
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  
  // Step 4: Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  
  // Step 5: Insurance Information
  insuranceProvider: string;
  policyNumber: string;
  groupNumber: string;
  
  // Step 6: Health Profile
  primaryConcerns: string[];
  currentMedications: string;
  allergies: string;
  
  // Step 7: Preferences
  communicationPreferences: string[];
  languagePreference: string;
  
  // Step 8: Consent & Agreement
  hipaaConsent: boolean;
  termsAccepted: boolean;
  marketingOptIn: boolean;
}

const initialData: RegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  password: "",
  confirmPassword: "",
  securityQuestion: "",
  securityAnswer: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  insuranceProvider: "",
  policyNumber: "",
  groupNumber: "",
  primaryConcerns: [],
  currentMedications: "",
  allergies: "",
  communicationPreferences: [],
  languagePreference: "English",
  hipaaConsent: false,
  termsAccepted: false,
  marketingOptIn: false,
};

const steps = [
  { id: 1, title: "Basic Information", icon: User, description: "Personal details" },
  { id: 2, title: "Address", icon: MapPin, description: "Contact information" },
  { id: 3, title: "Account Security", icon: Lock, description: "Password and security" },
  { id: 4, title: "Emergency Contact", icon: Users, description: "Emergency information" },
  { id: 5, title: "Insurance", icon: CreditCard, description: "Insurance details" },
  { id: 6, title: "Health Profile", icon: Activity, description: "Medical information" },
  { id: 7, title: "Preferences", icon: Settings, description: "Communication settings" },
  { id: 8, title: "Consent", icon: Shield, description: "Terms and privacy" },
];

const healthConcerns = [
  "General Health Monitoring",
  "Diabetes Management",
  "Heart Health",
  "Blood Pressure",
  "Cholesterol Management",
  "Weight Management",
  "Mental Health",
  "Chronic Pain",
  "Medication Management",
  "Lab Result Interpretation",
];

const communicationOptions = [
  "Email notifications",
  "SMS reminders",
  "Push notifications",
  "Phone calls",
  "Postal mail",
];

export function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>(initialData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const progress = (currentStep / steps.length) * 100;
  
  const updateData = (field: keyof RegistrationData, value: any) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!registrationData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!registrationData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!registrationData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(registrationData.email)) newErrors.email = "Invalid email format";
        if (!registrationData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!registrationData.dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required";
        break;
      case 2:
        if (!registrationData.address.trim()) newErrors.address = "Address is required";
        if (!registrationData.city.trim()) newErrors.city = "City is required";
        if (!registrationData.state.trim()) newErrors.state = "State is required";
        if (!registrationData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
        break;
      case 3:
        if (!registrationData.password.trim()) newErrors.password = "Password is required";
        else if (registrationData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (registrationData.password !== registrationData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;
      case 4:
        if (!registrationData.emergencyName.trim()) newErrors.emergencyName = "Emergency contact name is required";
        if (!registrationData.emergencyPhone.trim()) newErrors.emergencyPhone = "Emergency contact phone is required";
        if (!registrationData.emergencyRelation.trim()) newErrors.emergencyRelation = "Relationship is required";
        break;
      case 8:
        if (!registrationData.hipaaConsent) newErrors.hipaaConsent = "HIPAA consent is required";
        if (!registrationData.termsAccepted) newErrors.termsAccepted = "Terms acceptance is required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to Telecheck! Check your email for next steps.",
      });
      
      // Redirect to onboarding or login
      navigate("/login", { 
        state: { 
          message: "Registration complete! Please log in to continue.",
          registrationComplete: true 
        } 
      });
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={registrationData.firstName}
                  onChange={(e) => updateData("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={registrationData.lastName}
                  onChange={(e) => updateData("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => updateData("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={registrationData.phone}
                    onChange={(e) => updateData("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={registrationData.dateOfBirth}
                    onChange={(e) => updateData("dateOfBirth", e.target.value)}
                    className={`pl-10 ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={registrationData.address}
                  onChange={(e) => updateData("address", e.target.value)}
                  placeholder="Enter your street address"
                  className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
                />
              </div>
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={registrationData.city}
                  onChange={(e) => updateData("city", e.target.value)}
                  placeholder="City"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={registrationData.state}
                  onChange={(e) => updateData("state", e.target.value)}
                  placeholder="State"
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={registrationData.zipCode}
                  onChange={(e) => updateData("zipCode", e.target.value)}
                  placeholder="12345"
                  className={errors.zipCode ? "border-red-500" : ""}
                />
                {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={registrationData.password}
                  onChange={(e) => updateData("password", e.target.value)}
                  placeholder="Create a secure password"
                  className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={registrationData.confirmPassword}
                  onChange={(e) => updateData("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="emergencyName"
                  value={registrationData.emergencyName}
                  onChange={(e) => updateData("emergencyName", e.target.value)}
                  placeholder="Full name of emergency contact"
                  className={`pl-10 ${errors.emergencyName ? "border-red-500" : ""}`}
                />
              </div>
              {errors.emergencyName && <p className="text-sm text-red-500">{errors.emergencyName}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="emergencyPhone"
                    value={registrationData.emergencyPhone}
                    onChange={(e) => updateData("emergencyPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`pl-10 ${errors.emergencyPhone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.emergencyPhone && <p className="text-sm text-red-500">{errors.emergencyPhone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relationship *</Label>
                <Input
                  id="emergencyRelation"
                  value={registrationData.emergencyRelation}
                  onChange={(e) => updateData("emergencyRelation", e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className={errors.emergencyRelation ? "border-red-500" : ""}
                />
                {errors.emergencyRelation && <p className="text-sm text-red-500">{errors.emergencyRelation}</p>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Insurance Information</h4>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Providing insurance information helps us verify coverage and reduce your costs.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={registrationData.insuranceProvider}
                onChange={(e) => updateData("insuranceProvider", e.target.value)}
                placeholder="e.g., Blue Cross Blue Shield, Aetna, Cigna"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={registrationData.policyNumber}
                  onChange={(e) => updateData("policyNumber", e.target.value)}
                  placeholder="Policy number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  value={registrationData.groupNumber}
                  onChange={(e) => updateData("groupNumber", e.target.value)}
                  placeholder="Group number (if applicable)"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Health Concerns (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {healthConcerns.map((concern) => (
                  <div key={concern} className="flex items-center space-x-2">
                    <Checkbox
                      id={concern}
                      checked={registrationData.primaryConcerns.includes(concern)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("primaryConcerns", [...registrationData.primaryConcerns, concern]);
                        } else {
                          updateData("primaryConcerns", registrationData.primaryConcerns.filter(c => c !== concern));
                        }
                      }}
                    />
                    <Label htmlFor={concern} className="text-xs">
                      {concern}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <textarea
                id="currentMedications"
                value={registrationData.currentMedications}
                onChange={(e) => updateData("currentMedications", e.target.value)}
                placeholder="List your current medications, dosages, and frequency"
                className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none h-24"
              />
              <p className="text-xs text-muted-foreground">
                Include prescription medications, over-the-counter drugs, and supplements
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <textarea
                id="allergies"
                value={registrationData.allergies}
                onChange={(e) => updateData("allergies", e.target.value)}
                placeholder="List any known drug or environmental allergies"
                className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none h-20"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Preferences</Label>
              <div className="space-y-2">
                {communicationOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={registrationData.communicationPreferences.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("communicationPreferences", [...registrationData.communicationPreferences, option]);
                        } else {
                          updateData("communicationPreferences", registrationData.communicationPreferences.filter(p => p !== option));
                        }
                      }}
                    />
                    <Label htmlFor={option} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="languagePreference">Preferred Language</Label>
              <select
                id="languagePreference"
                value={registrationData.languagePreference}
                onChange={(e) => updateData("languagePreference", e.target.value)}
                className="w-full p-3 border border-border rounded-md bg-background text-foreground"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Required Consents</h4>
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please review and accept the following terms to complete your registration.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="hipaaConsent"
                    checked={registrationData.hipaaConsent}
                    onCheckedChange={(checked) => updateData("hipaaConsent", checked)}
                    className={errors.hipaaConsent ? "border-red-500" : ""}
                  />
                  <div className="flex-1">
                    <Label htmlFor="hipaaConsent" className="text-sm">
                      I acknowledge that I have received and reviewed the HIPAA Notice of Privacy Practices *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Link to="/privacy" className="text-primary hover:underline">
                        View HIPAA Notice
                      </Link>
                    </p>
                  </div>
                </div>
                {errors.hipaaConsent && <p className="text-sm text-red-500 ml-6">{errors.hipaaConsent}</p>}
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={registrationData.termsAccepted}
                    onCheckedChange={(checked) => updateData("termsAccepted", checked)}
                    className={errors.termsAccepted ? "border-red-500" : ""}
                  />
                  <div className="flex-1">
                    <Label htmlFor="termsAccepted" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Link to="/terms" className="text-primary hover:underline">View Terms</Link> • <Link to="/privacy" className="text-primary hover:underline">View Privacy Policy</Link>
                    </p>
                  </div>
                </div>
                {errors.termsAccepted && <p className="text-sm text-red-500 ml-6">{errors.termsAccepted}</p>}
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketingOptIn"
                    checked={registrationData.marketingOptIn}
                    onCheckedChange={(checked) => updateData("marketingOptIn", checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="marketingOptIn" className="text-sm">
                      I would like to receive health tips, news, and promotional offers (optional)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen aurora-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Join Telecheck</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create your patient account to access AI-powered healthcare
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8 glass-morphism border border-border/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`text-center p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xs font-medium hidden lg:block">{step.title}</p>
                    <p className="text-xs lg:hidden">{step.id}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-6 h-6 text-primary"
              })}
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {steps[currentStep - 1].title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {renderStepContent()}
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border/20">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="hover-lift"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost" className="text-muted-foreground">
                      Already have an account? Sign in
                    </Button>
                  </Link>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={nextStep}
                      className="gradient-bg text-white border-0 hover-lift"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="gradient-bg text-white border-0 hover-lift"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6 glass-morphism border border-green-200 bg-green-50/50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Your information is secure
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              All data is encrypted and HIPAA compliant. We never share your personal information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
