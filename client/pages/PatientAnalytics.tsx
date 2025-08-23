import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Target,
  Zap,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { usePatientStats } from "../hooks/api/usePatients";

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalPatients: 1247,
    activePatients: 1156,
    newThisMonth: 87,
    riskPatients: 34,
    adherenceRate: 89.2,
    satisfactionScore: 4.6
  },
  demographics: {
    ageGroups: [
      { range: "0-18", count: 156, percentage: 12.5 },
      { range: "19-35", count: 312, percentage: 25.0 },
      { range: "36-50", count: 398, percentage: 31.9 },
      { range: "51-65", count: 298, percentage: 23.9 },
      { range: "65+", count: 83, percentage: 6.7 }
    ],
    genderDistribution: [
      { gender: "Female", count: 678, percentage: 54.4 },
      { gender: "Male", count: 532, percentage: 42.7 },
      { gender: "Other", count: 37, percentage: 2.9 }
    ],
    conditionsByAge: [
      { condition: "Diabetes", under50: 45, over50: 112 },
      { condition: "Hypertension", under50: 78, over50: 234 },
      { condition: "Heart Disease", under50: 23, over50: 89 },
      { condition: "COPD", under50: 12, over50: 67 }
    ]
  },
  conditions: {
    mostCommon: [
      { name: "Hypertension", count: 312, percentage: 25.0, trend: "up" },
      { name: "Type 2 Diabetes", count: 157, percentage: 12.6, trend: "up" },
      { name: "Hyperlipidemia", count: 134, percentage: 10.7, trend: "stable" },
      { name: "COPD", count: 79, percentage: 6.3, trend: "down" },
      { name: "Heart Disease", count: 112, percentage: 9.0, trend: "stable" }
    ],
    byRisk: [
      { level: "High Risk", count: 34, percentage: 2.7 },
      { level: "Medium Risk", count: 187, percentage: 15.0 },
      { level: "Low Risk", count: 1026, percentage: 82.3 }
    ]
  },
  engagement: {
    portalUsage: {
      daily: 456,
      weekly: 789,
      monthly: 1089,
      never: 158
    },
    appointmentMetrics: {
      scheduled: 234,
      completed: 198,
      noShows: 23,
      cancelled: 13,
      adherenceRate: 84.6
    },
    communicationStats: {
      messagesReceived: 1247,
      messagesReplied: 1089,
      responseRate: 87.3,
      avgResponseTime: "2.4 hours"
    }
  },
  outcomes: {
    goalAchievement: [
      { goal: "Blood Pressure Control", achieved: 78, target: 89, percentage: 87.6 },
      { goal: "HbA1c Target", achieved: 67, target: 83, percentage: 80.7 },
      { goal: "Weight Loss", achieved: 45, target: 67, percentage: 67.2 },
      { goal: "Medication Adherence", achieved: 156, target: 178, percentage: 87.6 }
    ],
    trends: [
      { 
        month: "Jan", 
        bloodPressureControl: 82, 
        diabetesControl: 75, 
        weightManagement: 68,
        medicationAdherence: 89 
      },
      { 
        month: "Feb", 
        bloodPressureControl: 85, 
        diabetesControl: 78, 
        weightManagement: 71,
        medicationAdherence: 91 
      },
      { 
        month: "Mar", 
        bloodPressureControl: 87, 
        diabetesControl: 81, 
        weightManagement: 67,
        medicationAdherence: 88 
      }
    ]
  },
  qualityMetrics: {
    clinicalIndicators: [
      { name: "Preventive Care Compliance", value: 92.3, target: 95, status: "good" },
      { name: "Care Plan Adherence", value: 87.6, target: 90, status: "needs_improvement" },
      { name: "Follow-up Completion", value: 94.8, target: 95, status: "excellent" },
      { name: "Medication Reconciliation", value: 89.2, target: 85, status: "excellent" }
    ],
    patientSafety: [
      { metric: "Medication Errors", count: 3, trend: "down" },
      { metric: "Adverse Events", count: 7, trend: "stable" },
      { metric: "Readmissions (30-day)", count: 12, trend: "down" },
      { metric: "Falls", count: 2, trend: "stable" }
    ]
  }
};

