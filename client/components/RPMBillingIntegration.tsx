import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import {
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Timer,
  Users,
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Phone,
  MessageSquare,
  Mail,
  Smartphone,
  Activity,
  Target,
  Heart,
  Shield,
  Zap,
  Award,
  AlertCircle,
  Info,
  Star,
  Flag,
  ChevronRight,
  Calculator,
  Receipt,
  CreditCard,
  Banknote,
  Percent,
  Building,
  UserCheck,
  ClipboardList,
  Database,
} from "lucide-react";

interface CMSBillingCode {
  code: string;
  description: string;
  category: "RPM" | "CCM" | "CPT";
  minMinutes: number;
  maxMinutes?: number;
  reimbursementRate: number;
  requirements: string[];
  frequency: "monthly" | "per_service" | "annual";
  eligibilityRequirements: string[];
  documentationRequired: string[];
}

interface BillingSession {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  code: string;
  startTime: string;
  endTime?: string;
  totalMinutes: number;
  status: "in_progress" | "completed" | "submitted" | "paid" | "denied";
  activities: BillingActivity[];
  notes: string;
  createdDate: string;
  submissionDate?: string;
  paymentDate?: string;
  amount: number;
  reimbursementAmount?: number;
  denialReason?: string;
}

interface BillingActivity {
  id: string;
  type:
    | "device_setup"
    | "data_review"
    | "patient_contact"
    | "care_plan"
    | "medication_review"
    | "education"
    | "coordination";
  description: string;
  startTime: string;
  endTime: string;
  minutes: number;
  documentation: string;
  billable: boolean;
}

interface MonthlyBillingReport {
  month: string;
  totalSessions: number;
  totalMinutes: number;
  totalRevenue: number;
  reimbursementReceived: number;
  pendingClaims: number;
  deniedClaims: number;
  complianceRate: number;
  codeBreakdown: {
    [code: string]: {
      count: number;
      minutes: number;
      revenue: number;
    };
  };
}

const cmsBillingCodes: CMSBillingCode[] = [
  {
    code: "99453",
    description: "RPM device setup and patient education",
    category: "RPM",
    minMinutes: 16,
    reimbursementRate: 62.5,
    requirements: ["Initial setup", "Patient education", "Technical training"],
    frequency: "per_service",
    eligibilityRequirements: [
      "Medicare Part B",
      "Chronic condition",
      "Device prescription",
    ],
    documentationRequired: [
      "Device type",
      "Setup time",
      "Education provided",
      "Patient consent",
    ],
  },
  {
    code: "99454",
    description: "RPM device supply and data transmission",
    category: "RPM",
    minMinutes: 0,
    reimbursementRate: 54.2,
    requirements: [
      "30-day device supply",
      "Daily data transmission",
      "16+ days of data",
    ],
    frequency: "monthly",
    eligibilityRequirements: ["Active RPM enrollment", "Daily device usage"],
    documentationRequired: [
      "Device usage logs",
      "Data transmission records",
      "Days of valid data",
    ],
  },
  {
    code: "99457",
    description: "RPM treatment management services; first 20 minutes",
    category: "RPM",
    minMinutes: 20,
    reimbursementRate: 51.8,
    requirements: [
      "Clinical staff time",
      "Treatment management",
      "Communication with patient",
    ],
    frequency: "monthly",
    eligibilityRequirements: ["Minimum 20 minutes", "Licensed clinical staff"],
    documentationRequired: [
      "Time logs",
      "Clinical activities",
      "Patient interactions",
      "Care plan updates",
    ],
  },
  {
    code: "99458",
    description:
      "RPM treatment management services; each additional 20 minutes",
    category: "RPM",
    minMinutes: 20,
    reimbursementRate: 41.2,
    requirements: [
      "Additional clinical time",
      "Extended patient care",
      "Complex case management",
    ],
    frequency: "monthly",
    eligibilityRequirements: ["Primary 99457 billed", "Additional 20+ minutes"],
    documentationRequired: [
      "Extended time justification",
      "Additional activities",
      "Clinical complexity",
    ],
  },
  {
    code: "99490",
    description: "CCM services; first 20 minutes",
    category: "CCM",
    minMinutes: 20,
    reimbursementRate: 68.4,
    requirements: ["Care coordination", "24/7 access", "Care plan management"],
    frequency: "monthly",
    eligibilityRequirements: [
      "2+ chronic conditions",
      "Care plan on file",
      "Patient consent",
    ],
    documentationRequired: [
      "Care plan",
      "Communication log",
      "Coordination activities",
      "Time tracking",
    ],
  },
  {
    code: "99491",
    description: "CCM services; each additional 20 minutes",
    category: "CCM",
    minMinutes: 20,
    reimbursementRate: 59.3,
    requirements: ["Extended care coordination", "Complex case management"],
    frequency: "monthly",
    eligibilityRequirements: ["Primary 99490 billed", "Additional 20+ minutes"],
    documentationRequired: [
      "Additional time justification",
      "Complex care activities",
    ],
  },
];

