import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Heart,
  Target,
  Zap,
  Activity,
  Shield,
  Info,
  Eye,
  Plus,
  ArrowRight,
  Pill,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Beaker,
  Dna,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  Users,
  BookOpen,
  Microscope,
  LineChart,
  RotateCcw,
} from "lucide-react";

interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  status: "normal" | "high" | "low" | "critical";
  date: string;
  trend: "up" | "down" | "stable";
}

interface MedicalCondition {
  id: string;
  name: string;
  icd10: string;
  severity: "mild" | "moderate" | "severe";
  diagnosedDate: string;
  status: "active" | "resolved" | "monitoring";
  controlLevel: "well-controlled" | "partially-controlled" | "uncontrolled";
}

interface CurrentMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  indication: string;
  effectiveness: number;
  sideEffects: string[];
  adherence: number;
  startDate: string;
}

interface AIRecommendation {
  id: string;
  type:
    | "medication_change"
    | "new_medication"
    | "dosage_adjustment"
    | "lifestyle"
    | "monitoring";
  priority: "high" | "medium" | "low";
  confidence: number;
  title: string;
  description: string;
  reasoning: string[];
  expectedOutcomes: string[];
  risksAndBenefits: {
    benefits: string[];
    risks: string[];
  };
  supportingEvidence: {
    studies: string[];
    guidelines: string[];
    similarPatients: number;
  };
  implementation: {
    timeline: string;
    monitoring: string[];
    followUp: string;
  };
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    cost: string;
    alternatives: string[];
  }[];
  contraindications: string[];
  drugInteractions: string[];
}

interface PatientProfile {
  demographics: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    bmi: number;
  };
  allergies: string[];
  genetics: {
    pgxResults: any[];
    riskFactors: string[];
  };
  lifestyle: {
    smoking: boolean;
    alcohol: string;
    exercise: string;
    diet: string;
  };
}

