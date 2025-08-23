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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Target,
  Activity,
  Clock,
  Calendar,
  Download,
  Upload,
  Eye,
  Settings,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  Database,
  Search,
  Star,
  Gauge,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Smartphone,
  Stethoscope,
  Pill,
  Droplets,
  Scale,
  Thermometer
} from "lucide-react";

interface PopulationMetrics {
  totalPatients: number;
  activePatients: number;
  highRiskPatients: number;
  newEnrollments: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
  diabetesTypes: {
    type1: number;
    type2: number;
    gestational: number;
    prediabetes: number;
  };
  comorbidities: {
    hypertension: number;
    heartDisease: number;
    kidneyDisease: number;
    neuropathy: number;
  };
}

interface ClinicalOutcomes {
  avgA1C: number;
  a1cImprovement: number;
  timeInRange: number;
  hypoglycemicEvents: number;
  emergencyVisits: number;
  hospitalizations: number;
  medicationAdherence: number;
  weightChange: number;
  bpControl: number;
  footUlcerPrevention: number;
}

interface DeviceMetrics {
  totalDevices: number;
  activeDevices: number;
  connectivityRate: number;
  dataQuality: number;
  avgDataPoints: number;
  deviceTypes: {
    cgm: number;
    glucometer: number;
    bloodPressure: number;
    scale: number;
    other: number;
  };
  manufacturerDistribution: {
    dexcom: number;
    abbott: number;
    lifescan: number;
    omron: number;
    withings: number;
  };
}

interface BillingMetrics {
  totalRevenue: number;
  rpmBillings: number;
  ccmBillings: number;
  avgReimbursement: number;
  billingCompliance: number;
  denialRate: number;
  collectionsRate: number;
  monthlyGrowth: number;
}

interface QualityMetrics {
  hedisScores: {
    hba1cControl: number;
    eyeExam: number;
    nephropathy: number;
    bpControl: number;
  };
  starRatings: {
    overall: number;
    diabetes: number;
    hypertension: number;
    coordination: number;
  };
  patientSatisfaction: number;
  careGaps: number;
  qualityImprovement: number;
}

const mockPopulationData: PopulationMetrics = {
  totalPatients: 1247,
  activePatients: 1089,
  highRiskPatients: 234,
  newEnrollments: 67,
  avgAge: 64.2,
  malePercentage: 52,
  femalePercentage: 48,
  diabetesTypes: {
    type1: 89,
    type2: 1024,
    gestational: 12,
    prediabetes: 122
  },
  comorbidities: {
    hypertension: 856,
    heartDisease: 234,
    kidneyDisease: 178,
    neuropathy: 345
  }
};

const mockClinicalData: ClinicalOutcomes = {
  avgA1C: 7.2,
  a1cImprovement: -0.8,
  timeInRange: 73,
  hypoglycemicEvents: 45,
  emergencyVisits: 23,
  hospitalizations: 12,
  medicationAdherence: 87,
  weightChange: -4.2,
  bpControl: 78,
  footUlcerPrevention: 95
};

const mockDeviceData: DeviceMetrics = {
  totalDevices: 2156,
  activeDevices: 1987,
  connectivityRate: 92,
  dataQuality: 94,
  avgDataPoints: 1440,
  deviceTypes: {
    cgm: 945,
    glucometer: 534,
    bloodPressure: 456,
    scale: 189,
    other: 32
  },
  manufacturerDistribution: {
    dexcom: 45,
    abbott: 32,
    lifescan: 15,
    omron: 6,
    withings: 2
  }
};

const mockBillingData: BillingMetrics = {
  totalRevenue: 487650,
  rpmBillings: 312400,
  ccmBillings: 175250,
  avgReimbursement: 67.50,
  billingCompliance: 96,
  denialRate: 3.2,
  collectionsRate: 94.5,
  monthlyGrowth: 12.8
};

const mockQualityData: QualityMetrics = {
  hedisScores: {
    hba1cControl: 78,
    eyeExam: 82,
    nephropathy: 75,
    bpControl: 72
  },
  starRatings: {
    overall: 4.2,
    diabetes: 4.5,
    hypertension: 4.1,
    coordination: 4.3
  },
  patientSatisfaction: 89,
  careGaps: 15,
  qualityImprovement: 23
};

const trendData = [
  { month: "Jan", patients: 985, a1c: 7.8, timeInRange: 68, hospitalizations: 18 },
  { month: "Feb", patients: 1034, a1c: 7.6, timeInRange: 70, hospitalizations: 16 },
  { month: "Mar", patients: 1089, a1c: 7.4, timeInRange: 71, hospitalizations: 14 },
  { month: "Apr", patients: 1142, a1c: 7.3, timeInRange: 72, hospitalizations: 13 },
  { month: "May", patients: 1198, a1c: 7.2, timeInRange: 73, hospitalizations: 12 },
  { month: "Jun", patients: 1247, a1c: 7.2, timeInRange: 73, hospitalizations: 12 }
];