const mockBillingSessions: BillingSession[] = [
  {
    id: "session_001",
    patientId: "rpm_001",
    patientName: "Margaret Thompson",
    providerId: "provider_001",
    providerName: "Dr. Sarah Chen",
    code: "99457",
    startTime: "2024-01-15T09:00:00",
    endTime: "2024-01-15T09:35:00",
    totalMinutes: 35,
    status: "completed",
    activities: [
      {
        id: "act_001",
        type: "data_review",
        description: "Review glucose data trends and patterns",
        startTime: "2024-01-15T09:00:00",
        endTime: "2024-01-15T09:12:00",
        minutes: 12,
        documentation:
          "Reviewed 7 days of CGM data, identified post-meal spikes",
        billable: true,
      },
      {
        id: "act_002",
        type: "patient_contact",
        description: "Phone consultation with patient",
        startTime: "2024-01-15T09:12:00",
        endTime: "2024-01-15T09:28:00",
        minutes: 16,
        documentation: "Discussed meal timing and carb counting strategies",
        billable: true,
      },
      {
        id: "act_003",
        type: "care_plan",
        description: "Update care plan based on data review",
        startTime: "2024-01-15T09:28:00",
        endTime: "2024-01-15T09:35:00",
        minutes: 7,
        documentation:
          "Adjusted target glucose ranges, updated medication timing",
        billable: true,
      },
    ],
    notes:
      "Patient showing improvement in post-meal glucose control. Continue current monitoring frequency.",
    createdDate: "2024-01-15T09:00:00",
    submissionDate: "2024-01-16T10:00:00",
    amount: 51.8,
    reimbursementAmount: 51.8,
  },
  {
    id: "session_002",
    patientId: "rpm_002",
    patientName: "Robert Chen",
    providerId: "provider_002",
    providerName: "Maria Rodriguez, RN",
    code: "99490",
    startTime: "2024-01-15T14:00:00",
    endTime: "2024-01-15T14:32:00",
    totalMinutes: 32,
    status: "submitted",
    activities: [
      {
        id: "act_004",
        type: "care_plan",
        description: "Monthly care plan review and updates",
        startTime: "2024-01-15T14:00:00",
        endTime: "2024-01-15T14:15:00",
        minutes: 15,
        documentation: "Reviewed diabetes and hypertension management goals",
        billable: true,
      },
      {
        id: "act_005",
        type: "coordination",
        description: "Coordinate with specialist for nephrology consult",
        startTime: "2024-01-15T14:15:00",
        endTime: "2024-01-15T14:25:00",
        minutes: 10,
        documentation:
          "Scheduled nephrology appointment, shared recent lab results",
        billable: true,
      },
      {
        id: "act_006",
        type: "patient_contact",
        description: "Patient education on medication adherence",
        startTime: "2024-01-15T14:25:00",
        endTime: "2024-01-15T14:32:00",
        minutes: 7,
        documentation: "Discussed importance of ACE inhibitor compliance",
        billable: true,
      },
    ],
    notes:
      "CCM coordination successful. Patient scheduled for nephrology follow-up.",
    createdDate: "2024-01-15T14:00:00",
    submissionDate: "2024-01-16T11:00:00",
    amount: 68.4,
  },
];

