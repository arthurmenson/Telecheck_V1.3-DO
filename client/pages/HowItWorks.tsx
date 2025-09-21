import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Brain,
  TestTube,
  Pill,
  Heart,
  Dna,
  ShoppingCart,
  MessageCircle,
  Activity,
  Upload,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Target,
  BarChart3,
  Eye,
  Stethoscope,
  Microscope,
  Cpu,
  Database,
  Lock,
  Wifi,
  Smartphone,
  Monitor,
  FileText,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Settings,
  Users,
  Globe,
  Layers,
  Code,
  Server,
  Cloud,
  ChevronRight,
  ChevronDown,
  Info,
  Star,
  Award,
  Lightbulb,
  Bell,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Workflow,
  Network,
  Gauge,
  Radar,
  Fingerprint,
  Key,
  UserCheck,
  Building,
  Headphones,
  Video,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  CreditCard,
  Truck,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

export function HowItWorks() {
  const [activeFeature, setActiveFeature] = useState("ai-lab-analysis");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const features = [
    {
      id: "ai-lab-analysis",
      title: "AI Lab Analysis",
      icon: TestTube,
      color: "bg-blue-500",
      description:
        "Upload lab reports and get instant AI-powered interpretation with personalized insights",
      complexity: "Advanced",
      accuracy: "94%",
      processingTime: "< 30 seconds",
      category: "Core AI",
    },
    {
      id: "medication-safety",
      title: "Medication Safety",
      icon: Pill,
      color: "bg-green-500",
      description:
        "Real-time drug interaction checking with pharmacogenomic-aware safety alerts",
      complexity: "Expert",
      accuracy: "98%",
      processingTime: "< 5 seconds",
      category: "Safety",
    },
    {
      id: "ai-chat",
      title: "AI Health Assistant",
      icon: Brain,
      color: "bg-purple-500",
      description:
        "Conversational AI that understands your complete health profile and medical history",
      complexity: "Advanced",
      accuracy: "91%",
      processingTime: "< 3 seconds",
      category: "AI Assistant",
    },
    {
      id: "predictive-analytics",
      title: "Predictive Analytics",
      icon: BarChart3,
      color: "bg-orange-500",
      description:
        "Machine learning models predict health risks and recommend preventive interventions",
      complexity: "Expert",
      accuracy: "87%",
      processingTime: "< 10 seconds",
      category: "Analytics",
    },
    {
      id: "pgx-integration",
      title: "PGx Integration",
      icon: Dna,
      color: "bg-pink-500",
      description:
        "Pharmacogenomic testing integration for personalized medication selection and dosing",
      complexity: "Expert",
      accuracy: "96%",
      processingTime: "< 15 seconds",
      category: "Genomics",
    },
    {
      id: "real-time-monitoring",
      title: "Real-time Monitoring",
      icon: Activity,
      color: "bg-red-500",
      description:
        "Continuous health monitoring with wearable integration and automated alerts",
      complexity: "Advanced",
      accuracy: "99%",
      processingTime: "Real-time",
      category: "Monitoring",
    },
    {
      id: "telemedicine",
      title: "Telemedicine",
      icon: Video,
      color: "bg-indigo-500",
      description:
        "Video consultations with healthcare providers and AI-assisted triage",
      complexity: "Advanced",
      accuracy: "95%",
      processingTime: "< 2 minutes",
      category: "Telehealth",
    },
    {
      id: "pharmacy-integration",
      title: "Pharmacy Hub",
      icon: ShoppingCart,
      color: "bg-cyan-500",
      description:
        "Seamless prescription management with delivery tracking and auto-refill",
      complexity: "Standard",
      accuracy: "99%",
      processingTime: "< 1 minute",
      category: "Pharmacy",
    },
  ];

  const workflowSteps = {
    "ai-lab-analysis": [
      {
        step: 1,
        title: "Document Upload",
        description: "Upload lab report (PDF, JPG, PNG)",
        details: [
          "Secure file upload with AES-256 encryption",
          "File validation and virus scanning",
          "HIPAA-compliant storage with audit trails",
          "Support for multiple formats and sizes",
        ],
        technology: "Multer + Sharp + Encryption",
        icon: Upload,
        duration: "2-5 seconds",
      },
      {
        step: 2,
        title: "OCR Processing",
        description: "Extract text and data from document",
        details: [
          "Advanced OCR with 94% accuracy",
          "Medical terminology recognition",
          "Table structure detection",
          "Handwriting recognition for physician notes",
        ],
        technology: "Tesseract.js + Medical NLP",
        icon: Eye,
        duration: "10-15 seconds",
      },
      {
        step: 3,
        title: "Data Parsing",
        description: "Structure and validate lab values",
        details: [
          "Medical entity recognition (NER)",
          "Reference range validation",
          "Unit standardization and conversion",
          "Quality control and error detection",
        ],
        technology: "Medical NER + Validation Engine",
        icon: Database,
        duration: "3-5 seconds",
      },
      {
        step: 4,
        title: "AI Analysis",
        description: "Generate insights and recommendations",
        details: [
          "Clinical correlation analysis",
          "Risk stratification algorithms",
          "Trend identification and prediction",
          "Personalized recommendations based on profile",
        ],
        technology: "Medical AI + Clinical Guidelines",
        icon: Brain,
        duration: "5-8 seconds",
      },
      {
        step: 5,
        title: "Report Generation",
        description: "Create comprehensive health report",
        details: [
          "Color-coded results with visual indicators",
          "Plain language explanations",
          "Action items with priority ranking",
          "Provider communication templates",
        ],
        technology: "Report Engine + Templates",
        icon: FileText,
        duration: "2-3 seconds",
      },
    ],
    "medication-safety": [
      {
        step: 1,
        title: "Medication Input",
        description: "Add current medications and supplements",
        details: [
          "Comprehensive drug database lookup",
          "Dosage validation and standardization",
          "Generic/brand name matching",
          "Supplement and OTC recognition",
        ],
        technology: "RxNorm + First Databank",
        icon: Pill,
        duration: "1-2 seconds",
      },
      {
        step: 2,
        title: "Interaction Analysis",
        description: "Check for drug-drug interactions",
        details: [
          "Clinical significance scoring (1-5 scale)",
          "Mechanism of interaction analysis",
          "Severity classification with evidence",
          "Time-dependent interaction detection",
        ],
        technology: "Clinical Decision Support Engine",
        icon: AlertTriangle,
        duration: "2-3 seconds",
      },
      {
        step: 3,
        title: "PGx Integration",
        description: "Apply pharmacogenomic data",
        details: [
          "Genetic variant analysis (CYP enzymes)",
          "Metabolizer phenotype prediction",
          "Drug efficacy and safety prediction",
          "Adverse reaction risk assessment",
        ],
        technology: "PharmGKB + CPIC Guidelines",
        icon: Dna,
        duration: "3-5 seconds",
      },
      {
        step: 4,
        title: "Safety Scoring",
        description: "Calculate overall medication safety",
        details: [
          "Multi-factor risk aggregation",
          "Priority ranking with clinical impact",
          "Evidence-based recommendations",
          "Alternative medication suggestions",
        ],
        technology: "Risk Assessment Algorithms",
        icon: Shield,
        duration: "1-2 seconds",
      },
      {
        step: 5,
        title: "Monitoring Plan",
        description: "Create personalized monitoring strategy",
        details: [
          "Lab monitoring schedule optimization",
          "Side effect tracking protocols",
          "Efficacy assessment timelines",
          "Dose optimization recommendations",
        ],
        technology: "Clinical Protocol Engine",
        icon: Calendar,
        duration: "2-3 seconds",
      },
    ],
    "ai-chat": [
      {
        step: 1,
        title: "Context Loading",
        description: "Load complete health profile",
        details: [
          "Lab results with historical trends",
          "Complete medication history",
          "Vital signs and wearable data",
          "Previous conversation context",
        ],
        technology: "Context Engine + Vector Database",
        icon: Database,
        duration: "0.5-1 seconds",
      },
      {
        step: 2,
        title: "Intent Recognition",
        description: "Understand user query and context",
        details: [
          "Natural language processing",
          "Medical intent classification",
          "Urgency and severity detection",
          "Context disambiguation",
        ],
        technology: "Medical NLP + Intent Classification",
        icon: Brain,
        duration: "1-2 seconds",
      },
      {
        step: 3,
        title: "Medical Reasoning",
        description: "Apply clinical knowledge and guidelines",
        details: [
          "Clinical correlation analysis",
          "Evidence-based medical reasoning",
          "Risk assessment and stratification",
          "Differential diagnosis consideration",
        ],
        technology: "Medical Knowledge Graph",
        icon: Stethoscope,
        duration: "2-3 seconds",
      },
      {
        step: 4,
        title: "Response Generation",
        description: "Create personalized, actionable response",
        details: [
          "Plain language medical translation",
          "Personalized recommendations",
          "Action item prioritization",
          "Follow-up suggestion generation",
        ],
        technology: "Medical LLM + Response Templates",
        icon: MessageCircle,
        duration: "1-2 seconds",
      },
      {
        step: 5,
        title: "Safety Validation",
        description: "Ensure medical safety and compliance",
        details: [
          "Medical disclaimer validation",
          "Emergency situation detection",
          "Scope limitation enforcement",
          "Provider escalation triggers",
        ],
        technology: "Safety Validation Engine",
        icon: Shield,
        duration: "0.5 seconds",
      },
    ],
    "predictive-analytics": [
      {
        step: 1,
        title: "Data Aggregation",
        description: "Collect multi-source health data",
        details: [
          "Lab result temporal patterns",
          "Vital signs trend analysis",
          "Medication adherence tracking",
          "Lifestyle and behavioral factors",
        ],
        technology: "Data Pipeline + ETL Processing",
        icon: Database,
        duration: "2-3 seconds",
      },
      {
        step: 2,
        title: "Feature Engineering",
        description: "Extract predictive features",
        details: [
          "Temporal pattern analysis",
          "Cross-metric correlation detection",
          "Risk factor identification",
          "Biomarker trend calculation",
        ],
        technology: "ML Feature Engineering Pipeline",
        icon: Settings,
        duration: "3-5 seconds",
      },
      {
        step: 3,
        title: "Model Inference",
        description: "Apply trained ML models",
        details: [
          "Cardiovascular risk prediction models",
          "Diabetes progression algorithms",
          "Medication response prediction",
          "Outcome forecasting models",
        ],
        technology: "TensorFlow + Medical ML Models",
        icon: Cpu,
        duration: "2-4 seconds",
      },
      {
        step: 4,
        title: "Risk Stratification",
        description: "Calculate personalized risk scores",
        details: [
          "Multi-factor risk score calculation",
          "Confidence interval estimation",
          "Time-to-event analysis",
          "Intervention impact modeling",
        ],
        technology: "Risk Assessment Algorithms",
        icon: Target,
        duration: "1-2 seconds",
      },
      {
        step: 5,
        title: "Intervention Planning",
        description: "Recommend preventive actions",
        details: [
          "Evidence-based intervention selection",
          "Cost-effectiveness analysis",
          "Timeline optimization",
          "Outcome tracking setup",
        ],
        technology: "Clinical Decision Support",
        icon: Lightbulb,
        duration: "2-3 seconds",
      },
    ],
    "pgx-integration": [
      {
        step: 1,
        title: "Genetic Data Import",
        description: "Import pharmacogenomic test results",
        details: [
          "Multiple format support (VCF, CSV, PDF)",
          "Variant validation and quality control",
          "Privacy protection and encryption",
          "Data integrity verification",
        ],
        technology: "Genomic Data Pipeline",
        icon: Upload,
        duration: "5-10 seconds",
      },
      {
        step: 2,
        title: "Variant Analysis",
        description: "Analyze genetic variants for drug metabolism",
        details: [
          "CYP enzyme variant analysis",
          "Drug transporter variants (SLCO1B1)",
          "Drug target genetic variants",
          "Metabolizer phenotype prediction",
        ],
        technology: "PGx Algorithms + PharmVar",
        icon: Dna,
        duration: "3-5 seconds",
      },
      {
        step: 3,
        title: "Drug Mapping",
        description: "Map medications to genetic variants",
        details: [
          "Drug-gene interaction database lookup",
          "Clinical annotation integration",
          "Evidence level grading (A, B, C, D)",
          "CPIC guideline integration",
        ],
        technology: "PharmGKB + CPIC Guidelines",
        icon: Pill,
        duration: "2-3 seconds",
      },
      {
        step: 4,
        title: "Clinical Translation",
        description: "Generate actionable recommendations",
        details: [
          "Dosing recommendation algorithms",
          "Alternative drug suggestions",
          "Monitoring requirement specification",
          "Contraindication alert generation",
        ],
        technology: "Clinical Decision Support",
        icon: Stethoscope,
        duration: "2-4 seconds",
      },
      {
        step: 5,
        title: "Provider Integration",
        description: "Integrate with clinical workflow",
        details: [
          "EHR system integration (Epic, Cerner)",
          "Clinical alert generation",
          "Provider notification system",
          "Outcome tracking and reporting",
        ],
        technology: "HL7 FHIR + Clinical Systems",
        icon: Users,
        duration: "1-2 seconds",
      },
    ],
    "real-time-monitoring": [
      {
        step: 1,
        title: "Device Connection",
        description: "Connect wearable devices and sensors",
        details: [
          "Multi-device support (Apple, Fitbit, etc.)",
          "Secure device pairing and authentication",
          "Data validation and quality checks",
          "Battery and connectivity monitoring",
        ],
        technology: "Device APIs + WebSocket",
        icon: Smartphone,
        duration: "10-30 seconds",
      },
      {
        step: 2,
        title: "Data Streaming",
        description: "Continuous health data collection",
        details: [
          "Real-time data ingestion pipeline",
          "Quality filtering and validation",
          "Anomaly detection algorithms",
          "Data compression and optimization",
        ],
        technology: "WebSocket + Stream Processing",
        icon: Wifi,
        duration: "Continuous",
      },
      {
        step: 3,
        title: "AI Monitoring",
        description: "Intelligent pattern recognition",
        details: [
          "Baseline establishment and learning",
          "Trend analysis and prediction",
          "Anomaly detection with ML",
          "Risk scoring and classification",
        ],
        technology: "ML Monitoring + Time Series",
        icon: Brain,
        duration: "Real-time",
      },
      {
        step: 4,
        title: "Alert Generation",
        description: "Automated health alerts and notifications",
        details: [
          "Severity classification (1-5 scale)",
          "Escalation protocol automation",
          "Provider notification system",
          "Emergency situation detection",
        ],
        technology: "Alert Engine + Protocols",
        icon: Bell,
        duration: "< 1 second",
      },
      {
        step: 5,
        title: "Response Coordination",
        description: "Coordinate care team response",
        details: [
          "Automated provider alerts",
          "Care plan updates and modifications",
          "Intervention tracking and logging",
          "Outcome measurement and reporting",
        ],
        technology: "Care Coordination Platform",
        icon: Users,
        duration: "1-5 minutes",
      },
    ],
    telemedicine: [
      {
        step: 1,
        title: "Provider Matching",
        description: "Find the right healthcare provider",
        details: [
          "Specialty-based provider search",
          "Availability and scheduling integration",
          "Insurance verification and coverage",
          "Provider rating and review system",
        ],
        technology: "Provider Network + Scheduling",
        icon: Users,
        duration: "30-60 seconds",
      },
      {
        step: 2,
        title: "Appointment Scheduling",
        description: "Book video or phone consultation",
        details: [
          "Real-time availability checking",
          "Calendar integration and sync",
          "Automated confirmation and reminders",
          "Rescheduling and cancellation handling",
        ],
        technology: "Scheduling Engine + Calendar APIs",
        icon: CalendarIcon,
        duration: "1-2 minutes",
      },
      {
        step: 3,
        title: "Pre-Consultation Prep",
        description: "Prepare for the consultation",
        details: [
          "Health data compilation and summary",
          "Question preparation assistance",
          "Technology setup and testing",
          "Insurance and payment processing",
        ],
        technology: "Data Aggregation + WebRTC",
        icon: FileText,
        duration: "5-10 minutes",
      },
      {
        step: 4,
        title: "Video Consultation",
        description: "Secure video consultation with provider",
        details: [
          "HIPAA-compliant video platform",
          "Screen sharing and annotation",
          "Real-time health data sharing",
          "Automated session recording (optional)",
        ],
        technology: "WebRTC + Encryption",
        icon: Video,
        duration: "15-45 minutes",
      },
      {
        step: 5,
        title: "Post-Consultation",
        description: "Follow-up and care coordination",
        details: [
          "Automated consultation summary",
          "Prescription and referral processing",
          "Follow-up appointment scheduling",
          "Care plan updates and tracking",
        ],
        technology: "Clinical Documentation + Workflow",
        icon: CheckCircle,
        duration: "2-5 minutes",
      },
    ],
    "pharmacy-integration": [
      {
        step: 1,
        title: "Prescription Processing",
        description: "Receive and validate prescriptions",
        details: [
          "Electronic prescription integration",
          "Insurance verification and coverage",
          "Drug availability and pricing",
          "Generic substitution options",
        ],
        technology: "e-Prescribing + Insurance APIs",
        icon: FileText,
        duration: "1-2 minutes",
      },
      {
        step: 2,
        title: "Safety Verification",
        description: "Comprehensive safety and interaction checking",
        details: [
          "Drug interaction screening",
          "Allergy and contraindication checks",
          "Dosage validation and adjustment",
          "PGx-guided medication selection",
        ],
        technology: "Clinical Decision Support",
        icon: Shield,
        duration: "30-60 seconds",
      },
      {
        step: 3,
        title: "Fulfillment Processing",
        description: "Prepare and package medications",
        details: [
          "Inventory management and allocation",
          "Quality control and verification",
          "Packaging and labeling automation",
          "Shipping and logistics coordination",
        ],
        technology: "Pharmacy Management System",
        icon: Package,
        duration: "2-4 hours",
      },
      {
        step: 4,
        title: "Delivery Tracking",
        description: "Track shipment and delivery",
        details: [
          "Real-time shipment tracking",
          "Delivery confirmation and signatures",
          "Temperature monitoring for sensitive meds",
          "Delivery attempt management",
        ],
        technology: "Logistics APIs + IoT Sensors",
        icon: Truck,
        duration: "1-3 days",
      },
      {
        step: 5,
        title: "Adherence Monitoring",
        description: "Monitor medication adherence",
        details: [
          "Refill reminder automation",
          "Adherence tracking and reporting",
          "Side effect monitoring",
          "Outcome measurement and optimization",
        ],
        technology: "Adherence Platform + Analytics",
        icon: Calendar,
        duration: "Ongoing",
      },
    ],
  };

  const technicalSpecs = {
    "ai-lab-analysis": {
      aiModels: [
        "Medical NER (BioBERT)",
        "Clinical Classification",
        "Risk Assessment (Random Forest)",
        "Trend Analysis (LSTM)",
      ],
      dataProcessing:
        "OCR → Medical NLP → Clinical Correlation → Risk Stratification → Report Generation",
      accuracy:
        "94% text extraction, 96% value identification, 92% clinical correlation",
      compliance: "HIPAA, SOC 2 Type II, FDA 510(k) pathway, CLIA-waived",
      integration: "HL7 FHIR R4, Epic MyChart, Cerner PowerChart, Allscripts",
      security: "AES-256 encryption, Zero-trust architecture, Audit logging",
    },
    "medication-safety": {
      aiModels: [
        "Drug Interaction AI",
        "PGx Analysis Engine",
        "Clinical Decision Support",
        "Risk Prediction",
      ],
      dataProcessing:
        "Drug Lookup → Interaction Analysis → PGx Correlation → Risk Scoring → Recommendation Engine",
      accuracy:
        "98% interaction detection, 96% PGx correlation, 94% clinical relevance",
      compliance: "FDA Orange Book, CPIC Guidelines, PharmGKB Level A evidence",
      integration: "RxNorm, NDC Database, First Databank, Lexicomp, Micromedex",
      security: "Encrypted drug databases, Secure API endpoints, Audit trails",
    },
    "ai-chat": {
      aiModels: [
        "Medical LLM (GPT-4 Medical)",
        "Intent Classification",
        "Context Understanding",
        "Safety Validation",
      ],
      dataProcessing:
        "Context Loading → Intent Recognition → Medical Reasoning → Response Generation → Safety Check",
      accuracy:
        "91% intent recognition, 89% medical accuracy, 96% safety validation",
      compliance:
        "Medical disclaimer automation, Emergency detection, Scope limitation",
      integration:
        "EHR systems, Provider networks, Emergency services, Telehealth platforms",
      security: "End-to-end encryption, Session management, Privacy controls",
    },
    "predictive-analytics": {
      aiModels: [
        "Cardiovascular Risk (Cox Regression)",
        "Diabetes Progression (XGBoost)",
        "Medication Response (Neural Networks)",
      ],
      dataProcessing:
        "Feature Engineering → Model Ensemble → Risk Stratification → Intervention Planning → Outcome Prediction",
      accuracy:
        "87% risk prediction, 82% intervention success, 79% outcome accuracy",
      compliance:
        "Clinical validation studies, Outcome tracking, Quality metrics, FDA guidance",
      integration:
        "Population health databases, Clinical registries, Research networks",
      security: "Federated learning, Differential privacy, Secure aggregation",
    },
    "pgx-integration": {
      aiModels: [
        "Variant Analysis",
        "Phenotype Prediction",
        "Drug Response Modeling",
        "Clinical Translation",
      ],
      dataProcessing:
        "Genetic Data Import → Variant Analysis → Drug Mapping → Clinical Translation → Provider Integration",
      accuracy:
        "96% variant calling, 94% phenotype prediction, 91% clinical translation",
      compliance:
        "CLIA certification, CAP accreditation, CPIC Guidelines, FDA recommendations",
      integration:
        "Genomic laboratories, EHR systems, Clinical decision support, Pharmacy systems",
      security:
        "Genetic data encryption, Access controls, Audit logging, Privacy protection",
    },
    "real-time-monitoring": {
      aiModels: [
        "Anomaly Detection (Isolation Forest)",
        "Trend Analysis (ARIMA)",
        "Risk Scoring (Ensemble)",
        "Alert Classification",
      ],
      dataProcessing:
        "Device Data → Quality Filtering → AI Analysis → Alert Generation → Response Coordination",
      accuracy: "99% data accuracy, 95% anomaly detection, 93% alert relevance",
      compliance:
        "FDA medical device regulations, HIPAA, Real-time data protection",
      integration:
        "Apple Health, Google Fit, Fitbit, Medical devices, EHR systems",
      security:
        "Device authentication, Encrypted streaming, Secure storage, Access controls",
    },
    telemedicine: {
      aiModels: [
        "Triage AI",
        "Symptom Assessment",
        "Provider Matching",
        "Clinical Documentation",
      ],
      dataProcessing:
        "Symptom Input → Triage Analysis → Provider Matching → Consultation → Documentation",
      accuracy:
        "95% triage accuracy, 92% provider matching, 89% documentation quality",
      compliance:
        "Telehealth regulations, State licensing, HIPAA, Provider credentialing",
      integration:
        "Provider networks, Scheduling systems, EHR platforms, Payment processing",
      security:
        "End-to-end encryption, Secure video, Identity verification, Session recording",
    },
    "pharmacy-integration": {
      aiModels: [
        "Inventory Optimization",
        "Delivery Routing",
        "Adherence Prediction",
        "Quality Control",
      ],
      dataProcessing:
        "Prescription → Safety Check → Fulfillment → Delivery → Adherence Monitoring",
      accuracy:
        "99% prescription accuracy, 97% delivery success, 94% adherence prediction",
      compliance: "DEA regulations, State pharmacy laws, USP standards, HIPAA",
      integration:
        "Pharmacy networks, Insurance systems, Delivery services, EHR platforms",
      security:
        "Prescription encryption, Secure logistics, Identity verification, Audit trails",
    },
  };

  const demoData = {
    "ai-lab-analysis": {
      sampleInput: "Comprehensive_Metabolic_Panel_2024.pdf",
      processingSteps: [
        { name: "File Upload", progress: 100, status: "complete" },
        { name: "OCR Processing", progress: 100, status: "complete" },
        { name: "Data Extraction", progress: 100, status: "complete" },
        { name: "AI Analysis", progress: 85, status: "processing" },
        { name: "Report Generation", progress: 0, status: "pending" },
      ],
      extractedData: [
        {
          test: "Glucose",
          value: 95,
          unit: "mg/dL",
          status: "normal",
          confidence: 98,
        },
        {
          test: "Total Cholesterol",
          value: 205,
          unit: "mg/dL",
          status: "borderline",
          confidence: 96,
        },
        {
          test: "HDL Cholesterol",
          value: 58,
          unit: "mg/dL",
          status: "normal",
          confidence: 97,
        },
        {
          test: "LDL Cholesterol",
          value: 135,
          unit: "mg/dL",
          status: "high",
          confidence: 95,
        },
      ],
    },
  };

  const architectureComponents = [
    {
      layer: "Frontend",
      components: [
        "React SPA",
        "Real-time Dashboard",
        "WebSocket Client",
        "Progressive Web App",
      ],
      technologies: ["React 18", "TypeScript", "Tailwind CSS", "WebSocket API"],
      icon: Monitor,
    },
    {
      layer: "API Gateway",
      components: [
        "Authentication",
        "Rate Limiting",
        "Request Routing",
        "Response Caching",
      ],
      technologies: ["Express.js", "JWT", "Redis", "Load Balancer"],
      icon: Globe,
    },
    {
      layer: "AI Services",
      components: [
        "Medical NLP",
        "Image Analysis",
        "Predictive Models",
        "Clinical Decision Support",
      ],
      technologies: ["TensorFlow", "PyTorch", "Hugging Face", "OpenAI API"],
      icon: Brain,
    },
    {
      layer: "Data Layer",
      components: [
        "Health Records",
        "Medical Images",
        "Genomic Data",
        "Real-time Streams",
      ],
      technologies: ["PostgreSQL", "MongoDB", "Redis", "Apache Kafka"],
      icon: Database,
    },
    {
      layer: "Security",
      components: [
        "Encryption",
        "Access Control",
        "Audit Logging",
        "Compliance",
      ],
      technologies: ["AES-256", "OAuth 2.0", "RBAC", "HIPAA Controls"],
      icon: Shield,
    },
    {
      layer: "Infrastructure",
      components: [
        "Container Orchestration",
        "Auto Scaling",
        "Monitoring",
        "Backup",
      ],
      technologies: ["Docker", "Kubernetes", "Prometheus", "AWS/Azure"],
      icon: Cloud,
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setDemoStep((prev) => {
          const maxSteps =
            workflowSteps[activeFeature as keyof typeof workflowSteps]
              ?.length || 5;
          return prev >= maxSteps - 1 ? 0 : prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeFeature]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Expert":
        return "bg-red-100 text-red-800 border-red-200";
      case "Advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Core AI": "bg-purple-100 text-purple-800",
      Safety: "bg-green-100 text-green-800",
      "AI Assistant": "bg-blue-100 text-blue-800",
      Analytics: "bg-orange-100 text-orange-800",
      Genomics: "bg-pink-100 text-pink-800",
      Monitoring: "bg-red-100 text-red-800",
      Telehealth: "bg-indigo-100 text-indigo-800",
      Pharmacy: "bg-cyan-100 text-cyan-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const currentSteps =
    workflowSteps[activeFeature as keyof typeof workflowSteps] || [];
  const currentSpecs =
    technicalSpecs[activeFeature as keyof typeof technicalSpecs];

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
              <Workflow className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How Telecheck Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the advanced AI and medical technology powering your
            personalized healthcare experience
          </p>
        </div>

        {/* Feature Selection */}
        <Card className="mb-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              Explore Our Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover-lift ${
                      activeFeature === feature.id
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border/20 glass-morphism hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">
                          {feature.title}
                        </h3>
                        <Badge
                          className={getCategoryColor(feature.category)}
                          variant="secondary"
                        >
                          {feature.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge className={getComplexityColor(feature.complexity)}>
                        {feature.complexity}
                      </Badge>
                      <span className="text-muted-foreground">
                        {feature.accuracy}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 glass-morphism">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="glass-morphism border border-border/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center">
                      {React.createElement(
                        features.find((f) => f.id === activeFeature)?.icon ||
                          TestTube,
                        {
                          className: "w-6 h-6 text-primary mr-2",
                        },
                      )}
                      {features.find((f) => f.id === activeFeature)?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {
                          features.find((f) => f.id === activeFeature)
                            ?.description
                        }
                      </p>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="glass-morphism p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-foreground mb-1">
                            {
                              features.find((f) => f.id === activeFeature)
                                ?.accuracy
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Accuracy
                          </div>
                        </div>
                        <div className="glass-morphism p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-foreground mb-1">
                            {
                              features.find((f) => f.id === activeFeature)
                                ?.processingTime
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Processing
                          </div>
                        </div>
                        <div className="glass-morphism p-4 rounded-xl text-center">
                          <Badge
                            className={getComplexityColor(
                              features.find((f) => f.id === activeFeature)
                                ?.complexity || "Standard",
                            )}
                          >
                            {
                              features.find((f) => f.id === activeFeature)
                                ?.complexity
                            }
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Complexity
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          className="gradient-bg text-white border-0 hover-lift"
                          asChild
                        >
                          <Link to={`/${activeFeature.replace("-", "")}`}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Try Feature
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTab("workflow")}
                        >
                          <Workflow className="w-4 h-4 mr-2" />
                          View Workflow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-morphism border border-border/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground">
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-foreground">
                          HIPAA Compliant
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-foreground">
                          Real-time Processing
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-foreground">
                          Clinical Grade AI
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-foreground">
                          Provider Integration
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-foreground">
                          24/7 Availability
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border border-border/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground">
                      Use Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span>Routine health monitoring and optimization</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span>Chronic disease management</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span>Medication safety and optimization</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span>Preventive care and risk reduction</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground">
                    Interactive Workflow Demo
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDemoStep(0)}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between">
                    {currentSteps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            index <= demoStep
                              ? "bg-primary border-primary text-white"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {index < demoStep ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : index === demoStep ? (
                            <Timer className="w-5 h-5 animate-pulse" />
                          ) : (
                            <span className="text-sm font-medium">
                              {step.step}
                            </span>
                          )}
                        </div>
                        {index < currentSteps.length - 1 && (
                          <div
                            className={`w-16 h-0.5 mx-2 transition-all duration-500 ${
                              index < demoStep ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Current Step Details */}
                  {currentSteps[demoStep] && (
                    <div className="glass-morphism p-6 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                          {React.createElement(currentSteps[demoStep].icon, {
                            className: "w-6 h-6 text-white",
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              Step {currentSteps[demoStep].step}:{" "}
                              {currentSteps[demoStep].title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {currentSteps[demoStep].duration}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            {currentSteps[demoStep].description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Process Details
                              </h4>
                              <ul className="space-y-1">
                                {currentSteps[demoStep].details.map(
                                  (detail, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-muted-foreground flex items-start space-x-2"
                                    >
                                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{detail}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Technology Stack
                              </h4>
                              <div className="glass-morphism p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Code className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-foreground font-mono">
                                    {currentSteps[demoStep].technology}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Steps Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {currentSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => setDemoStep(index)}
                          className={`p-4 rounded-xl border transition-all duration-300 text-left hover-lift ${
                            index === demoStep
                              ? "border-primary bg-primary/5"
                              : "border-border/20 glass-morphism hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              Step {step.step}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground text-sm mb-1">
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical">
            {currentSpecs && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-morphism border border-border/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground">
                      AI Models & Algorithms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentSpecs.aiModels.map((model, index) => (
                        <div
                          key={index}
                          className="glass-morphism p-4 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {model}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Production-ready AI model
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border border-border/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-foreground">
                      Technical Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Workflow className="w-4 h-4 text-primary mr-2" />
                          Data Processing Pipeline
                        </h4>
                        <div className="glass-morphism p-3 rounded-lg">
                          <code className="text-xs text-foreground font-mono">
                            {currentSpecs.dataProcessing}
                          </code>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Target className="w-4 h-4 text-primary mr-2" />
                          Accuracy Metrics
                        </h4>
                        <div className="glass-morphism p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {currentSpecs.accuracy}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Shield className="w-4 h-4 text-primary mr-2" />
                          Compliance & Standards
                        </h4>
                        <div className="glass-morphism p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {currentSpecs.compliance}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Network className="w-4 h-4 text-primary mr-2" />
                          Integration Capabilities
                        </h4>
                        <div className="glass-morphism p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {currentSpecs.integration}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <Lock className="w-4 h-4 text-primary mr-2" />
                          Security Features
                        </h4>
                        <div className="glass-morphism p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {currentSpecs.security}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Platform Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Architecture Diagram */}
                  <div className="glass-morphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
                      Telecheck AI Healthcare Platform Architecture
                    </h3>
                    <div className="space-y-6">
                      {architectureComponents.map((layer, index) => {
                        const Icon = layer.icon;
                        return (
                          <div key={index} className="relative">
                            <div className="flex items-center space-x-4 p-4 glass-morphism rounded-xl border border-border/10">
                              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {layer.layer}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {layer.components.map(
                                    (component, compIndex) => (
                                      <Badge
                                        key={compIndex}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {component}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {layer.technologies.map((tech, techIndex) => (
                                    <Badge
                                      key={techIndex}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {index < architectureComponents.length - 1 && (
                              <div className="flex justify-center my-2">
                                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security & Compliance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-morphism border border-border/20">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground flex items-center">
                          <Shield className="w-5 h-5 text-primary mr-2" />
                          Security Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Lock className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              AES-256 Encryption
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Key className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              Zero-Trust Architecture
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              Multi-Factor Authentication
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Fingerprint className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              Biometric Access Control
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Eye className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              Comprehensive Audit Logging
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-morphism border border-border/20">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-foreground flex items-center">
                          <Award className="w-5 h-5 text-primary mr-2" />
                          Compliance Standards
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              HIPAA Compliant
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              SOC 2 Type II
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              FDA 510(k) Pathway
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              HL7 FHIR R4
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              GDPR Compliant
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Interactive Demo Section */}
        <Card className="mt-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <PlayCircle className="w-6 h-6 text-primary mr-2" />
              Try Our Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="h-auto p-4 glass-morphism hover:shadow-lg"
                variant="outline"
                asChild
              >
                <Link
                  to="/labs"
                  className="flex flex-col items-center space-y-2"
                >
                  <TestTube className="w-8 h-8 text-blue-500" />
                  <span className="font-medium">Upload Lab Report</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Experience AI lab analysis
                  </span>
                </Link>
              </Button>

              <Button
                className="h-auto p-4 glass-morphism hover:shadow-lg"
                variant="outline"
                asChild
              >
                <Link
                  to="/chat"
                  className="flex flex-col items-center space-y-2"
                >
                  <Brain className="w-8 h-8 text-purple-500" />
                  <span className="font-medium">AI Health Chat</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Talk to our AI assistant
                  </span>
                </Link>
              </Button>

              <Button
                className="h-auto p-4 glass-morphism hover:shadow-lg"
                variant="outline"
                asChild
              >
                <Link
                  to="/dashboard"
                  className="flex flex-col items-center space-y-2"
                >
                  <Activity className="w-8 h-8 text-red-500" />
                  <span className="font-medium">Real-time Monitor</span>
                  <span className="text-xs text-muted-foreground text-center">
                    See live health tracking
                  </span>
                </Link>
              </Button>

              <Button
                className="h-auto p-4 glass-morphism hover:shadow-lg"
                variant="outline"
                asChild
              >
                <Link
                  to="/ai-insights"
                  className="flex flex-col items-center space-y-2"
                >
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                  <span className="font-medium">AI Insights</span>
                  <span className="text-xs text-muted-foreground text-center">
                    View predictive analytics
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="accuracy">
                <AccordionTrigger className="text-left">
                  How accurate is the AI analysis?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Our AI models achieve 94% accuracy for lab analysis, 98% for
                    drug interactions, and 91% for health insights. All models
                    are continuously validated against clinical outcomes and
                    updated with the latest medical research.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger className="text-left">
                  How is my health data protected?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    We use bank-level AES-256 encryption, zero-trust
                    architecture, and comprehensive audit logging. All data is
                    HIPAA-compliant with SOC 2 Type II certification. Your data
                    is never shared without explicit consent.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="integration">
                <AccordionTrigger className="text-left">
                  Does it integrate with my existing healthcare providers?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! We support HL7 FHIR R4 standards and integrate with
                    major EHR systems including Epic, Cerner, and Allscripts.
                    You can easily share insights with your healthcare team and
                    import existing health records.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="devices">
                <AccordionTrigger className="text-left">
                  What devices and wearables are supported?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    We support Apple Health, Google Fit, Fitbit, continuous
                    glucose monitors, blood pressure monitors, smart scales, and
                    most FDA-approved medical devices. New device integrations
                    are added regularly.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="emergency">
                <AccordionTrigger className="text-left">
                  What happens in medical emergencies?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Our AI automatically detects emergency situations and
                    provides immediate guidance to call 911 or seek emergency
                    care. We also have 24/7 triage capabilities and can connect
                    you with emergency healthcare providers when needed.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
