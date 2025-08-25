import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Heart,
  Pill,
  Clock,
  Calendar,
  Smartphone,
  Wifi,
  Battery,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  MessageSquare,
  Settings,
  Camera,
  BarChart3,
  Eye,
  Footprints,
  Droplets,
  Scale,
  Thermometer,
  Moon,
  Sun,
  Utensils,
  Dumbbell,
  Zap,
  Shield,
} from "lucide-react";

interface GlucoseReading {
  timestamp: string;
  value: number;
  type: "fasting" | "postprandial" | "bedtime" | "random" | "cgm";
  device: string;
  notes?: string;
  flag?: "low" | "high" | "critical";
}

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number; timestamp: string };
  weight: { value: number; timestamp: string; trend: "up" | "down" | "stable" };
  heartRate: { value: number; timestamp: string };
  temperature: { value: number; timestamp: string };
}

interface MedicationAdherence {
  medication: string;
  dosage: string;
  frequency: string;
  adherenceRate: number;
  lastTaken: string;
  nextDue: string;
  missedDoses: number;
}

interface WoundAssessment {
  id: string;
  location: "right_foot" | "left_foot" | "right_leg" | "left_leg" | "other";
  size: { length: number; width: number; depth: number };
  stage: 1 | 2 | 3 | 4;
  lastAssessed: string;
  healingProgress: "improving" | "stable" | "worsening";
  photos: string[];
  riskScore: number;
}

const mockGlucoseData: GlucoseReading[] = [
  {
    timestamp: "2024-01-15T06:00:00",
    value: 95,
    type: "fasting",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-15T08:30:00",
    value: 145,
    type: "postprandial",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-15T12:00:00",
    value: 110,
    type: "random",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-15T14:30:00",
    value: 180,
    type: "postprandial",
    device: "Dexcom G7",
    flag: "high",
  },
  {
    timestamp: "2024-01-15T18:00:00",
    value: 125,
    type: "random",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-15T22:00:00",
    value: 108,
    type: "bedtime",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-16T06:15:00",
    value: 88,
    type: "fasting",
    device: "Dexcom G7",
  },
  {
    timestamp: "2024-01-16T09:00:00",
    value: 155,
    type: "postprandial",
    device: "Dexcom G7",
  },
];

const mockA1CHistory = [
  { date: "2023-07-01", value: 8.2, target: 7.0 },
  { date: "2023-10-01", value: 7.8, target: 7.0 },
  { date: "2024-01-01", value: 7.4, target: 7.0 },
];

const mockMedications: MedicationAdherence[] = [
  {
    medication: "Metformin",
    dosage: "1000mg",
    frequency: "Twice daily",
    adherenceRate: 95,
    lastTaken: "2024-01-16T08:00:00",
    nextDue: "2024-01-16T20:00:00",
    missedDoses: 2,
  },
  {
    medication: "Insulin Lispro",
    dosage: "12 units",
    frequency: "Before meals",
    adherenceRate: 88,
    lastTaken: "2024-01-16T12:30:00",
    nextDue: "2024-01-16T18:00:00",
    missedDoses: 5,
  },
  {
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    adherenceRate: 98,
    lastTaken: "2024-01-16T08:00:00",
    nextDue: "2024-01-17T08:00:00",
    missedDoses: 1,
  },
];

const mockWoundAssessment: WoundAssessment = {
  id: "wound_001",
  location: "right_foot",
  size: { length: 2.1, width: 1.8, depth: 0.4 },
  stage: 2,
  lastAssessed: "2024-01-15T10:00:00",
  healingProgress: "improving",
  photos: ["photo1.jpg", "photo2.jpg"],
  riskScore: 65,
};