const monthlyReport: MonthlyBillingReport = {
  month: "January 2024",
  totalSessions: 156,
  totalMinutes: 3420,
  totalRevenue: 9856.8,
  reimbursementReceived: 9234.5,
  pendingClaims: 12,
  deniedClaims: 3,
  complianceRate: 96.2,
  codeBreakdown: {
    "99453": { count: 28, minutes: 448, revenue: 1750.0 },
    "99454": { count: 89, minutes: 0, revenue: 4823.8 },
    "99457": { count: 67, minutes: 1675, revenue: 3470.6 },
    "99458": { count: 15, minutes: 300, revenue: 618.0 },
    "99490": { count: 45, minutes: 997, revenue: 3078.0 },
    "99491": { count: 8, minutes: 160, revenue: 474.4 },
  },
};

export function RPMBillingIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [billingSessions, setBillingSessions] =
    useState<BillingSession[]>(mockBillingSessions);
  const [activeSession, setActiveSession] = useState<BillingSession | null>(
    null,
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

  const totalPendingRevenue = billingSessions
    .filter((s) => s.status === "submitted" || s.status === "completed")
    .reduce((sum, s) => sum + s.amount, 0);

  const completedSessions = billingSessions.filter(
    (s) => s.status === "completed" || s.status === "paid",
  ).length;
  const avgSessionMinutes =
    billingSessions.reduce((sum, s) => sum + s.totalMinutes, 0) /
    billingSessions.length;

  const startBillingSession = (patientId: string, code: string) => {
    const newSession: BillingSession = {
      id: `session_${Date.now()}`,
      patientId,
      patientName: "New Patient",
      providerId: "current_user",
      providerName: "Current Provider",
      code,
      startTime: new Date().toISOString(),
      totalMinutes: 0,
      status: "in_progress",
      activities: [],
      notes: "",
      createdDate: new Date().toISOString(),
      amount:
        cmsBillingCodes.find((c) => c.code === code)?.reimbursementRate || 0,
    };

    setBillingSessions([...billingSessions, newSession]);
    setActiveSession(newSession);
    setIsTimerRunning(true);
    setCurrentTimer(0);
  };

  const addActivity = (
    sessionId: string,
    activity: Omit<BillingActivity, "id">,
  ) => {
    const activityWithId = { ...activity, id: `act_${Date.now()}` };
    setBillingSessions(
      billingSessions.map((session) =>
        session.id === sessionId
          ? { ...session, activities: [...session.activities, activityWithId] }
          : session,
      ),
    );
  };

  const completeSession = (sessionId: string, notes: string) => {
    setBillingSessions(
      billingSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "completed",
              endTime: new Date().toISOString(),
              totalMinutes: session.activities.reduce(
                (sum, a) => sum + a.minutes,
                0,
              ),
              notes,
            }
          : session,
      ),
    );
    setActiveSession(null);
    setIsTimerRunning(false);
    setCurrentTimer(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return { color: "secondary", text: "In Progress" };
      case "completed":
        return { color: "default", text: "Completed" };
      case "submitted":
        return { color: "warning", text: "Submitted" };
      case "paid":
        return { color: "success", text: "Paid" };
      case "denied":
        return { color: "destructive", text: "Denied" };
      default:
        return { color: "secondary", text: "Unknown" };
    }
  };

  const calculateComplianceRate = () => {
    const compliantSessions = billingSessions.filter((session) => {
      const code = cmsBillingCodes.find((c) => c.code === session.code);
      return code && session.totalMinutes >= code.minMinutes;
    }).length;
    return ((compliantSessions / billingSessions.length) * 100).toFixed(1);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            RPM Billing Integration
          </h1>
          <p className="text-muted-foreground">
            CMS compliant billing with automated time tracking and documentation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />$
            {totalPendingRevenue.toLocaleString()} Pending
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Timer className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>
                <strong>Active Session:</strong> {activeSession.code} -{" "}
                {activeSession.patientName}
              </span>
              <div className="flex items-center space-x-4">
                <span className="font-mono text-lg">
                  {Math.floor(currentTimer / 60)}:
                  {(currentTimer % 60).toString().padStart(2, "0")}
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? "Pause" : "Resume"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    completeSession(activeSession.id, "Session completed")
                  }
                >
                  Complete
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </p>
                <div className="text-2xl font-bold">
                  {billingSessions.length}
                </div>
                <p className="text-sm text-green-600">
                  +{completedSessions} completed
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Revenue
                </p>
                <div className="text-2xl font-bold">
                  ${totalPendingRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Awaiting reimbursement
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Minutes
                </p>
                <div className="text-2xl font-bold">
                  {Math.round(avgSessionMinutes)}
                </div>
                <p className="text-sm text-blue-600">Per session</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {calculateComplianceRate()}%
                </div>
                <p className="text-sm text-muted-foreground">
                  CMS requirements
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="codes">Billing Codes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
                <CardDescription>
                  Billing performance by CMS code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(monthlyReport.codeBreakdown).map(
                  ([code, data]) => {
                    const codeInfo = cmsBillingCodes.find(
                      (c) => c.code === code,
                    );
                    return (
                      <div
                        key={code}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <h4 className="font-medium">{code}</h4>
                          <p className="text-sm text-muted-foreground">
                            {codeInfo?.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${data.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {data.count} sessions • {data.minutes} min
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Billing Activity</CardTitle>
                <CardDescription>
                  Latest sessions and status updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {billingSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          session.status === "paid"
                            ? "bg-green-500"
                            : session.status === "submitted"
                              ? "bg-blue-500"
                              : session.status === "completed"
                                ? "bg-yellow-500"
                                : session.status === "denied"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                        }`}
                      />
                      <div>
                        <h5 className="font-medium">{session.patientName}</h5>
                        <p className="text-sm text-muted-foreground">
                          {session.code} • {session.totalMinutes} minutes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={getStatusBadge(session.status).color as any}
                      >
                        {getStatusBadge(session.status).text}
                      </Badge>
                      <div className="text-sm font-medium mt-1">
                        ${session.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => startBillingSession("new_patient", "99457")}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Start RPM Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => startBillingSession("new_patient", "99490")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Start CCM Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Claims
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Collection Rate</span>
                  <span className="font-medium">94.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Days to Pay</span>
                  <span className="font-medium">28 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Denial Rate</span>
                  <span className="font-medium text-red-600">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Appeal Success</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Documentation</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Requirements</span>
                  <Badge variant="default">Met</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Patient Consent</span>
                  <Badge variant="default">Current</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Provider Credentials</span>
                  <Badge variant="default">Valid</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Billing Sessions</h3>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {billingSessions
              .filter(
                (session) =>
                  filterStatus === "all" || session.status === filterStatus,
              )
              .map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            session.status === "paid"
                              ? "bg-green-500"
                              : session.status === "submitted"
                                ? "bg-blue-500"
                                : session.status === "completed"
                                  ? "bg-yellow-500"
                                  : session.status === "denied"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium">{session.patientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Provider: {session.providerName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={getStatusBadge(session.status).color as any}
                        >
                          {getStatusBadge(session.status).text}
                        </Badge>
                        <div className="text-sm font-medium mt-1">
                          ${session.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Code:</span>
                        <p className="font-medium">{session.code}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">
                          {session.totalMinutes} minutes
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">
                          {new Date(session.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Activities:
                        </span>
                        <p className="font-medium">
                          {session.activities.length}
                        </p>
                      </div>
                    </div>

                    {session.activities.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Activities:</h5>
                        <div className="space-y-1">
                          {session.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <span>{activity.description}</span>
                              <div className="flex items-center space-x-2">
                                <span>{activity.minutes} min</span>
                                {activity.billable && (
                                  <Badge variant="outline" className="text-xs">
                                    Billable
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {session.notes && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-1">Notes:</h5>
                        <p className="text-sm text-muted-foreground">
                          {session.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {session.status === "completed" && (
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Claim
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CMS Billing Codes Reference</CardTitle>
              <CardDescription>
                Current reimbursement rates and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmsBillingCodes.map((code) => (
                  <Card key={code.code} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-lg">{code.code}</h4>
                          <Badge
                            variant={
                              code.category === "RPM" ? "default" : "secondary"
                            }
                          >
                            {code.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {code.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${code.reimbursementRate.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {code.frequency}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Requirements:</h5>
                        <ul className="text-sm space-y-1">
                          {code.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">
                          Documentation Required:
                        </h5>
                        <ul className="text-sm space-y-1">
                          {code.documentationRequired.map((doc, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {code.minMinutes > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Minimum: {code.minMinutes} minutes</span>
                          </div>
                          {code.maxMinutes && (
                            <div className="flex items-center space-x-1">
                              <Timer className="w-4 h-4 text-orange-600" />
                              <span>Maximum: {code.maxMinutes} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Billing Report</CardTitle>
              <CardDescription>
                {monthlyReport.month} performance summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">
                    {monthlyReport.totalSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Sessions
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">
                    {monthlyReport.totalMinutes.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Minutes
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    ${monthlyReport.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {monthlyReport.complianceRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Compliance Rate
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Claims Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Submitted Claims</span>
                      <span className="font-medium">
                        {monthlyReport.totalSessions -
                          monthlyReport.pendingClaims}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Claims</span>
                      <span className="font-medium text-yellow-600">
                        {monthlyReport.pendingClaims}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Denied Claims</span>
                      <span className="font-medium text-red-600">
                        {monthlyReport.deniedClaims}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reimbursement Received</span>
                      <span className="font-medium text-green-600">
                        ${monthlyReport.reimbursementReceived.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Top Billing Codes</h4>
                  <div className="space-y-2">
                    {Object.entries(monthlyReport.codeBreakdown)
                      .sort(([, a], [, b]) => b.revenue - a.revenue)
                      .slice(0, 4)
                      .map(([code, data]) => (
                        <div
                          key={code}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{code}</span>
                          <div className="text-right">
                            <span className="font-medium">
                              ${data.revenue.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({data.count} sessions)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Full Report
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Claims File
                </Button>
                <Button variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CMS Compliance Checklist</CardTitle>
                <CardDescription>
                  Ensure all requirements are met
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Provider enrolled in Medicare
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Patient has qualifying chronic condition
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Written consent obtained</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Care plan documented</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">24/7 access documented</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Minimum time requirements met
                    </span>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation Requirements</CardTitle>
                <CardDescription>
                  Required documentation for billing compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time tracking logs</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Clinical activity documentation
                    </span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Patient communication records
                    </span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Care plan updates</span>
                    <Badge variant="secondary">Partial</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Device monitoring logs</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Provider credentials</span>
                    <Badge variant="default">Valid</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Compliance monitoring and audit readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      98.5%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Documentation Compliance
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-muted-foreground">
                      Audit Records
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-muted-foreground">
                      Compliance Violations
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Audit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
                <CardDescription>
                  Configure billing parameters and automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Auto-submit completed claims</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email notifications for denials</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Time tracking reminders</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Compliance alerts</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div>
                  <Label>Auto-submit delay (hours)</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
                <CardDescription>
                  Update provider details for billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input id="npi" placeholder="1234567890" />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" placeholder="12-3456789" />
                </div>
                <div>
                  <Label htmlFor="medicareId">Medicare Provider ID</Label>
                  <Input id="medicareId" placeholder="0123456789" />
                </div>
                <div>
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Textarea
                    id="billingAddress"
                    placeholder="Enter billing address..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({
  children,
  className,
  htmlFor,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  [key: string]: any;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