export function AITreatmentRecommendations() {
  const [expandedRecommendation, setExpandedRecommendation] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(new Date());
  const [implementedRecommendations, setImplementedRecommendations] = useState<
    string[]
  >([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<
    string[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock patient data
  const patientProfile: PatientProfile = {
    demographics: {
      age: 52,
      gender: "Male",
      weight: 185,
      height: 70,
      bmi: 26.5,
    },
    allergies: ["Penicillin", "Shellfish"],
    genetics: {
      pgxResults: [
        {
          gene: "CYP2D6",
          variant: "*1/*4",
          impact: "Intermediate metabolizer",
        },
        {
          gene: "SLCO1B1",
          variant: "*5",
          impact: "Increased statin sensitivity",
        },
      ],
      riskFactors: ["Cardiovascular disease", "Type 2 diabetes"],
    },
    lifestyle: {
      smoking: false,
      alcohol: "Occasional",
      exercise: "2-3 times/week",
      diet: "Standard American",
    },
  };

  const currentMedications: CurrentMedication[] = [
    {
      id: "1",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      indication: "High cholesterol",
      effectiveness: 78,
      sideEffects: ["Muscle aches"],
      adherence: 94,
      startDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      indication: "Type 2 Diabetes",
      effectiveness: 85,
      sideEffects: ["Nausea", "Diarrhea"],
      adherence: 89,
      startDate: "2024-01-20",
    },
    {
      id: "3",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      indication: "Hypertension",
      effectiveness: 82,
      sideEffects: ["Dry cough"],
      adherence: 96,
      startDate: "2024-02-01",
    },
  ];

  const recentLabResults: LabResult[] = [
    {
      id: "1",
      name: "HbA1c",
      value: 7.2,
      unit: "%",
      normalRange: "<7.0%",
      status: "high",
      date: "2024-01-25",
      trend: "down",
    },
    {
      id: "2",
      name: "LDL Cholesterol",
      value: 145,
      unit: "mg/dL",
      normalRange: "<100 mg/dL",
      status: "high",
      date: "2024-01-25",
      trend: "stable",
    },
    {
      id: "3",
      name: "Blood Pressure (Systolic)",
      value: 138,
      unit: "mmHg",
      normalRange: "<130 mmHg",
      status: "high",
      date: "2024-01-28",
      trend: "up",
    },
    {
      id: "4",
      name: "eGFR",
      value: 68,
      unit: "mL/min/1.73m²",
      normalRange: ">90",
      status: "low",
      date: "2024-01-25",
      trend: "down",
    },
    {
      id: "5",
      name: "ALT",
      value: 42,
      unit: "U/L",
      normalRange: "7-40 U/L",
      status: "high",
      date: "2024-01-25",
      trend: "up",
    },
  ];

  const medicalConditions: MedicalCondition[] = [
    {
      id: "1",
      name: "Type 2 Diabetes Mellitus",
      icd10: "E11.9",
      severity: "moderate",
      diagnosedDate: "2023-08-15",
      status: "active",
      controlLevel: "partially-controlled",
    },
    {
      id: "2",
      name: "Hyperlipidemia",
      icd10: "E78.5",
      severity: "moderate",
      diagnosedDate: "2023-09-10",
      status: "active",
      controlLevel: "partially-controlled",
    },
    {
      id: "3",
      name: "Essential Hypertension",
      icd10: "I10",
      severity: "mild",
      diagnosedDate: "2024-01-20",
      status: "active",
      controlLevel: "partially-controlled",
    },
  ];

  const aiRecommendations: AIRecommendation[] = [
    {
      id: "1",
      type: "medication_change",
      priority: "high",
      confidence: 92,
      title: "Consider Rosuvastatin Switch for Better LDL Control",
      description:
        "Based on current LDL levels (145 mg/dL) and genetic profile (SLCO1B1*5), switching from atorvastatin to rosuvastatin may provide better cholesterol control with reduced muscle side effects.",
      reasoning: [
        "Current LDL (145 mg/dL) remains above target (<100 mg/dL)",
        "Patient reports muscle aches with current atorvastatin",
        "SLCO1B1*5 variant suggests increased sensitivity to atorvastatin",
        "Rosuvastatin has lower interaction with SLCO1B1 variants",
      ],
      expectedOutcomes: [
        "15-25% additional LDL reduction expected",
        "Reduced muscle-related side effects",
        "Improved medication adherence",
        "Better cardiovascular risk reduction",
      ],
      risksAndBenefits: {
        benefits: [
          "More potent LDL reduction",
          "Better genetic compatibility",
          "Lower drug interaction potential",
          "Once-daily dosing maintained",
        ],
        risks: [
          "Potential for different side effect profile",
          "Need for monitoring during transition",
          "Insurance coverage considerations",
          "Temporary lipid fluctuations during switch",
        ],
      },
      supportingEvidence: {
        studies: [
          "ASTEROID trial: Rosuvastatin superiority in LDL reduction",
          "PGx studies: SLCO1B1 variants and statin response",
          "Head-to-head comparisons: Rosuvastatin vs Atorvastatin",
        ],
        guidelines: [
          "2019 AHA/ACC Primary Prevention Guidelines",
          "Clinical Pharmacogenetics Implementation Consortium",
        ],
        similarPatients: 1847,
      },
      implementation: {
        timeline: "2-4 weeks transition period",
        monitoring: [
          "Lipid panel at 6 weeks",
          "Liver enzymes",
          "Muscle symptoms",
        ],
        followUp: "Lipid reassessment in 8-12 weeks",
      },
      medications: [
        {
          name: "Rosuvastatin",
          dosage: "10mg",
          frequency: "Once daily",
          cost: "$25/month",
          alternatives: ["Pitavastatin 2mg", "Pravastatin 40mg"],
        },
      ],
      contraindications: ["Active liver disease", "Pregnancy"],
      drugInteractions: ["Cyclosporine", "Gemfibrozil"],
    },
    {
      id: "2",
      type: "dosage_adjustment",
      priority: "high",
      confidence: 88,
      title: "Increase Metformin Dose for Better Glycemic Control",
      description:
        "Current HbA1c of 7.2% suggests suboptimal diabetes control. Increasing metformin to maximum tolerated dose could improve glycemic control before adding additional medications.",
      reasoning: [
        "HbA1c 7.2% above ADA target of <7.0%",
        "Patient tolerating current 500mg BID well",
        "No contraindications to dose escalation",
        "Cost-effective first-line optimization",
      ],
      expectedOutcomes: [
        "0.5-1.0% HbA1c reduction expected",
        "Delayed need for additional diabetes medications",
        "Improved insulin sensitivity",
        "Potential modest weight benefit",
      ],
      risksAndBenefits: {
        benefits: [
          "Improved glycemic control",
          "Delayed disease progression",
          "Cardiovascular protection",
          "Cost-effective approach",
        ],
        risks: [
          "Increased GI side effects initially",
          "Vitamin B12 deficiency (long-term)",
          "Rare lactic acidosis risk",
          "Need for gradual dose titration",
        ],
      },
      supportingEvidence: {
        studies: [
          "UKPDS: Metformin cardiovascular benefits",
          "Dose-response studies: Metformin efficacy",
          "Real-world evidence: Metformin optimization",
        ],
        guidelines: [
          "ADA Standards of Medical Care 2024",
          "AACE Diabetes Management Guidelines",
        ],
        similarPatients: 2356,
      },
      implementation: {
        timeline: "4-6 weeks gradual titration",
        monitoring: ["HbA1c in 12 weeks", "Kidney function", "GI tolerance"],
        followUp: "Diabetes reassessment in 3 months",
      },
      medications: [
        {
          name: "Metformin XR",
          dosage: "750mg",
          frequency: "Twice daily",
          cost: "$15/month",
          alternatives: ["Metformin IR 850mg BID", "Metformin XR 1000mg BID"],
        },
      ],
      contraindications: ["eGFR <30", "Acute illness"],
      drugInteractions: ["Alcohol", "Contrast agents"],
    },
    {
      id: "3",
      type: "new_medication",
      priority: "medium",
      confidence: 76,
      title: "Add SGLT2 Inhibitor for Comprehensive Diabetes Management",
      description:
        "Given cardiovascular risk factors and current suboptimal control, adding empagliflozin could provide additional glycemic control plus cardiovascular and renal protection.",
      reasoning: [
        "Multiple cardiovascular risk factors present",
        "HbA1c remains above target despite metformin",
        "SGLT2 inhibitors proven CV and renal benefits",
        "Complementary mechanism to metformin",
      ],
      expectedOutcomes: [
        "0.7-1.0% additional HbA1c reduction",
        "20-30% reduction in cardiovascular events",
        "Renal function preservation",
        "Modest weight loss (2-4 kg)",
      ],
      risksAndBenefits: {
        benefits: [
          "Cardiovascular protection",
          "Renal protection",
          "Weight loss",
          "Blood pressure reduction",
        ],
        risks: [
          "Genital infections risk",
          "Volume depletion",
          "Rare diabetic ketoacidosis",
          "Higher medication cost",
        ],
      },
      supportingEvidence: {
        studies: [
          "EMPA-REG OUTCOME trial",
          "CANVAS Program",
          "Real-world SGLT2 inhibitor studies",
        ],
        guidelines: [
          "ADA/EASD Consensus Statement",
          "ACC/AHA Cardiovascular Risk Guidelines",
        ],
        similarPatients: 982,
      },
      implementation: {
        timeline: "Start after metformin optimization",
        monitoring: ["Kidney function", "Genital symptoms", "Volume status"],
        followUp: "Comprehensive diabetes review in 3-6 months",
      },
      medications: [
        {
          name: "Empagliflozin",
          dosage: "10mg",
          frequency: "Once daily",
          cost: "$450/month",
          alternatives: ["Canagliflozin 100mg", "Dapagliflozin 10mg"],
        },
      ],
      contraindications: ["Type 1 diabetes", "Severe renal impairment"],
      drugInteractions: ["Diuretics (volume depletion)"],
    },
    {
      id: "4",
      type: "monitoring",
      priority: "medium",
      confidence: 95,
      title: "Enhanced Liver Function Monitoring",
      description:
        "Elevated ALT (42 U/L) warrants closer monitoring given current statin therapy and potential medication changes.",
      reasoning: [
        "ALT elevated above normal (>40 U/L)",
        "Current statin therapy can affect liver enzymes",
        "Planned medication changes require baseline monitoring",
        "Early detection of hepatotoxicity important",
      ],
      expectedOutcomes: [
        "Early detection of liver problems",
        "Safe medication management",
        "Appropriate dose adjustments if needed",
        "Patient safety optimization",
      ],
      risksAndBenefits: {
        benefits: [
          "Enhanced safety monitoring",
          "Early problem detection",
          "Appropriate intervention timing",
          "Medication optimization guidance",
        ],
        risks: [
          "Additional healthcare costs",
          "Patient anxiety from testing",
          "Potential over-monitoring",
          "Healthcare visit burden",
        ],
      },
      supportingEvidence: {
        studies: [
          "Statin safety monitoring guidelines",
          "Drug-induced liver injury studies",
        ],
        guidelines: [
          "ACC/AHA Cholesterol Guidelines",
          "FDA Statin Safety Guidance",
        ],
        similarPatients: 3421,
      },
      implementation: {
        timeline: "Immediate - within 2 weeks",
        monitoring: ["Liver enzymes monthly x3", "Symptoms assessment"],
        followUp: "Liver function trend evaluation",
      },
      contraindications: [],
      drugInteractions: [],
    },
    {
      id: "5",
      type: "lifestyle",
      priority: "medium",
      confidence: 82,
      title: "Structured Dietary Intervention for Diabetes Control",
      description:
        "Implementing a structured low-carbohydrate or Mediterranean diet could significantly improve glycemic control and reduce medication burden.",
      reasoning: [
        "Current diet suboptimal for diabetes management",
        "Lifestyle interventions highly effective for T2DM",
        "Potential to reduce medication needs",
        "Multiple health benefits beyond glucose",
      ],
      expectedOutcomes: [
        "0.5-1.5% HbA1c reduction possible",
        "Weight loss 5-10% of body weight",
        "Improved insulin sensitivity",
        "Cardiovascular risk reduction",
      ],
      risksAndBenefits: {
        benefits: [
          "Improved glucose control",
          "Weight management",
          "Cardiovascular health",
          "Reduced medication dependence",
        ],
        risks: [
          "Initial adjustment period",
          "Requires lifestyle commitment",
          "Potential nutrient concerns",
          "Social/cultural challenges",
        ],
      },
      supportingEvidence: {
        studies: [
          "Look AHEAD trial",
          "Mediterranean diet RCTs",
          "Low-carb diet meta-analyses",
        ],
        guidelines: [
          "ADA Nutrition Therapy Guidelines",
          "Diabetes Prevention Program",
        ],
        similarPatients: 1654,
      },
      implementation: {
        timeline: "3-6 months structured program",
        monitoring: ["Weight", "HbA1c", "Nutritional status"],
        followUp: "Dietitian consultation and follow-up",
      },
      contraindications: ["Eating disorders", "Severe comorbidities"],
      drugInteractions: [],
    },
  ];

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setLastAnalysis(new Date());
    }, 3000);
  };

  const handleImplementRecommendation = (recommendationId: string) => {
    setImplementedRecommendations((prev) => [...prev, recommendationId]);
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations((prev) => [...prev, recommendationId]);
  };

  const handleUndoAction = (recommendationId: string) => {
    setImplementedRecommendations((prev) =>
      prev.filter((id) => id !== recommendationId),
    );
    setDismissedRecommendations((prev) =>
      prev.filter((id) => id !== recommendationId),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "high":
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getControlColor = (control: string) => {
    switch (control) {
      case "well-controlled":
        return "bg-green-100 text-green-800";
      case "partially-controlled":
        return "bg-yellow-100 text-yellow-800";
      case "uncontrolled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  AI Treatment Recommendations
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Advanced AI
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Personalized treatment optimization based on your medications,
                  labs, and medical history
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1 text-purple-600">
                    <Activity className="w-4 h-4" />
                    <span>Real-time Analysis</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Shield className="w-4 h-4" />
                    <span>Evidence-based</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600">
                    <Target className="w-4 h-4" />
                    <span>Personalized</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                <Button
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 mb-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastAnalysis.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        {[
          { id: "recommendations", label: "AI Recommendations", icon: Brain },
          { id: "current-data", label: "Current Data", icon: BarChart3 },
          { id: "trends", label: "Trends & Insights", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id ? "gradient-bg text-white border-0" : ""
              }
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    aiRecommendations.filter((r) => r.priority === "high")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  High Priority
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    aiRecommendations.filter((r) => r.priority === "medium")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Medium Priority
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {implementedRecommendations.length}
                </div>
                <div className="text-sm text-muted-foreground">Implemented</div>
                <div className="text-xs text-green-600 mt-1">
                  {Math.round(
                    (implementedRecommendations.length /
                      aiRecommendations.length) *
                      100,
                  )}
                  % complete
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    aiRecommendations.reduce(
                      (sum, r) => sum + r.confidence,
                      0,
                    ) / aiRecommendations.length,
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Confidence
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aiRecommendations.length - dismissedRecommendations.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Recommendations
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {dismissedRecommendations.length} dismissed
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Tracking */}
          {implementedRecommendations.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  Treatment Optimization Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Recommendations Implemented</span>
                      <span>
                        {implementedRecommendations.length} of{" "}
                        {aiRecommendations.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (implementedRecommendations.length /
                          aiRecommendations.length) *
                        100
                      }
                      className="h-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Expected Benefits</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• 15-25% LDL reduction</li>
                        <li>• 0.5-1.0% HbA1c improvement</li>
                        <li>• Reduced side effects</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Next Steps</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Schedule provider visit</li>
                        <li>• Lab work in 6-8 weeks</li>
                        <li>• Monitor symptoms</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Timeline</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• 2-4 weeks transition</li>
                        <li>• 8-12 weeks full effect</li>
                        <li>• 3-6 months reassessment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Urgent Alerts */}
          {aiRecommendations.filter(
            (r) =>
              r.priority === "high" &&
              !implementedRecommendations.includes(r.id) &&
              !dismissedRecommendations.includes(r.id),
          ).length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Urgent: High Priority Recommendations Require Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiRecommendations
                    .filter(
                      (r) =>
                        r.priority === "high" &&
                        !implementedRecommendations.includes(r.id) &&
                        !dismissedRecommendations.includes(r.id),
                    )
                    .map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-red-800">
                            {rec.title}
                          </span>
                          <div className="text-sm text-red-600">
                            {rec.confidence}% confidence
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setExpandedRecommendation(rec.id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Review Now
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <div className="space-y-4">
            {aiRecommendations.map((recommendation) => (
              <Card
                key={recommendation.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {recommendation.title}
                        </CardTitle>
                        <Badge
                          className={getPriorityColor(recommendation.priority)}
                        >
                          {recommendation.priority} priority
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          {recommendation.confidence}% confidence
                        </Badge>
                        {implementedRecommendations.includes(
                          recommendation.id,
                        ) && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Implemented
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedRecommendation(
                          expandedRecommendation === recommendation.id
                            ? null
                            : recommendation.id,
                        )
                      }
                    >
                      {expandedRecommendation === recommendation.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedRecommendation === recommendation.id && (
                  <CardContent>
                    <div className="space-y-6">
                      {/* Clinical Reasoning */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                          Clinical Reasoning
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recommendation.reasoning.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Expected Outcomes */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-green-500" />
                          Expected Outcomes
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {recommendation.expectedOutcomes.map(
                            (outcome, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {outcome}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      {/* Benefits and Risks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                            Benefits
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {recommendation.risksAndBenefits.benefits.map(
                              (benefit, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <Plus className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-green-700">
                                    {benefit}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                            Risks & Considerations
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {recommendation.risksAndBenefits.risks.map(
                              (risk, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-yellow-700">
                                    {risk}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Medications if applicable */}
                      {recommendation.medications && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center">
                            <Pill className="w-4 h-4 mr-2 text-blue-500" />
                            Recommended Medications
                          </h4>
                          {recommendation.medications.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{med.name}</span>
                                <Badge variant="outline">{med.cost}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {med.dosage} • {med.frequency}
                              </div>
                              {med.alternatives.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Alternatives: {med.alternatives.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Supporting Evidence */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                          Supporting Evidence
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-1">
                              Clinical Studies
                            </h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {recommendation.supportingEvidence.studies.map(
                                (study, idx) => (
                                  <li key={idx}>{study}</li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-1">
                              Guidelines
                            </h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {recommendation.supportingEvidence.guidelines.map(
                                (guideline, idx) => (
                                  <li key={idx}>{guideline}</li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-1">
                              Similar Patients
                            </h5>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-600">
                                {recommendation.supportingEvidence.similarPatients.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Implementation Plan */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                          Implementation Plan
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h5 className="text-sm font-medium mb-1">
                              Timeline
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {recommendation.implementation.timeline}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h5 className="text-sm font-medium mb-1">
                              Monitoring
                            </h5>
                            <ul className="text-xs text-muted-foreground">
                              {recommendation.implementation.monitoring.map(
                                (item, idx) => (
                                  <li key={idx}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h5 className="text-sm font-medium mb-1">
                              Follow-up
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {recommendation.implementation.followUp}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        {!implementedRecommendations.includes(
                          recommendation.id,
                        ) ? (
                          <>
                            <Button
                              onClick={() =>
                                handleImplementRecommendation(recommendation.id)
                              }
                              className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Discuss with Doctor
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              Generate Report
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleDismissRecommendation(recommendation.id)
                              }
                              className="text-red-600 hover:bg-red-50"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1 bg-green-50 text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Implemented
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUndoAction(recommendation.id)
                              }
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Undo
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Data Tab */}
      {activeTab === "current-data" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Medications Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Current Medications Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMedications.map((med) => (
                    <div key={med.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{med.name}</h4>
                        <Badge variant="outline">
                          {med.effectiveness}% effective
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {med.dosage} • {med.frequency} • For {med.indication}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-green-600">
                          Adherence: {med.adherence}%
                        </div>
                        {med.sideEffects.length > 0 && (
                          <div className="text-xs text-yellow-600">
                            Side effects: {med.sideEffects.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-purple-600" />
                  Recent Lab Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLabResults.map((lab) => (
                    <div key={lab.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{lab.name}</h4>
                        <Badge className={getStatusColor(lab.status)}>
                          {lab.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {lab.value} {lab.unit}
                        </span>
                        <span className="text-muted-foreground">
                          Normal: {lab.normalRange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-muted-foreground">
                          {lab.date}
                        </span>
                        <div className="flex items-center gap-1">
                          {lab.trend === "up" && (
                            <TrendingUp className="w-3 h-3 text-red-500" />
                          )}
                          {lab.trend === "down" && (
                            <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />
                          )}
                          {lab.trend === "stable" && (
                            <div className="w-3 h-0.5 bg-blue-500" />
                          )}
                          <span className="text-muted-foreground">
                            {lab.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                Active Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {medicalConditions.map((condition) => (
                  <div key={condition.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{condition.name}</h4>
                      <Badge
                        className={getControlColor(condition.controlLevel)}
                      >
                        {condition.controlLevel.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>ICD-10: {condition.icd10}</div>
                      <div>Severity: {condition.severity}</div>
                      <div>
                        Diagnosed:{" "}
                        {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Patient Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Demographics</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Age: {patientProfile.demographics.age} years</div>
                    <div>Gender: {patientProfile.demographics.gender}</div>
                    <div>BMI: {patientProfile.demographics.bmi}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Genetics</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {patientProfile.genetics.pgxResults.map((result, idx) => (
                      <div key={idx}>
                        {result.gene}: {result.variant}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Lifestyle</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Exercise: {patientProfile.lifestyle.exercise}</div>
                    <div>
                      Smoking: {patientProfile.lifestyle.smoking ? "Yes" : "No"}
                    </div>
                    <div>Alcohol: {patientProfile.lifestyle.alcohol}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Treatment Effectiveness Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Medication Effectiveness Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMedications.map((med) => (
                    <div key={med.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{med.name}</span>
                        <Badge variant="outline">{med.effectiveness}%</Badge>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${med.effectiveness}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Started:{" "}
                          {new Date(med.startDate).toLocaleDateString()}
                        </span>
                        <span>Adherence: {med.adherence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Lab Values Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLabResults.slice(0, 3).map((lab) => (
                    <div key={lab.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{lab.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(lab.status)}>
                            {lab.value} {lab.unit}
                          </Badge>
                          {lab.trend === "up" && (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          )}
                          {lab.trend === "down" && (
                            <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                          )}
                          {lab.trend === "stable" && (
                            <div className="w-4 h-1 bg-blue-500 rounded" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Target: {lab.normalRange} • Last updated: {lab.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Insights Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: "2024-01-28",
                    type: "optimization",
                    title: "Blood Pressure Trend Alert",
                    description:
                      "Systolic BP trending upward (138 mmHg). Consider lifestyle modifications or medication adjustment.",
                    confidence: 85,
                    action: "Monitor closely",
                  },
                  {
                    date: "2024-01-25",
                    type: "improvement",
                    title: "HbA1c Improvement Detected",
                    description:
                      "HbA1c decreased from 7.8% to 7.2%. Current treatment showing positive response.",
                    confidence: 92,
                    action: "Continue current regimen",
                  },
                  {
                    date: "2024-01-22",
                    type: "concern",
                    title: "Liver Enzyme Elevation",
                    description:
                      "ALT increased to 42 U/L. May be related to statin therapy. Enhanced monitoring recommended.",
                    confidence: 78,
                    action: "Schedule follow-up",
                  },
                  {
                    date: "2024-01-15",
                    type: "genetic",
                    title: "PGx Analysis Complete",
                    description:
                      "SLCO1B1*5 variant detected. Increased sensitivity to atorvastatin confirmed.",
                    confidence: 96,
                    action: "Consider medication switch",
                  },
                ].map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          insight.type === "improvement"
                            ? "bg-green-100"
                            : insight.type === "concern"
                              ? "bg-red-100"
                              : insight.type === "optimization"
                                ? "bg-yellow-100"
                                : "bg-purple-100"
                        }`}
                      >
                        {insight.type === "improvement" && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {insight.type === "concern" && (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        {insight.type === "optimization" && (
                          <Target className="w-5 h-5 text-yellow-600" />
                        )}
                        {insight.type === "genetic" && (
                          <Dna className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {insight.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.action}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Predictive Health Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      condition: "Cardiovascular Event",
                      risk: 12,
                      timeframe: "10 years",
                      confidence: 78,
                    },
                    {
                      condition: "Diabetic Complications",
                      risk: 8,
                      timeframe: "5 years",
                      confidence: 85,
                    },
                    {
                      condition: "Medication-Related ADE",
                      risk: 5,
                      timeframe: "1 year",
                      confidence: 71,
                    },
                  ].map((risk, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{risk.condition}</span>
                        <Badge
                          className={`${
                            risk.risk > 10
                              ? "bg-red-100 text-red-800"
                              : risk.risk > 5
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {risk.risk}% risk
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {risk.timeframe} • {risk.confidence}% confidence
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            risk.risk > 10
                              ? "bg-red-500"
                              : risk.risk > 5
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(risk.risk * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Treatment Success Predictors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      factor: "Medication Adherence",
                      impact: 92,
                      trend: "positive",
                    },
                    {
                      factor: "Lifestyle Modifications",
                      impact: 78,
                      trend: "positive",
                    },
                    {
                      factor: "Genetic Compatibility",
                      impact: 85,
                      trend: "positive",
                    },
                    {
                      factor: "Comorbidity Management",
                      impact: 67,
                      trend: "neutral",
                    },
                  ].map((factor, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {factor.impact}% impact
                          </Badge>
                          {factor.trend === "positive" && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          {factor.trend === "negative" && (
                            <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                          )}
                          {factor.trend === "neutral" && (
                            <div className="w-4 h-1 bg-blue-500 rounded" />
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Recommendation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">2</div>
                  <div className="text-sm text-muted-foreground">
                    High Priority Actions
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Requiring immediate attention
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    3
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Medium Priority Items
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    For optimization
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    87%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Confidence
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    High reliability
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
