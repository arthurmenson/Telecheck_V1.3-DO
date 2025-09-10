import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Smartphone,
  Activity,
  Target,
  Heart,
  AlertTriangle,
  Calendar,
  Settings,
  Phone,
  User,
  FileText,
  Pill,
  Stethoscope,
  Camera,
  Wifi,
  BarChart3,
  Shield,
} from "lucide-react";

interface DiabetesAssessment {
  diabetesType: "type1" | "type2" | "gestational" | "prediabetes";
  diagnosisDate: string;
  lastA1C: string;
  currentMedications: string[];
  complications: string[];
  lastFootExam: string;
  lastEyeExam: string;
  currentDevices: string[];
  techComfort: number;
  caregiverSupport: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  goals: string[];
}

const diabetesOnboardingSteps = [
  {
    id: 1,
    title: "Patient Registration & Eligibility",
    description: "Verify RPM eligibility and gather basic information",
    status: "completed",
    duration: "5 min",
    icon: User,
    validations: [
      "Insurance verification",
      "Medicare/CMS criteria",
      "Provider referral",
    ],
    actions: ["Create RPM profile", "Verify eligibility", "Document consent"],
  },
  {
    id: 2,
    title: "Diabetes Clinical Assessment",
    description: "Comprehensive diabetes history and current status",
    status: "current",
    duration: "10 min",
    icon: Stethoscope,
    validations: [
      "Diabetes type confirmation",
      "Medication review",
      "Complication screening",
    ],
    actions: [
      "A1C target setting",
      "Risk stratification",
      "Care plan template",
    ],
  },
  {
    id: 3,
    title: "Device Pairing & Setup",
    description: "Connect glucose meter, CGM, and other monitoring devices",
    status: "pending",
    duration: "15 min",
    icon: Smartphone,
    validations: [
      "Device compatibility",
      "Connectivity test",
      "Data transmission",
    ],
    actions: ["Bluetooth pairing", "App installation", "Test readings"],
  },
  {
    id: 4,
    title: "Care Team Assignment",
    description: "Assign diabetes educator, nurse, and monitoring staff",
    status: "pending",
    duration: "3 min",
    icon: Heart,
    validations: ["Staff availability", "Workload balance", "Expertise match"],
    actions: [
      "Care coordinator assignment",
      "Contact preferences",
      "Schedule introduction",
    ],
  },
  {
    id: 5,
    title: "Personalized Care Plan",
    description: "Create individualized diabetes management plan",
    status: "pending",
    duration: "8 min",
    icon: Target,
    validations: [
      "Clinical guidelines",
      "Patient preferences",
      "Resource availability",
    ],
    actions: ["Goal setting", "Alert thresholds", "Education modules"],
  },
  {
    id: 6,
    title: "Education & Training",
    description: "Diabetes self-management and technology training",
    status: "pending",
    duration: "20 min",
    icon: FileText,
    validations: [
      "Learning assessment",
      "Comprehension check",
      "Skill demonstration",
    ],
    actions: ["Interactive modules", "Video tutorials", "Skill validation"],
  },
  {
    id: 7,
    title: "Baseline Data Collection",
    description: "Establish baseline metrics and historical data import",
    status: "pending",
    duration: "10 min",
    icon: BarChart3,
    validations: ["Data accuracy", "Trend analysis", "Risk assessment"],
    actions: [
      "Historical import",
      "Baseline measurements",
      "Trend establishment",
    ],
  },
  {
    id: 8,
    title: "Monitoring Schedule Setup",
    description: "Configure monitoring frequency and alert preferences",
    status: "pending",
    duration: "5 min",
    icon: Calendar,
    validations: [
      "Schedule feasibility",
      "Provider capacity",
      "Patient availability",
    ],
    actions: ["Reading schedule", "Check-in frequency", "Emergency protocols"],
  },
];

const deviceOptions = [
  {
    id: "freestyle_libre",
    name: "FreeStyle Libre CGM",
    type: "CGM",
    connectivity: "NFC/Bluetooth",
  },
  {
    id: "dexcom_g7",
    name: "Dexcom G7 CGM",
    type: "CGM",
    connectivity: "Bluetooth",
  },
  {
    id: "accu_chek",
    name: "Accu-Chek Guide",
    type: "Glucose Meter",
    connectivity: "Bluetooth",
  },
  {
    id: "one_touch",
    name: "OneTouch Verio",
    type: "Glucose Meter",
    connectivity: "Bluetooth",
  },
  {
    id: "omron_bp",
    name: "Omron BP Monitor",
    type: "Blood Pressure",
    connectivity: "Bluetooth",
  },
  {
    id: "weight_scale",
    name: "Smart Weight Scale",
    type: "Scale",
    connectivity: "WiFi/Bluetooth",
  },
];

