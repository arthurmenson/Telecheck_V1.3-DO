import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FeatureExplainer, presets } from "../../components/FeatureExplainer";
import {
  Stethoscope,
  Calculator,
  Brain,
  Activity,
  Heart,
  Pill,
  Search,
  FileText,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  UserCheck,
  Shield,
  Settings,
  Smartphone,
  Monitor,
  Camera,
  MessageSquare,
  Calendar,
  Wifi,
  BatteryCharging,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  Weight,
  Eye,
  Bandage,
  CreditCard,
  BarChart3,
  FlaskConical,
  ScrollText,
  Phone,
  Video,
  Clipboard,
  MapPin
} from "lucide-react";

export function ClinicalTools() {
  const [activeRole, setActiveRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Define all clinical capabilities organized by role
  const clinicalCapabilities = {
    // Patient-facing capabilities
    patient: [
      {
        id: "diabetes-rpm",
        name: "Diabetes RPM Dashboard",
        description: "Personal diabetes monitoring with real-time glucose tracking, medication reminders, and care team communication",
        icon: Activity,
        category: "Remote Patient Monitoring",
        badge: "Personal Dashboard",
        color: "text-blue-600 bg-blue-50",
        features: ["Continuous glucose monitoring", "Medication tracking", "Symptom logging", "Care team messaging"],
        route: "/patient-rpm",
        userTypes: ["patient", "caregiver"]
      },
      {
        id: "wound-tracking",
        name: "Wound Self-Assessment", 
        description: "Photo-based wound tracking with healing progress monitoring and care instructions",
        icon: Bandage,
        category: "Wound Management",
        badge: "Self-Care",
        color: "text-green-600 bg-green-50",
        features: ["Photo documentation", "Healing progress", "Care instructions", "Alert system"],
        route: "/wound-self-assessment",
        userTypes: ["patient", "caregiver"]
      },
      {
        id: "vital-submission",
        name: "Vital Signs Reporting",
        description: "Submit daily vitals with automatic threshold checking and care team alerts",
        icon: Heart,
        category: "Monitoring",
        badge: "Daily Check-in",
        color: "text-red-600 bg-red-50",
        features: ["Blood pressure", "Weight tracking", "Temperature", "Oxygen saturation"],
        route: "/vital-submission",
        userTypes: ["patient", "caregiver"]
      },
      {
        id: "medication-adherence",
        name: "Medication Manager",
        description: "Medication reminders, adherence tracking, and pharmacy communication",
        icon: Pill,
        category: "Medication Management",
        badge: "Adherence",
        color: "text-purple-600 bg-purple-50",
        features: ["Reminder notifications", "Refill alerts", "Side effect tracking", "Pharmacy sync"],
        route: "/medication-manager",
        userTypes: ["patient", "caregiver"]
      },
      {
        id: "appointment-scheduling",
        name: "Appointment Scheduler",
        description: "Schedule appointments, video visits, and care team consultations",
        icon: Calendar,
        category: "Care Coordination",
        badge: "Scheduling",
        color: "text-indigo-600 bg-indigo-50",
        features: ["Online booking", "Video visits", "Reminder system", "Care team access"],
        route: "/appointment-scheduler",
        userTypes: ["patient", "caregiver"]
      },
      {
        id: "educational-content",
        name: "Health Education Hub",
        description: "Personalized educational content and self-care resources",
        icon: FileText,
        category: "Education",
        badge: "Learning",
        color: "text-orange-600 bg-orange-50",
        features: ["Condition-specific content", "Video tutorials", "Interactive guides", "Progress tracking"],
        route: "/health-education",
        userTypes: ["patient", "caregiver"]
      }
    ],

    // Healthcare provider capabilities
    provider: [
      {
        id: "ccm-workflow",
        name: "Chronic Care Management",
        description: "Complete CCM workflow with patient registry, encounters, goals tracking, and CMS billing",
        icon: Clipboard,
        category: "Care Management",
        badge: "CMS Billing",
        color: "text-blue-600 bg-blue-50",
        features: ["Patient registry", "Monthly encounters", "Goal tracking", "99490-99491 billing"],
        route: "/ccm-workflow",
        userTypes: ["doctor", "nurse", "care-coordinator"]
      },
      {
        id: "rpm-monitoring",
        name: "RPM Command Center",
        description: "Monitor all RPM patients with real-time alerts, device status, and billing integration",
        icon: Monitor,
        category: "Remote Monitoring",
        badge: "Real-time",
        color: "text-green-600 bg-green-50",
        features: ["Patient monitoring", "Device management", "Alert dashboard", "99453-99458 billing"],
        route: "/rpm-command-center",
        userTypes: ["doctor", "nurse", "care-coordinator"]
      },
      {
        id: "wound-management",
        name: "Clinical Wound Management",
        description: "Professional wound assessment, documentation, and treatment planning",
        icon: Eye,
        category: "Wound Care",
        badge: "Clinical",
        color: "text-purple-600 bg-purple-50",
        features: ["Wound staging", "Photo analysis", "Treatment plans", "Progress tracking"],
        route: "/clinical-wound-management",
        userTypes: ["doctor", "nurse", "wound-specialist"]
      },
      {
        id: "threshold-management",
        name: "Patient Threshold Manager",
        description: "Set and manage patient-specific alert thresholds and care protocols",
        icon: Target,
        category: "Alert Management",
        badge: "Personalized",
        color: "text-red-600 bg-red-50",
        features: ["Custom thresholds", "Alert protocols", "Care team assignment", "Escalation rules"],
        route: "/admin/settings?tab=messaging",
        userTypes: ["doctor", "nurse", "admin"]
      },
      {
        id: "ai-scribe",
        name: "AI Medical Scribe",
        description: "AI-powered clinical documentation and note generation",
        icon: Brain,
        category: "Documentation",
        badge: "AI-Powered",
        color: "text-indigo-600 bg-indigo-50",
        features: ["Voice recognition", "Clinical notes", "ICD-10 coding", "Template library"],
        route: "/ehr/ai-scribe",
        userTypes: ["doctor", "nurse"]
      },
      {
        id: "lab-analysis",
        name: "Lab Result Analyzer",
        description: "Automated lab interpretation with trend analysis and clinical recommendations",
        icon: TestTube,
        category: "Laboratory",
        badge: "Automated",
        color: "text-yellow-600 bg-yellow-50",
        features: ["Auto-interpretation", "Trend analysis", "Critical alerts", "Reference ranges"],
        route: "/lab-analyzer",
        userTypes: ["doctor", "nurse", "lab-tech"]
      },
      {
        id: "clinical-calculators",
        name: "Clinical Calculator Suite",
        description: "Medical calculators for dosing, risk assessment, and clinical decision support",
        icon: Calculator,
        category: "Decision Support",
        badge: "Essential",
        color: "text-teal-600 bg-teal-50",
        features: ["Risk calculators", "Dosing tools", "BMI/BSA", "Clinical scores"],
        route: "/clinical-calculators",
        userTypes: ["doctor", "nurse", "pharmacist"]
      },
      {
        id: "drug-interactions",
        name: "Drug Interaction Checker",
        description: "Comprehensive drug interaction analysis with severity ratings and recommendations",
        icon: AlertTriangle,
        category: "Medication Safety",
        badge: "Critical Safety",
        color: "text-red-600 bg-red-50",
        features: ["Real-time alerts", "Severity ratings", "Alternative suggestions", "Clinical guidance"],
        route: "/drug-interactions",
        userTypes: ["doctor", "nurse", "pharmacist"]
      }
    ],

    // Administrative and technical capabilities
    admin: [
      {
        id: "messaging-admin",
        name: "Messaging Administration",
        description: "Configure messaging services, alert thresholds, and care team communications",
        icon: MessageSquare,
        category: "System Management",
        badge: "Admin Only",
        color: "text-blue-600 bg-blue-50",
        features: ["API configuration", "Alert thresholds", "Care team setup", "Message templates"],
        route: "/admin/settings?tab=messaging",
        userTypes: ["admin", "it-support"]
      },
      {
        id: "device-management",
        name: "Device Integration Hub",
        description: "Manage and configure RPM devices, connectivity, and data synchronization",
        icon: Smartphone,
        category: "Device Management",
        badge: "Technical",
        color: "text-green-600 bg-green-50",
        features: ["Device pairing", "Data sync", "Battery monitoring", "Connectivity status"],
        route: "/device-management",
        userTypes: ["admin", "it-support", "care-coordinator"]
      },
      {
        id: "billing-integration",
        name: "Billing & Analytics",
        description: "Comprehensive billing integration with RPM, CCM codes and financial analytics",
        icon: CreditCard,
        category: "Financial Management",
        badge: "Revenue",
        color: "text-purple-600 bg-purple-50",
        features: ["CMS billing codes", "Revenue analytics", "Compliance tracking", "Financial reports"],
        route: "/billing-analytics",
        userTypes: ["admin", "billing", "finance"]
      },
      {
        id: "user-management",
        name: "User & Role Management",
        description: "Manage user accounts, permissions, and role-based access controls",
        icon: Users,
        category: "User Management",
        badge: "Security",
        color: "text-indigo-600 bg-indigo-50",
        features: ["User accounts", "Role permissions", "Access controls", "Audit logs"],
        route: "/admin/settings?tab=users",
        userTypes: ["admin"]
      },
      {
        id: "system-monitoring",
        name: "System Health Monitor",
        description: "Monitor system performance, uptime, and service health across all modules",
        icon: BarChart3,
        category: "System Monitoring",
        badge: "Operations",
        color: "text-orange-600 bg-orange-50",
        features: ["Performance metrics", "Uptime monitoring", "Service health", "Alert management"],
        route: "/system-monitor",
        userTypes: ["admin", "it-support"]
      }
    ]
  };

  // Get all capabilities based on selected role
  const getFilteredCapabilities = () => {
    let capabilities = [];
    
    if (activeRole === "all") {
      capabilities = [...clinicalCapabilities.patient, ...clinicalCapabilities.provider, ...clinicalCapabilities.admin];
    } else if (activeRole === "patient") {
      capabilities = clinicalCapabilities.patient;
    } else if (activeRole === "provider") {
      capabilities = clinicalCapabilities.provider;
    } else if (activeRole === "admin") {
      capabilities = clinicalCapabilities.admin;
    }
    
    // Apply search filter
    if (searchTerm) {
      capabilities = capabilities.filter(cap => 
        cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cap.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return capabilities;
  };

  const roleStats = {
    patient: {
      count: clinicalCapabilities.patient.length,
      label: "Patient Features",
      description: "Self-management and monitoring tools"
    },
    provider: {
      count: clinicalCapabilities.provider.length,
      label: "Provider Tools",
      description: "Clinical decision support and workflows"
    },
    admin: {
      count: clinicalCapabilities.admin.length,
      label: "Admin Functions",
      description: "System management and configuration"
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clinical Capabilities Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive suite of RPM, CCM, wound management, and clinical tools organized by user role
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {Object.values(clinicalCapabilities).flat().length} Total Features
          </Badge>
        </div>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(roleStats).map(([role, stats]) => (
          <Card key={role} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  role === 'patient' ? 'text-blue-600 bg-blue-50' :
                  role === 'provider' ? 'text-green-600 bg-green-50' :
                  'text-purple-600 bg-purple-50'
                }`}>
                  {role === 'patient' && <Users className="w-6 h-6" />}
                  {role === 'provider' && <Stethoscope className="w-6 h-6" />}
                  {role === 'admin' && <Settings className="w-6 h-6" />}
                </div>
                <Badge variant="secondary">{stats.count} Features</Badge>
              </div>
              <CardTitle className="text-lg">{stats.label}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.description}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Clinical Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search capabilities, features, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeRole === "all" ? "default" : "outline"}
                onClick={() => setActiveRole("all")}
              >
                All Roles
              </Button>
              <Button
                variant={activeRole === "patient" ? "default" : "outline"}
                onClick={() => setActiveRole("patient")}
              >
                Patients
              </Button>
              <Button
                variant={activeRole === "provider" ? "default" : "outline"}
                onClick={() => setActiveRole("provider")}
              >
                Providers
              </Button>
              <Button
                variant={activeRole === "admin" ? "default" : "outline"}
                onClick={() => setActiveRole("admin")}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredCapabilities().map((capability) => (
          <Card key={capability.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${capability.color} flex items-center justify-center`}>
                  <capability.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary">{capability.badge}</Badge>
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                {capability.name}
                <FeatureExplainer
                  title={capability.name}
                  description={capability.description}
                  features={capability.features}
                  category={capability.category}
                  benefits={
                    capability.id === 'ai-scribe' ? [
                      "Save 4+ hours daily on documentation",
                      "Reduce transcription errors by 80%",
                      "Improve patient face time",
                      "Ensure HIPAA compliance",
                      "Generate billable codes automatically"
                    ] : capability.id === 'ccm-workflow' ? [
                      "CMS-compliant CCM billing (99490-99491)",
                      "Automated monthly encounters",
                      "Improved patient outcomes tracking",
                      "Streamlined care coordination"
                    ] : capability.id === 'rpm-monitoring' ? [
                      "Real-time patient monitoring",
                      "Automated alert management",
                      "RPM billing codes (99453-99458)",
                      "Reduced hospital readmissions"
                    ] : [
                      "Streamlined clinical workflow",
                      "Improved patient outcomes",
                      "Enhanced documentation",
                      "Better care coordination"
                    ]
                  }
                  examples={
                    capability.id === 'ai-scribe' ? [
                      "Record patient consultations and get structured SOAP notes",
                      "Upload audio files for batch processing",
                      "Generate ICD-10 codes automatically",
                      "Create follow-up task lists from conversations"
                    ] : capability.id === 'ccm-workflow' ? [
                      "Manage chronic disease patients with structured care plans",
                      "Track monthly care management encounters",
                      "Generate CMS-compliant billing documentation"
                    ] : [
                      `Access via ${capability.route}`,
                      `Available for: ${capability.userTypes.join(", ")}`,
                      `Category: ${capability.category}`
                    ]
                  }
                  complexity={
                    capability.id === 'ai-scribe' ? "Intermediate" :
                    capability.id === 'ccm-workflow' ? "Advanced" :
                    "Beginner"
                  }
                  estimatedTime={
                    capability.id === 'ai-scribe' ? "15 min setup" :
                    capability.id === 'ccm-workflow' ? "30 min training" :
                    "5-10 min"
                  }
                  prerequisites={
                    capability.id === 'ai-scribe' ? [
                      "Microphone access permission",
                      "Basic EHR knowledge",
                      "Medical terminology familiarity"
                    ] : capability.id === 'ccm-workflow' ? [
                      "CMS CCM program enrollment",
                      "Care management training",
                      "Billing system integration"
                    ] : []
                  }
                  learnMoreUrl={
                    capability.id === 'ai-scribe' ? "#ai-scribe-docs" :
                    capability.id === 'ccm-workflow' ? "#ccm-billing-guide" :
                    undefined
                  }
                  videoUrl={
                    capability.id === 'ai-scribe' ? "#ai-scribe-demo" :
                    undefined
                  }
                  size="sm"
                  variant="info"
                />
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {capability.description}
              </p>
              <Badge variant="outline" className="text-xs w-fit">
                {capability.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Key Features:
                </div>
                <ul className="space-y-1">
                  {capability.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <div className="text-xs text-gray-500 mb-2">
                    User Types: {capability.userTypes.join(", ")}
                  </div>
                  <Button className="w-full mt-2" onClick={() => window.location.href = capability.route}>
                    Open Tool
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15,420</div>
              <div className="text-sm text-gray-600">RPM Readings Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">847</div>
              <div className="text-sm text-gray-600">CCM Encounters This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">99.2%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">✅ Completed Integrations</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Comprehensive RPM Dashboard with CGM integration</li>
                <li>• CCM workflow with CMS billing (99490-99491)</li>
                <li>• Diabetic wound management with photo tracking</li>
                <li>• Device integration (Dexcom G7, FreeStyle Libre)</li>
                <li>• Patient-specific alert thresholds</li>
                <li>• Care team messaging with Telnyx/Twilio</li>
                <li>• AI-powered clinical decision support</li>
                <li>• HIPAA-compliant audit logging</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">🚀 Key Capabilities</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Real-time vital monitoring with threshold alerts</li>
                <li>• Automated care team escalation workflows</li>
                <li>• Comprehensive billing integration (RPM/CCM codes)</li>
                <li>• Patient engagement tools and education</li>
                <li>• Advanced analytics and reporting</li>
                <li>• Multi-role access with security controls</li>
                <li>• API integrations for EHR connectivity</li>
                <li>• Mobile-responsive design for all devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