export function PatientAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Hooks
  const { data: patientStats, isLoading: statsLoading } = usePatientStats();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "needs_improvement":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Patient Analytics
            </h1>
            <p className="text-muted-foreground">Comprehensive analytics and progress tracking</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.totalPatients.toLocaleString()}</p>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Patients</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.activePatients.toLocaleString()}</p>
                </div>
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">New This Month</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.newThisMonth}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">High Risk</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.riskPatients}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Adherence Rate</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.adherenceRate}%</p>
                </div>
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-xl font-bold">{mockAnalytics.overview.satisfactionScore}/5</p>
                </div>
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Patient Growth Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Patient Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">January</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">78</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">February</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                        <span className="text-sm font-medium">87</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">March</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Risk Level Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.conditions.byRisk.map((risk) => (
                      <div key={risk.level} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            risk.level === 'High Risk' ? 'bg-red-500' :
                            risk.level === 'Medium Risk' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm">{risk.level}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{risk.count}</span>
                          <span className="text-sm text-muted-foreground ml-2">({risk.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Most Common Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.conditions.mostCommon.slice(0, 5).map((condition) => (
                      <div key={condition.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{condition.name}</span>
                          {getTrendIcon(condition.trend)}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{condition.count}</span>
                          <span className="text-sm text-muted-foreground ml-2">({condition.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Patient Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Portal Usage</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Appointment Adherence</span>
                        <span>{mockAnalytics.engagement.appointmentMetrics.adherenceRate}%</span>
                      </div>
                      <Progress value={mockAnalytics.engagement.appointmentMetrics.adherenceRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Message Response Rate</span>
                        <span>{mockAnalytics.engagement.communicationStats.responseRate}%</span>
                      </div>
                      <Progress value={mockAnalytics.engagement.communicationStats.responseRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{group.range} years</span>
                          <span>{group.count} ({group.percentage}%)</span>
                        </div>
                        <Progress value={group.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.demographics.genderDistribution.map((gender) => (
                      <div key={gender.gender} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{gender.gender}</span>
                          <span>{gender.count} ({gender.percentage}%)</span>
                        </div>
                        <Progress value={gender.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conditions by Age */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Common Conditions by Age Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockAnalytics.demographics.conditionsByAge.map((condition) => (
                      <div key={condition.condition} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">{condition.condition}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Under 50</span>
                            <span>{condition.under50}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Over 50</span>
                            <span>{condition.over50}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total: {condition.under50 + condition.over50}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Most Common Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Common Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.conditions.mostCommon.map((condition) => (
                      <div key={condition.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{condition.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {condition.count} patients ({condition.percentage}%)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(condition.trend)}
                          <Badge variant="outline">{condition.trend}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Level Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.conditions.byRisk.map((risk) => (
                      <div key={risk.level} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{risk.level}</span>
                          <span>{risk.count} patients</span>
                        </div>
                        <Progress 
                          value={risk.percentage} 
                          className={`h-3 ${
                            risk.level === 'High Risk' ? '[&>div]:bg-red-500' :
                            risk.level === 'Medium Risk' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                          }`}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {risk.percentage}% of total patients
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Portal Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Portal Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Active</span>
                      <span className="font-medium">{mockAnalytics.engagement.portalUsage.daily}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Weekly Active</span>
                      <span className="font-medium">{mockAnalytics.engagement.portalUsage.weekly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Active</span>
                      <span className="font-medium">{mockAnalytics.engagement.portalUsage.monthly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Never Used</span>
                      <span className="font-medium text-red-600">{mockAnalytics.engagement.portalUsage.never}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Scheduled</span>
                      <span className="font-medium">{mockAnalytics.engagement.appointmentMetrics.scheduled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="font-medium text-green-600">{mockAnalytics.engagement.appointmentMetrics.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">No Shows</span>
                      <span className="font-medium text-red-600">{mockAnalytics.engagement.appointmentMetrics.noShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cancelled</span>
                      <span className="font-medium text-yellow-600">{mockAnalytics.engagement.appointmentMetrics.cancelled}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Adherence Rate</span>
                      <span className="font-bold">{mockAnalytics.engagement.appointmentMetrics.adherenceRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Messages Received</span>
                      <span className="font-medium">{mockAnalytics.engagement.communicationStats.messagesReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Messages Replied</span>
                      <span className="font-medium">{mockAnalytics.engagement.communicationStats.messagesReplied}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Rate</span>
                      <span className="font-medium">{mockAnalytics.engagement.communicationStats.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-medium">{mockAnalytics.engagement.communicationStats.avgResponseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Goal Achievement */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Achievement Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.outcomes.goalAchievement.map((goal) => (
                      <div key={goal.goal} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{goal.goal}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.achieved}/{goal.target} ({goal.percentage}%)
                          </span>
                        </div>
                        <Progress value={goal.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Outcome Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Outcome Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.outcomes.trends.map((trend) => (
                      <div key={trend.month} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{trend.month} 2024</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">BP Control:</span>
                            <span className="ml-2 font-medium">{trend.bloodPressureControl}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Diabetes:</span>
                            <span className="ml-2 font-medium">{trend.diabetesControl}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weight Mgmt:</span>
                            <span className="ml-2 font-medium">{trend.weightManagement}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Med Adherence:</span>
                            <span className="ml-2 font-medium">{trend.medicationAdherence}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Clinical Quality Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Quality Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.qualityMetrics.clinicalIndicators.map((indicator) => (
                      <div key={indicator.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{indicator.name}</span>
                          <Badge className={getStatusColor(indicator.status)}>
                            {indicator.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Target: {indicator.target}%</span>
                          <span>Current: {indicator.value}%</span>
                        </div>
                        <Progress value={indicator.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Safety Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Safety Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.qualityMetrics.patientSafety.map((safety) => (
                      <div key={safety.metric} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{safety.metric}</h4>
                          <p className="text-sm text-muted-foreground">
                            {safety.count} incidents this month
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(safety.trend)}
                          <Badge variant="outline">{safety.trend}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