export function DiabetesRPMOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessment, setAssessment] = useState<Partial<DiabetesAssessment>>({});
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = diabetesOnboardingSteps.find(
    (step) => step.id === currentStep,
  );
  const progress = (currentStep / diabetesOnboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < diabetesOnboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId],
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                RPM Eligibility Verification
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Medicare Part B or qualifying insurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Chronic condition requiring monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Provider referral for RPM services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Patient consent for remote monitoring</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input id="patientId" placeholder="Auto-generated" disabled />
              </div>
              <div>
                <Label htmlFor="referringProvider">Referring Provider</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-smith">
                      Dr. Sarah Smith (Endocrinology)
                    </SelectItem>
                    <SelectItem value="dr-johnson">
                      Dr. Michael Johnson (Internal Medicine)
                    </SelectItem>
                    <SelectItem value="dr-williams">
                      Dr. Lisa Williams (Family Medicine)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diabetesType">Diabetes Type</Label>
                <Select
                  onValueChange={(value) =>
                    setAssessment((prev) => ({
                      ...prev,
                      diabetesType: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type1">Type 1 Diabetes</SelectItem>
                    <SelectItem value="type2">Type 2 Diabetes</SelectItem>
                    <SelectItem value="gestational">
                      Gestational Diabetes
                    </SelectItem>
                    <SelectItem value="prediabetes">Prediabetes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                <Input
                  type="date"
                  id="diagnosisDate"
                  value={assessment.diagnosisDate || ""}
                  onChange={(e) =>
                    setAssessment((prev) => ({
                      ...prev,
                      diagnosisDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastA1C">Most Recent A1C (%)</Label>
                <Input
                  id="lastA1C"
                  placeholder="e.g., 7.2"
                  value={assessment.lastA1C || ""}
                  onChange={(e) =>
                    setAssessment((prev) => ({
                      ...prev,
                      lastA1C: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastFootExam">Last Foot Exam</Label>
                <Input
                  type="date"
                  id="lastFootExam"
                  value={assessment.lastFootExam || ""}
                  onChange={(e) =>
                    setAssessment((prev) => ({
                      ...prev,
                      lastFootExam: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Current Complications (Check all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "Neuropathy",
                  "Retinopathy",
                  "Nephropathy",
                  "Cardiovascular",
                  "Foot ulcers",
                  "None",
                ].map((complication) => (
                  <div
                    key={complication}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={complication}
                      checked={assessment.complications?.includes(complication)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssessment((prev) => ({
                            ...prev,
                            complications: [
                              ...(prev.complications || []),
                              complication,
                            ],
                          }));
                        } else {
                          setAssessment((prev) => ({
                            ...prev,
                            complications: (prev.complications || []).filter(
                              (c) => c !== complication,
                            ),
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={complication}>{complication}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current Diabetes Medications</Label>
              <Textarea
                id="medications"
                placeholder="List current medications, dosages, and frequency..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Device Setup Requirements
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-amber-600" />
                  <span>Stable internet connection (WiFi/Cellular)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Compatible smartphone or tablet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Bluetooth enabled device</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Select Monitoring Devices</h4>
              <div className="grid grid-cols-1 gap-3">
                {deviceOptions.map((device) => (
                  <Card
                    key={device.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDevices.includes(device.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                    onClick={() => handleDeviceToggle(device.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedDevices.includes(device.id)}
                            onChange={() => {}}
                          />
                          <div>
                            <h5 className="font-medium">{device.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {device.type} • {device.connectivity}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            selectedDevices.includes(device.id)
                              ? "default"
                              : "secondary"
                          }
                        >
                          {device.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="techComfort">
                Technology Comfort Level (1-10)
              </Label>
              <div className="flex items-center space-x-4 mt-2">
                <span>1 (Beginner)</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={assessment.techComfort || 5}
                  onChange={(e) =>
                    setAssessment((prev) => ({
                      ...prev,
                      techComfort: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span>10 (Expert)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current level: {assessment.techComfort || 5}/10
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Your Diabetes Care Team
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                A dedicated team will monitor your health data and provide
                support.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">Dr. Sarah Chen, CDE</h5>
                      <p className="text-sm text-muted-foreground">
                        Primary Diabetes Educator
                      </p>
                      <p className="text-sm">
                        20+ years experience • Available Mon-Fri 8AM-6PM
                      </p>
                    </div>
                    <Badge variant="outline">Assigned</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">Maria Rodriguez, RN</h5>
                      <p className="text-sm text-muted-foreground">
                        Care Coordinator
                      </p>
                      <p className="text-sm">
                        Daily monitoring • 24/7 emergency support
                      </p>
                    </div>
                    <Badge variant="outline">Assigned</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">Tech Support Team</h5>
                      <p className="text-sm text-muted-foreground">
                        Device & App Support
                      </p>
                      <p className="text-sm">
                        Mon-Fri 7AM-9PM • Weekend support available
                      </p>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label>Emergency Contact Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    placeholder="Full name"
                    value={assessment.emergencyContact?.name || ""}
                    onChange={(e) =>
                      setAssessment((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          name: e.target.value,
                        } as any,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    placeholder="(555) 123-4567"
                    value={assessment.emergencyContact?.phone || ""}
                    onChange={(e) =>
                      setAssessment((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          phone: e.target.value,
                        } as any,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelation">Relationship</Label>
                  <Select
                    onValueChange={(value) =>
                      setAssessment((prev) => ({
                        ...prev,
                        emergencyContact: {
                          ...prev.emergencyContact,
                          relationship: value,
                        } as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Adult Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Step {currentStep} Content
            </h3>
            <p className="text-muted-foreground">
              {currentStepData?.description}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Diabetes RPM Onboarding
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete setup for remote patient monitoring and diabetes care
          management
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStepData?.icon && (
                  <currentStepData.icon className="w-5 h-5" />
                )}
                Step {currentStep}: {currentStepData?.title}
              </CardTitle>
              <CardDescription>{currentStepData?.description}</CardDescription>
            </div>
            <Badge variant="outline">{currentStepData?.duration}</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {diabetesOnboardingSteps.length} •{" "}
            {Math.round(progress)}% complete
          </p>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === diabetesOnboardingSteps.length}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === diabetesOnboardingSteps.length
            ? "Complete Setup"
            : "Next Step"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Step Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {diabetesOnboardingSteps.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border ${
                  step.id === currentStep
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : step.id < currentStep
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : step.id === currentStep ? (
                    <Clock className="w-5 h-5 text-blue-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.duration}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