export function DiabetesRPMDashboard() {
  const [glucoseData, setGlucoseData] =
    useState<GlucoseReading[]>(mockGlucoseData);
  const [currentGlucose, setCurrentGlucose] = useState<number>(110);
  const [timeInRange, setTimeInRange] = useState<number>(72);
  const [averageGlucose, setAverageGlucose] = useState<number>(128);
  const [deviceStatus, setDeviceStatus] = useState<{
    connected: boolean;
    battery: number;
    lastSync: string;
  }>({
    connected: true,
    battery: 85,
    lastSync: "2 minutes ago",
  });

  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#ef4444"; // red
    if (value < 80) return "#f97316"; // orange
    if (value <= 180) return "#22c55e"; // green
    if (value <= 250) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "Low", color: "destructive" };
    if (value < 80) return { status: "Below Target", color: "warning" };
    if (value <= 180) return { status: "In Range", color: "success" };
    if (value <= 250) return { status: "Above Target", color: "warning" };
    return { status: "High", color: "destructive" };
  };

  const glucoseStatus = getGlucoseStatus(currentGlucose);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Diabetes RPM Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring for Sarah Johnson • ID: DRP-2024-001
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${deviceStatus.connected ? "bg-green-500" : "bg-red-500"}`}
            />
            CGM Connected
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Blood glucose trending high after lunch (180 mg/dL at 2:30 PM).
          Consider reviewing carbohydrate intake and insulin timing.
        </AlertDescription>
      </Alert>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Glucose
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getGlucoseColor(currentGlucose) }}
                  >
                    {currentGlucose}
                  </span>
                  <span className="text-sm text-muted-foreground">mg/dL</span>
                </div>
                <Badge variant={glucoseStatus.color as any} className="mt-1">
                  {glucoseStatus.status}
                </Badge>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time in Range
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">
                    {timeInRange}%
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">70-180 mg/dL</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Glucose (14d)
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{averageGlucose}</span>
                  <span className="text-sm text-muted-foreground">mg/dL</span>
                </div>
                <p className="text-sm text-green-600">
                  ↓ 8 mg/dL vs last period
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Device Status
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Battery className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">
                      {deviceStatus.battery}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last sync: {deviceStatus.lastSync}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="glucose" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="glucose">Glucose</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="wounds">Wounds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="glucose" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>24-Hour Glucose Trend</CardTitle>
                <CardDescription>
                  Continuous glucose monitoring data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={glucoseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }
                    />
                    <YAxis domain={[50, 300]} />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleString()
                      }
                      formatter={(value, name) => [`${value} mg/dL`, "Glucose"]}
                    />
                    <ReferenceLine
                      y={70}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label="Low"
                    />
                    <ReferenceLine
                      y={180}
                      stroke="#f97316"
                      strokeDasharray="5 5"
                      label="High"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Pill className="w-4 h-4 mr-2" />
                    Log Medication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Utensils className="w-4 h-4 mr-2" />
                    Log Meal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Log Exercise
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Care Team
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Glucose Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Very Low (&lt;54)</span>
                    <span className="text-sm font-medium text-red-600">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low (54-69)</span>
                    <span className="text-sm font-medium text-orange-600">
                      3%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">In Range (70-180)</span>
                    <span className="text-sm font-medium text-green-600">
                      72%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">High (181-250)</span>
                    <span className="text-sm font-medium text-orange-600">
                      20%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Very High (&gt;250)</span>
                    <span className="text-sm font-medium text-red-600">3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>A1C Trend</CardTitle>
                <CardDescription>Hemoglobin A1C over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={mockA1CHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis domain={[6, 9]} />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                      formatter={(value, name) => [
                        `${value}%`,
                        name === "value" ? "A1C" : "Target",
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Patterns</CardTitle>
                <CardDescription>
                  Average glucose by day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { day: "Mon", avg: 125, target: 130 },
                      { day: "Tue", avg: 132, target: 130 },
                      { day: "Wed", avg: 128, target: 130 },
                      { day: "Thu", avg: 135, target: 130 },
                      { day: "Fri", avg: 142, target: 130 },
                      { day: "Sat", avg: 138, target: 130 },
                      { day: "Sun", avg: 129, target: 130 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} mg/dL`,
                        name === "avg" ? "Average" : "Target",
                      ]}
                    />
                    <Bar dataKey="avg" fill="#3b82f6" />
                    <ReferenceLine
                      y={130}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Medication Adherence</CardTitle>
                <CardDescription>
                  Current medication status and adherence rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMedications.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{med.medication}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                      <Badge
                        variant={
                          med.adherenceRate >= 90 ? "default" : "secondary"
                        }
                      >
                        {med.adherenceRate}%
                      </Badge>
                    </div>
                    <Progress value={med.adherenceRate} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>
                        Last taken:{" "}
                        {new Date(med.lastTaken).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        Next due:{" "}
                        {new Date(med.nextDue).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {med.missedDoses > 0 && (
                      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                          {med.missedDoses} missed doses in the last 30 days
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medication Reminders</CardTitle>
                <CardDescription>Upcoming doses and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Metformin 1000mg</p>
                      <p className="text-sm text-muted-foreground">
                        Due in 2 hours
                      </p>
                    </div>
                    <Button size="sm">Mark Taken</Button>
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Insulin Lispro</p>
                      <p className="text-sm text-muted-foreground">
                        Overdue by 30 minutes
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Snooze
                    </Button>
                  </div>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lisinopril 10mg</p>
                      <p className="text-sm text-muted-foreground">
                        Tomorrow at 8:00 AM
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Set Reminder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">128/82</div>
                  <Badge variant="outline">Stage 1 Hypertension</Badge>
                  <p className="text-sm text-muted-foreground">
                    Measured 1 hour ago
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">185.2 lbs</div>
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      -2.1 lbs this week
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">This morning</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">72 bpm</div>
                  <Badge variant="default">Normal</Badge>
                  <p className="text-sm text-muted-foreground">Resting rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wounds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diabetes Wound Management</CardTitle>
              <CardDescription>
                Monitor diabetic foot ulcers and wound healing progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Right Foot Ulcer</h4>
                    <p className="text-sm text-muted-foreground">
                      Stage {mockWoundAssessment.stage} diabetic foot ulcer
                    </p>
                  </div>
                  <Badge
                    variant={
                      mockWoundAssessment.healingProgress === "improving"
                        ? "default"
                        : mockWoundAssessment.healingProgress === "stable"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {mockWoundAssessment.healingProgress}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Size (L×W×D)
                    </Label>
                    <p className="font-medium">
                      {mockWoundAssessment.size.length} ×{" "}
                      {mockWoundAssessment.size.width} ×{" "}
                      {mockWoundAssessment.size.depth} cm
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Risk Score
                    </Label>
                    <p className="font-medium">
                      {mockWoundAssessment.riskScore}/100
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Last Assessment
                    </Label>
                    <p className="font-medium">
                      {new Date(
                        mockWoundAssessment.lastAssessed,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Assessment
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Care Protocol:</strong> Daily inspection, weekly
                  measurement, maintain glucose &lt;180 mg/dL for optimal
                  healing. Next wound clinic appointment: January 25, 2024.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>
                  January 2024 diabetes management report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">72%</div>
                    <div className="text-sm text-muted-foreground">
                      Time in Range
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">7.4%</div>
                    <div className="text-sm text-muted-foreground">
                      Est. A1C
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-muted-foreground">
                      Med Adherence
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      -2.1
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Weight Change (lbs)
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Full Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Team Notes</CardTitle>
                <CardDescription>
                  Recent updates from your diabetes care team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline">CDE</Badge>
                    <span className="text-sm text-muted-foreground">
                      Jan 15, 2024
                    </span>
                  </div>
                  <p className="text-sm">
                    Glucose trends showing improvement. Continue current insulin
                    regimen. Consider pre-meal timing adjustment.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline">RN</Badge>
                    <span className="text-sm text-muted-foreground">
                      Jan 14, 2024
                    </span>
                  </div>
                  <p className="text-sm">
                    Excellent weight management progress! Foot inspection
                    completed - no new concerns noted.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline">Physician</Badge>
                    <span className="text-sm text-muted-foreground">
                      Jan 12, 2024
                    </span>
                  </div>
                  <p className="text-sm">
                    BP trending higher. Increased Lisinopril to 20mg daily.
                    Recheck in 2 weeks.
                  </p>
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
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