const riskStratification = [
  { name: "Low Risk", value: 645, color: "#22c55e" },
  { name: "Moderate Risk", value: 368, color: "#eab308" },
  { name: "High Risk", value: 234, color: "#ef4444" }
];

const outcomeMetrics = [
  { metric: "A1C Control (<7%)", baseline: 45, current: 62, target: 70 },
  { metric: "Time in Range (70-180)", baseline: 68, current: 73, target: 75 },
  { metric: "Medication Adherence", baseline: 76, current: 87, target: 90 },
  { metric: "BP Control (<130/80)", baseline: 65, current: 78, target: 80 },
  { metric: "Weight Management", baseline: 32, current: 58, target: 65 }
];

export function RPMAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [populationFilter, setPopulationFilter] = useState("all");

  const calculateROI = () => {
    const totalCosts = 285000; // Mock operational costs
    const totalSavings = 750000; // Mock healthcare savings
    return ((totalSavings - totalCosts) / totalCosts * 100).toFixed(1);
  };

  const getQualityRating = (score: number) => {
    if (score >= 90) return { color: "text-green-600", rating: "Excellent" };
    if (score >= 80) return { color: "text-blue-600", rating: "Good" };
    if (score >= 70) return { color: "text-yellow-600", rating: "Fair" };
    return { color: "text-red-600", rating: "Needs Improvement" };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            RPM Analytics & Reporting
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into population health, outcomes, and program performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <div className="text-2xl font-bold">{mockPopulationData.totalPatients.toLocaleString()}</div>
                <p className="text-sm text-green-600">↑ {mockPopulationData.newEnrollments} new this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg A1C</p>
                <div className="text-2xl font-bold">{mockClinicalData.avgA1C}%</div>
                <p className="text-sm text-green-600">↓ {Math.abs(mockClinicalData.a1cImprovement)} improvement</p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time in Range</p>
                <div className="text-2xl font-bold">{mockClinicalData.timeInRange}%</div>
                <p className="text-sm text-green-600">Above target (70%)</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Program ROI</p>
                <div className="text-2xl font-bold text-green-600">{calculateROI()}%</div>
                <p className="text-sm text-muted-foreground">Healthcare savings</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="population">Population</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Population Growth & Clinical Trends</CardTitle>
                <CardDescription>Patient enrollment and key clinical metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="patients" fill="#3b82f6" name="Patients" />
                    <Line yAxisId="right" type="monotone" dataKey="a1c" stroke="#ef4444" name="Avg A1C %" />
                    <Line yAxisId="right" type="monotone" dataKey="timeInRange" stroke="#22c55e" name="Time in Range %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Stratification</CardTitle>
                <CardDescription>Patient distribution by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskStratification}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskStratification.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Alerts Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical Hypoglycemia</span>
                  <Badge variant="destructive">3 today</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hyperglycemia Events</span>
                  <Badge variant="warning">12 today</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Device Disconnections</span>
                  <Badge variant="secondary">8 today</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medication Alerts</span>
                  <Badge variant="secondary">15 today</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active RPM Patients</span>
                  <span className="font-medium">{mockPopulationData.activePatients}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">CCM Enrolled</span>
                  <span className="font-medium">567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Device Utilization</span>
                  <span className="font-medium">{mockDeviceData.connectivityRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Care Team Contacts</span>
                  <span className="font-medium">2,341 this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">HEDIS Diabetes</span>
                  <span className="font-medium text-green-600">{mockQualityData.hedisScores.hba1cControl}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Star Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium ml-1">{mockQualityData.starRatings.overall}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Patient Satisfaction</span>
                  <span className="font-medium text-blue-600">{mockQualityData.patientSatisfaction}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Care Gaps</span>
                  <span className="font-medium text-orange-600">{mockQualityData.careGaps}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="population" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Population Health Analytics</h3>
            <Select value={populationFilter} onValueChange={setPopulationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="type1">Type 1 Diabetes</SelectItem>
                <SelectItem value="type2">Type 2 Diabetes</SelectItem>
                <SelectItem value="highrisk">High Risk</SelectItem>
                <SelectItem value="newenrolled">New Enrollees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Demographics Overview</CardTitle>
                <CardDescription>Patient population characteristics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{mockPopulationData.avgAge}</div>
                    <div className="text-sm text-muted-foreground">Average Age</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{mockPopulationData.highRiskPatients}</div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Male</span>
                      <span>{mockPopulationData.malePercentage}%</span>
                    </div>
                    <Progress value={mockPopulationData.malePercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Female</span>
                      <span>{mockPopulationData.femalePercentage}%</span>
                    </div>
                    <Progress value={mockPopulationData.femalePercentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diabetes Types Distribution</CardTitle>
                <CardDescription>Breakdown by diabetes classification</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { type: "Type 1", count: mockPopulationData.diabetesTypes.type1 },
                    { type: "Type 2", count: mockPopulationData.diabetesTypes.type2 },
                    { type: "Gestational", count: mockPopulationData.diabetesTypes.gestational },
                    { type: "Prediabetes", count: mockPopulationData.diabetesTypes.prediabetes }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comorbidities Analysis</CardTitle>
              <CardDescription>Prevalence of common comorbid conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockPopulationData.comorbidities.hypertension}</div>
                  <div className="text-sm text-muted-foreground">Hypertension</div>
                  <div className="text-xs text-green-600">68% of patients</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Heart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockPopulationData.comorbidities.heartDisease}</div>
                  <div className="text-sm text-muted-foreground">Heart Disease</div>
                  <div className="text-xs text-orange-600">19% of patients</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Stethoscope className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockPopulationData.comorbidities.kidneyDisease}</div>
                  <div className="text-sm text-muted-foreground">Kidney Disease</div>
                  <div className="text-xs text-yellow-600">14% of patients</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockPopulationData.comorbidities.neuropathy}</div>
                  <div className="text-sm text-muted-foreground">Neuropathy</div>
                  <div className="text-xs text-purple-600">28% of patients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Outcomes Dashboard</CardTitle>
              <CardDescription>Key performance indicators and improvement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {outcomeMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{metric.metric}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">Baseline: {metric.baseline}%</span>
                        <span className="font-medium">Current: {metric.current}%</span>
                        <span className="text-blue-600">Target: {metric.target}%</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={metric.current} className="h-3" />
                      <div 
                        className="absolute top-0 h-3 w-0.5 bg-blue-600" 
                        style={{ left: `${metric.target}%` }}
                      />
                      <div 
                        className="absolute top-0 h-3 w-0.5 bg-gray-400" 
                        style={{ left: `${metric.baseline}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className={metric.current >= metric.target ? "text-green-600" : "text-orange-600"}>
                        {metric.current >= metric.target ? "Target Achieved" : `${metric.target - metric.current}% to target`}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>A1C Distribution</CardTitle>
                <CardDescription>Patient A1C levels across population</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { range: "<6.5%", count: 234, color: "#22c55e" },
                    { range: "6.5-7%", count: 378, color: "#3b82f6" },
                    { range: "7-8%", count: 445, color: "#eab308" },
                    { range: "8-9%", count: 156, color: "#f97316" },
                    { range: ">9%", count: 34, color: "#ef4444" }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Healthcare Utilization</CardTitle>
                <CardDescription>Impact on healthcare services usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">-34%</div>
                    <div className="text-sm text-muted-foreground">Emergency Visits</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">-28%</div>
                    <div className="text-sm text-muted-foreground">Hospitalizations</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">+45%</div>
                    <div className="text-sm text-muted-foreground">Provider Contacts</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">+67%</div>
                    <div className="text-sm text-muted-foreground">Preventive Care</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Cost per Patient/Month</span>
                    <span className="font-medium text-green-600">-$234</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Cost Savings</span>
                    <span className="font-medium text-green-600">$750,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Quality Bonus Earned</span>
                    <span className="font-medium text-blue-600">$125,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Utilization Overview</CardTitle>
                <CardDescription>Connected devices and usage patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{mockDeviceData.totalDevices}</div>
                    <div className="text-sm text-muted-foreground">Total Devices</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">{mockDeviceData.connectivityRate}%</div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Quality</span>
                      <span>{mockDeviceData.dataQuality}%</span>
                    </div>
                    <Progress value={mockDeviceData.dataQuality} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Data Points</span>
                      <span>{mockDeviceData.avgDataPoints.toLocaleString()}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types Distribution</CardTitle>
                <CardDescription>Breakdown by device category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "CGM", value: mockDeviceData.deviceTypes.cgm, color: "#3b82f6" },
                        { name: "Glucometer", value: mockDeviceData.deviceTypes.glucometer, color: "#ef4444" },
                        { name: "BP Monitor", value: mockDeviceData.deviceTypes.bloodPressure, color: "#22c55e" },
                        { name: "Scale", value: mockDeviceData.deviceTypes.scale, color: "#eab308" },
                        { name: "Other", value: mockDeviceData.deviceTypes.other, color: "#8b5cf6" }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[
                        { name: "CGM", value: mockDeviceData.deviceTypes.cgm, color: "#3b82f6" },
                        { name: "Glucometer", value: mockDeviceData.deviceTypes.glucometer, color: "#ef4444" },
                        { name: "BP Monitor", value: mockDeviceData.deviceTypes.bloodPressure, color: "#22c55e" },
                        { name: "Scale", value: mockDeviceData.deviceTypes.scale, color: "#eab308" },
                        { name: "Other", value: mockDeviceData.deviceTypes.other, color: "#8b5cf6" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Analysis</CardTitle>
              <CardDescription>Market share and device performance by manufacturer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded">
                  <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockDeviceData.manufacturerDistribution.dexcom}%</div>
                  <div className="text-sm text-muted-foreground">Dexcom</div>
                  <div className="text-xs text-green-600">96% uptime</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Droplets className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockDeviceData.manufacturerDistribution.abbott}%</div>
                  <div className="text-sm text-muted-foreground">Abbott</div>
                  <div className="text-xs text-green-600">94% uptime</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockDeviceData.manufacturerDistribution.lifescan}%</div>
                  <div className="text-sm text-muted-foreground">LifeScan</div>
                  <div className="text-xs text-blue-600">91% uptime</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockDeviceData.manufacturerDistribution.omron}%</div>
                  <div className="text-sm text-muted-foreground">Omron</div>
                  <div className="text-xs text-green-600">93% uptime</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <Scale className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mockDeviceData.manufacturerDistribution.withings}%</div>
                  <div className="text-sm text-muted-foreground">Withings</div>
                  <div className="text-xs text-blue-600">89% uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>HEDIS Quality Measures</CardTitle>
                <CardDescription>Healthcare Effectiveness Data and Information Set scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(mockQualityData.hedisScores).map(([measure, score]) => (
                  <div key={measure} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {measure === 'hba1cControl' ? 'HbA1c Control (<8%)' :
                         measure === 'eyeExam' ? 'Eye Exam (Annual)' :
                         measure === 'nephropathy' ? 'Nephropathy Assessment' :
                         'Blood Pressure Control'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getQualityRating(score).color}`}>
                          {score}%
                        </span>
                        <Badge variant={score >= 75 ? "default" : "secondary"}>
                          {getQualityRating(score).rating}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Star Ratings Performance</CardTitle>
                <CardDescription>CMS Five-Star Quality Rating System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(mockQualityData.starRatings).map(([category, rating]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {category === 'overall' ? 'Overall Rating' :
                       category === 'diabetes' ? 'Diabetes Care' :
                       category === 'hypertension' ? 'Hypertension Management' :
                       'Care Coordination'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {mockQualityData.patientSatisfaction}%
                </div>
                <p className="text-muted-foreground mb-4">Overall Satisfaction</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Care Quality</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-orange-600">
                    {mockQualityData.careGaps}
                  </div>
                  <p className="text-muted-foreground">Open Care Gaps</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Eye Exams</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Foot Exams</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>A1C Testing</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Improvement</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  +{mockQualityData.qualityImprovement}%
                </div>
                <p className="text-muted-foreground mb-4">Year over Year</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>A1C Improvement</span>
                    <span className="font-medium text-green-600">+18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adherence</span>
                    <span className="font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfaction</span>
                    <span className="font-medium text-green-600">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance and growth metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      ${mockBillingData.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      +{mockBillingData.monthlyGrowth}%
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Growth</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>RPM Revenue</span>
                      <span>${mockBillingData.rpmBillings.toLocaleString()}</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CCM Revenue</span>
                      <span>${mockBillingData.ccmBillings.toLocaleString()}</span>
                    </div>
                    <Progress value={36} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Performance</CardTitle>
                <CardDescription>Claims processing and reimbursement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {mockBillingData.billingCompliance}%
                    </div>
                    <div className="text-sm text-muted-foreground">Compliance Rate</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {mockBillingData.denialRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Denial Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Avg Reimbursement</span>
                    <span className="font-medium">${mockBillingData.avgReimbursement}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Collections Rate</span>
                    <span className="font-medium text-green-600">{mockBillingData.collectionsRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Outstanding A/R</span>
                    <span className="font-medium">$45,230</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost-Benefit Analysis</CardTitle>
              <CardDescription>Program costs vs. healthcare savings and quality improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">$285,000</div>
                  <p className="text-muted-foreground mb-4">Program Costs</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Technology</span>
                      <span>$120,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff</span>
                      <span>$145,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operations</span>
                      <span>$20,000</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$750,000</div>
                  <p className="text-muted-foreground mb-4">Healthcare Savings</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Reduced ER visits</span>
                      <span>$340,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fewer hospitalizations</span>
                      <span>$310,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medication optimization</span>
                      <span>$100,000</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{calculateROI()}%</div>
                  <p className="text-muted-foreground mb-4">Return on Investment</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Net Savings</span>
                      <span className="text-green-600">$465,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Bonus</span>
                      <span className="text-blue-600">$125,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient Value</span>
                      <span className="text-purple-600">Improved</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
