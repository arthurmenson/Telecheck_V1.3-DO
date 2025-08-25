import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clipboard,
  Users,
  Calendar,
  Clock,
  Target,
  CreditCard,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  FileText,
  Activity,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Star,
  Heart,
  Brain,
  Pill,
  Stethoscope,
  Upload,
  Save,
  Timer,
  PlayCircle,
  PauseCircle,
  StopCircle,
  BarChart3,
  PieChart,
  LineChart,
  Mail,
  Video,
  MessageCircle,
  AlertCircle,
  Zap,
  Shield,
  Award,
  Bookmark,
} from "lucide-react";

export function CCMWorkflow() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [encounterTimer, setEncounterTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showNewEncounterDialog, setShowNewEncounterDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [encounterNotes, setEncounterNotes] = useState("");

  // Enhanced CCM patient data
  const ccmPatients = [
    {
      id: "CCM-001",
      name: "Margaret Thompson",
      age: 67,
      mrn: "MRN-78901234",
      phone: "(555) 123-4567",
      email: "margaret.t@email.com",
      conditions: ["Diabetes Type 2", "Hypertension", "Obesity", "Sleep Apnea"],
      enrollmentDate: "2024-01-15",
      lastEncounter: "2024-01-28",
      nextEncounter: "2024-02-15",
      careGoals: [
        {
          id: 1,
          goal: "HbA1c < 7%",
          status: "in_progress",
          target: "7.0",
          current: "7.8",
          dueDate: "2024-03-01",
        },
        {
          id: 2,
          goal: "Blood Pressure < 130/80",
          status: "completed",
          target: "130/80",
          current: "125/78",
          dueDate: "2024-02-15",
        },
        {
          id: 3,
          goal: "Weight loss 10 lbs",
          status: "in_progress",
          target: "180",
          current: "188",
          dueDate: "2024-04-01",
        },
        {
          id: 4,
          goal: "Daily medication adherence",
          status: "completed",
          target: "100%",
          current: "98%",
          dueDate: "ongoing",
        },
      ],
      billingStatus: "eligible",
      minutesThisMonth: 45,
      totalMinutesYear: 380,
      provider: "Dr. Sarah Johnson",
      riskLevel: "medium",
      riskFactors: ["Uncontrolled diabetes", "Medication non-adherence"],
      medications: ["Metformin 1000mg", "Lisinopril 10mg", "Atorvastatin 20mg"],
      allergies: ["Penicillin", "Shellfish"],
      emergencyContact: "John Thompson (Son) - (555) 987-6543",
      insuranceInfo: "Medicare Advantage - Anthem",
      recentVitals: {
        bloodPressure: "135/85",
        weight: "188 lbs",
        glucose: "165 mg/dL",
        date: "2024-01-28",
      },
      encounters: [
        {
          date: "2024-01-28",
          type: "Monthly Check-in",
          duration: 25,
          provider: "Dr. Johnson",
          notes: "BP improving, glucose still elevated",
        },
        {
          date: "2024-01-15",
          type: "Initial Enrollment",
          duration: 45,
          provider: "Dr. Johnson",
          notes: "Comprehensive assessment completed",
        },
      ],
      alerts: [
        {
          type: "medication",
          message: "Missed metformin dose - 2 days ago",
          priority: "medium",
        },
        {
          type: "vital",
          message: "Blood glucose trending up",
          priority: "high",
        },
      ],
    },
    {
      id: "CCM-002",
      name: "Robert Chen",
      age: 72,
      mrn: "MRN-78901235",
      phone: "(555) 234-5678",
      email: "robert.c@email.com",
      conditions: ["CHF", "Diabetes", "CKD", "COPD"],
      enrollmentDate: "2023-11-20",
      lastEncounter: "2024-01-30",
      nextEncounter: "2024-02-18",
      careGoals: [
        {
          id: 1,
          goal: "Fluid management < 2L/day",
          status: "completed",
          target: "2L",
          current: "1.8L",
          dueDate: "ongoing",
        },
        {
          id: 2,
          goal: "Exercise 3x/week",
          status: "in_progress",
          target: "3",
          current: "2",
          dueDate: "ongoing",
        },
        {
          id: 3,
          goal: "Medication adherence > 95%",
          status: "completed",
          target: "95%",
          current: "97%",
          dueDate: "ongoing",
        },
        {
          id: 4,
          goal: "Weight stability ±2 lbs",
          status: "completed",
          target: "±2",
          current: "+1",
          dueDate: "ongoing",
        },
        {
          id: 5,
          goal: "HbA1c < 7.5%",
          status: "in_progress",
          target: "7.5%",
          current: "7.2%",
          dueDate: "2024-03-15",
        },
        {
          id: 6,
          goal: "Smoking cessation",
          status: "completed",
          target: "0",
          current: "0",
          dueDate: "completed",
        },
      ],
      billingStatus: "completed",
      minutesThisMonth: 62,
      totalMinutesYear: 485,
      provider: "Dr. Michael Brown",
      riskLevel: "high",
      riskFactors: [
        "Multiple comorbidities",
        "Recent hospitalization",
        "Advanced age",
      ],
      medications: [
        "Furosemide 40mg",
        "Carvedilol 25mg",
        "Insulin Glargine",
        "Albuterol",
      ],
      allergies: ["Sulfa drugs"],
      emergencyContact: "Lisa Chen (Daughter) - (555) 876-5432",
      insuranceInfo: "Medicare Parts A & B",
      recentVitals: {
        bloodPressure: "118/72",
        weight: "175 lbs",
        glucose: "142 mg/dL",
        date: "2024-01-30",
      },
      encounters: [
        {
          date: "2024-01-30",
          type: "Complex CCM",
          duration: 62,
          provider: "Dr. Brown",
          notes: "Comprehensive care plan review, medication adjustments",
        },
        {
          date: "2024-01-15",
          type: "Follow-up",
          duration: 35,
          provider: "Dr. Brown",
          notes: "Stable condition, continue current management",
        },
      ],
      alerts: [],
    },
    {
      id: "CCM-003",
      name: "Linda Martinez",
      age: 58,
      mrn: "MRN-78901236",
      phone: "(555) 345-6789",
      email: "linda.m@email.com",
      conditions: ["Diabetes Type 2", "Hypertension"],
      enrollmentDate: "2024-01-10",
      lastEncounter: "2024-02-01",
      nextEncounter: "2024-02-20",
      careGoals: [
        {
          id: 1,
          goal: "HbA1c < 6.5%",
          status: "in_progress",
          target: "6.5%",
          current: "8.2%",
          dueDate: "2024-05-01",
        },
        {
          id: 2,
          goal: "Daily glucose monitoring",
          status: "in_progress",
          target: "2x/day",
          current: "1x/day",
          dueDate: "ongoing",
        },
        {
          id: 3,
          goal: "Nutrition counseling compliance",
          status: "at_risk",
          target: "100%",
          current: "60%",
          dueDate: "2024-03-01",
        },
      ],
      billingStatus: "pending",
      minutesThisMonth: 28,
      totalMinutesYear: 85,
      provider: "Dr. Sarah Johnson",
      riskLevel: "low",
      riskFactors: ["New diagnosis", "Learning curve"],
      medications: ["Metformin 500mg", "Amlodipine 5mg"],
      allergies: ["None known"],
      emergencyContact: "Carlos Martinez (Spouse) - (555) 765-4321",
      insuranceInfo: "BlueCross BlueShield",
      recentVitals: {
        bloodPressure: "142/88",
        weight: "165 lbs",
        glucose: "195 mg/dL",
        date: "2024-02-01",
      },
      encounters: [
        {
          date: "2024-02-01",
          type: "Initial Assessment",
          duration: 28,
          provider: "Dr. Johnson",
          notes: "Baseline assessment, education provided",
        },
      ],
      alerts: [
        {
          type: "education",
          message: "Missed nutrition appointment",
          priority: "low",
        },
      ],
    },
  ];

  const monthlyStats = {
    totalPatients: 347,
    activeEncounters: 89,
    completedBilling: 234,
    revenue: 15678,
    avgMinutesPerPatient: 42,
    goalCompletionRate: 73,
    highRiskPatients: 45,
    newEnrollments: 12,
    outcomesMet: 156,
    satisfactionScore: 4.8,
  };

  const billingCodes = [
    {
      code: "99490",
      description: "CCM services; first 20 minutes",
      rate: "$42.60",
      used: 156,
      revenue: 6646,
    },
    {
      code: "99491",
      description: "CCM services; each additional 20 minutes",
      rate: "$36.38",
      used: 89,
      revenue: 3238,
    },
    {
      code: "99487",
      description: "Complex CCM; first 60 minutes",
      rate: "$95.52",
      used: 23,
      revenue: 2197,
    },
    {
      code: "99489",
      description: "Complex CCM; each additional 30 minutes",
      rate: "$50.16",
      used: 12,
      revenue: 602,
    },
  ];

  const upcomingEncounters = [
    {
      patient: "Margaret Thompson",
      time: "2:00 PM",
      type: "Monthly Check-in",
      duration: "20 min",
      patientId: "CCM-001",
      priority: "medium",
      notes: "Follow-up on medication adherence",
    },
    {
      patient: "Robert Chen",
      time: "3:30 PM",
      type: "Complex Care Review",
      duration: "45 min",
      patientId: "CCM-002",
      priority: "high",
      notes: "Comprehensive care plan assessment",
    },
    {
      patient: "Linda Martinez",
      time: "4:15 PM",
      type: "Goal Assessment",
      duration: "20 min",
      patientId: "CCM-003",
      priority: "low",
      notes: "Review glucose monitoring progress",
    },
  ];

  const getFilteredPatients = () => {
    let filtered = ccmPatients;

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.conditions.some((condition) =>
            condition.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (patient) => patient.billingStatus === filterStatus,
      );
    }

    if (filterRisk !== "all") {
      filtered = filtered.filter((patient) => patient.riskLevel === filterRisk);
    }

    return filtered;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "eligible":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "at_risk":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const startEncounter = (patientId: string, encounterType: string) => {
    setActiveEncounter({ patientId, encounterType, startTime: new Date() });
    setIsTimerRunning(true);
    setEncounterTimer(0);
  };

  const endEncounter = () => {
    setActiveEncounter(null);
    setIsTimerRunning(false);
    setEncounterTimer(0);
    setEncounterNotes("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer effect would go here in a real implementation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setEncounterTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Active Encounter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Clipboard className="w-8 h-8 text-primary" />
              Chronic Care Management
            </h1>
            <p className="text-muted-foreground">
              Comprehensive CCM workflow with CMS billing integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeEncounter && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-600" />
                      <span className="font-mono text-lg font-bold text-blue-800">
                        {formatTime(encounterTimer)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Active Encounter</p>
                      <p className="text-muted-foreground">
                        {activeEncounter.encounterType}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                      >
                        {isTimerRunning ? (
                          <PauseCircle className="w-4 h-4" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={endEncounter}
                      >
                        <StopCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog
              open={showNewEncounterDialog}
              onOpenChange={setShowNewEncounterDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Encounter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New CCM Encounter</DialogTitle>
                  <DialogDescription>
                    Select a patient and encounter type to begin a new CCM
                    session.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ccmPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Encounter Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select encounter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          Monthly Check-in (20 min)
                        </SelectItem>
                        <SelectItem value="complex">
                          Complex CCM (60 min)
                        </SelectItem>
                        <SelectItem value="followup">
                          Follow-up (15 min)
                        </SelectItem>
                        <SelectItem value="assessment">
                          Care Plan Assessment (30 min)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewEncounterDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      startEncounter("CCM-001", "Monthly Check-in");
                      setShowNewEncounterDialog(false);
                    }}
                  >
                    Start Encounter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Monthly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold">
                    {monthlyStats.totalPatients}
                  </p>
                  <p className="text-xs text-green-600">
                    +{monthlyStats.newEnrollments} new
                  </p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Encounters
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {monthlyStats.activeEncounters}
                  </p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${monthlyStats.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">+12% vs last month</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Goal Completion
                  </p>
                  <p className="text-2xl font-bold">
                    {monthlyStats.goalCompletionRate}%
                  </p>
                  <Progress
                    value={monthlyStats.goalCompletionRate}
                    className="mt-1"
                  />
                </div>
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {monthlyStats.highRiskPatients}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule with Enhanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's CCM Encounters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEncounters.map((encounter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{encounter.time}</span>
                    </div>
                    <div>
                      <p className="font-medium">{encounter.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {encounter.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {encounter.notes}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={getPriorityColor(encounter.priority)}
                    >
                      {encounter.priority}
                    </Badge>
                    <Badge variant="outline">{encounter.duration}</Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          startEncounter(encounter.patientId, encounter.type)
                        }
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Patient Registry</TabsTrigger>
            <TabsTrigger value="encounters">Encounters</TabsTrigger>
            <TabsTrigger value="goals">Goals & Outcomes</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Enhanced Patient Registry */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>CCM Patient Registry</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients, MRN, conditions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Billing Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="eligible">Eligible</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterRisk} onValueChange={setFilterRisk}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll Patient
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredPatients().map((patient) => (
                    <div
                      key={patient.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {patient.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {patient.id} • {patient.mrn} • Age {patient.age}{" "}
                                • Provider: {patient.provider}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {patient.phone} • {patient.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getRiskLevelColor(patient.riskLevel)}
                              >
                                {patient.riskLevel} risk
                              </Badge>
                              <Badge
                                className={getBillingStatusColor(
                                  patient.billingStatus,
                                )}
                              >
                                {patient.billingStatus}
                              </Badge>
                              {patient.alerts && patient.alerts.length > 0 && (
                                <Badge variant="destructive">
                                  {patient.alerts.length} alerts
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setExpandedPatient(
                                  expandedPatient === patient.id
                                    ? null
                                    : patient.id,
                                )
                              }
                            >
                              {expandedPatient === patient.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Conditions</p>
                            <div className="space-y-1">
                              {patient.conditions
                                .slice(0, 3)
                                .map((condition, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs mr-1 mb-1"
                                  >
                                    {condition}
                                  </Badge>
                                ))}
                              {patient.conditions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{patient.conditions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Care Goals Progress
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  (patient.careGoals.filter(
                                    (g) => g.status === "completed",
                                  ).length /
                                    patient.careGoals.length) *
                                  100
                                }
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {
                                  patient.careGoals.filter(
                                    (g) => g.status === "completed",
                                  ).length
                                }
                                /{patient.careGoals.length}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">This Month</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Minutes:</span>
                                <span className="font-medium">
                                  {patient.minutesThisMonth}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Last encounter:</span>
                                <span>
                                  {new Date(
                                    patient.lastEncounter,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Quick Actions</p>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Call Patient"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Send Message"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="View Chart"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Video Call"
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        {patient.alerts && patient.alerts.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">
                              Active Alerts
                            </p>
                            <div className="space-y-2">
                              {patient.alerts.map((alert, idx) => (
                                <Alert
                                  key={idx}
                                  className={`${getPriorityColor(alert.priority)} border`}
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    <span className="font-medium capitalize">
                                      {alert.type}:
                                    </span>{" "}
                                    {alert.message}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Patient Details */}
                      {expandedPatient === patient.id && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Medications & Allergies */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Pill className="w-4 h-4" />
                                  Current Medications
                                </h4>
                                <div className="space-y-1">
                                  {patient.medications.map((med, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs block w-fit mb-1"
                                    >
                                      {med}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  Allergies
                                </h4>
                                <div className="space-y-1">
                                  {patient.allergies.map((allergy, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="destructive"
                                      className="text-xs block w-fit mb-1"
                                    >
                                      {allergy}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Recent Vitals */}
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Recent Vitals ({patient.recentVitals.date})
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Blood Pressure:</span>
                                  <span className="font-medium">
                                    {patient.recentVitals.bloodPressure}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Weight:</span>
                                  <span className="font-medium">
                                    {patient.recentVitals.weight}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Glucose:</span>
                                  <span className="font-medium">
                                    {patient.recentVitals.glucose}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Contact Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Emergency Contact:
                                  </span>
                                  <p>{patient.emergencyContact}</p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Insurance:
                                  </span>
                                  <p>{patient.insuranceInfo}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Care Goals Detail */}
                          <div className="mt-6 pt-4 border-t">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Care Goals Progress
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {patient.careGoals.map((goal) => (
                                <div
                                  key={goal.id}
                                  className="border rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">
                                      {goal.goal}
                                    </span>
                                    <Badge
                                      className={getGoalStatusColor(
                                        goal.status,
                                      )}
                                    >
                                      {goal.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                      <span>Target: {goal.target}</span>
                                      <span>Current: {goal.current}</span>
                                    </div>
                                    <div className="mt-1">
                                      Due: {goal.dueDate}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Encounters Tab */}
          <TabsContent value="encounters" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Encounter Panel */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {activeEncounter
                      ? "Active Encounter"
                      : "Encounter Management"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeEncounter ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">
                              {
                                ccmPatients.find(
                                  (p) => p.id === activeEncounter.patientId,
                                )?.name
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {activeEncounter.encounterType}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 font-mono">
                              {formatTime(encounterTimer)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Started:{" "}
                              {activeEncounter.startTime?.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                          >
                            {isTimerRunning ? (
                              <PauseCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <PlayCircle className="w-4 h-4 mr-1" />
                            )}
                            {isTimerRunning ? "Pause" : "Resume"}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Save className="w-4 h-4 mr-1" />
                            Save Progress
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="encounter-notes">Encounter Notes</Label>
                        <Textarea
                          id="encounter-notes"
                          placeholder="Document encounter details, patient responses, care plan updates..."
                          value={encounterNotes}
                          onChange={(e) => setEncounterNotes(e.target.value)}
                          rows={8}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={endEncounter}>
                          End Encounter
                        </Button>
                        <Button>
                          <Save className="w-4 h-4 mr-1" />
                          Save & Bill
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clipboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Start a New Encounter
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Begin a CCM encounter with one of your patients
                      </p>
                      <Button onClick={() => setShowNewEncounterDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Encounter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Encounter History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Encounters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ccmPatients
                      .flatMap((patient) =>
                        patient.encounters.map((encounter, idx) => (
                          <div
                            key={`${patient.id}-${idx}`}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {patient.name}
                              </span>
                              <Badge variant="outline">
                                {encounter.duration} min
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>{encounter.type}</p>
                              <p>
                                {new Date(encounter.date).toLocaleDateString()}
                              </p>
                              <p className="mt-1">{encounter.notes}</p>
                            </div>
                          </div>
                        )),
                      )
                      .slice(0, 5)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Goals & Outcomes */}
          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Care Goals Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            ccmPatients
                              .flatMap((p) => p.careGoals)
                              .filter((g) => g.status === "completed").length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            ccmPatients
                              .flatMap((p) => p.careGoals)
                              .filter((g) => g.status === "in_progress").length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          In Progress
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {
                            ccmPatients
                              .flatMap((p) => p.careGoals)
                              .filter((g) => g.status === "at_risk").length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">At Risk</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Goals Requiring Attention</h4>
                      {ccmPatients.flatMap((patient) =>
                        patient.careGoals
                          .filter((goal) => goal.status === "at_risk")
                          .map((goal) => (
                            <div
                              key={`${patient.id}-${goal.id}`}
                              className="border border-red-200 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {patient.name}
                                </span>
                                <Badge className="bg-red-50 text-red-700 border-red-200">
                                  At Risk
                                </Badge>
                              </div>
                              <p className="text-sm">{goal.goal}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                Target: {goal.target} | Current: {goal.current}{" "}
                                | Due: {goal.dueDate}
                              </div>
                            </div>
                          )),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Outcome Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Goal Completion Rate
                        </span>
                        <span className="text-sm font-bold">
                          {monthlyStats.goalCompletionRate}%
                        </span>
                      </div>
                      <Progress value={monthlyStats.goalCompletionRate} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Patient Satisfaction
                        </span>
                        <span className="text-sm font-bold">
                          {monthlyStats.satisfactionScore}/5.0
                        </span>
                      </div>
                      <Progress
                        value={(monthlyStats.satisfactionScore / 5) * 100}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Outcomes Met
                        </span>
                        <span className="text-sm font-bold">
                          {monthlyStats.outcomesMet}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Clinical outcomes achieved this month
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setShowGoalDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Billing */}
          <TabsContent value="billing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    CCM Billing Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billingCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono">
                              {code.code}
                            </Badge>
                            <span className="font-medium text-green-600">
                              {code.rate}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {code.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{code.used}</p>
                          <p className="text-sm text-muted-foreground">
                            used this month
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            ${code.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Monthly Billing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        ${monthlyStats.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        +12% vs last month
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">
                          {monthlyStats.completedBilling}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed Billings
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">
                          $
                          {Math.round(
                            monthlyStats.revenue /
                              monthlyStats.completedBilling,
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Average per Patient
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Generate Billing Report
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Export to EHR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Patient Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">89%</p>
                      <p className="text-sm text-muted-foreground">
                        HbA1c Goals Met
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">92%</p>
                      <p className="text-sm text-muted-foreground">
                        BP Control Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">76%</p>
                      <p className="text-sm text-muted-foreground">
                        Medication Adherence
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">High Risk</span>
                      </div>
                      <span className="font-medium">45 patients</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Medium Risk</span>
                      </div>
                      <span className="font-medium">156 patients</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Low Risk</span>
                      </div>
                      <span className="font-medium">146 patients</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Trending Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Enrollment Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          +12%
                        </span>
                      </div>
                      <Progress value={75} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Engagement Score</span>
                        <span className="text-sm font-bold text-blue-600">
                          +8%
                        </span>
                      </div>
                      <Progress value={83} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue Growth</span>
                        <span className="text-sm font-bold text-purple-600">
                          +15%
                        </span>
                      </div>
                      <Progress value={90} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Goal Dialog */}
        <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Care Goal</DialogTitle>
              <DialogDescription>
                Create a new care goal for a patient's care plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ccmPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Goal Description</Label>
                <Input placeholder="e.g., HbA1c < 7% within 3 months" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Value</Label>
                  <Input placeholder="e.g., 7.0%" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes about this goal..." />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGoalDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowGoalDialog(false)}>Add Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
