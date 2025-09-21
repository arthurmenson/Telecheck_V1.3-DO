import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Monitor,
  AlertTriangle,
  Activity,
  Users,
  Smartphone,
  TrendingUp,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Calendar,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Battery,
  Wifi,
  Heart,
  Droplets,
  Weight,
  Thermometer,
  Bell,
  Target,
  BarChart3,
  Download,
} from "lucide-react";

export function RPMCommandCenter() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock RPM patient data
  const rpmPatients = [
    {
      id: "PT-001",
      name: "Margaret Thompson",
      age: 67,
      condition: "Diabetes Type 2",
      riskLevel: "medium",
      lastReading: "5 min ago",
      deviceStatus: "connected",
      alerts: 2,
      compliance: 94,
      readings: {
        glucose: { value: "185 mg/dL", status: "high", time: "5 min ago" },
        bp: { value: "142/88 mmHg", status: "elevated", time: "2 hours ago" },
        weight: { value: "164.2 lbs", status: "normal", time: "1 day ago" },
      },
    },
    {
      id: "PT-002",
      name: "Robert Chen",
      age: 72,
      condition: "Hypertension + CHF",
      riskLevel: "high",
      lastReading: "12 min ago",
      deviceStatus: "connected",
      alerts: 1,
      compliance: 87,
      readings: {
        bp: { value: "165/95 mmHg", status: "high", time: "12 min ago" },
        weight: { value: "198.5 lbs", status: "elevated", time: "30 min ago" },
        hr: { value: "88 bpm", status: "normal", time: "45 min ago" },
      },
    },
    {
      id: "PT-003",
      name: "Sarah Williams",
      age: 58,
      condition: "Diabetes Type 1",
      riskLevel: "low",
      lastReading: "1 hour ago",
      deviceStatus: "offline",
      alerts: 0,
      compliance: 98,
      readings: {
        glucose: { value: "142 mg/dL", status: "normal", time: "1 hour ago" },
        bp: { value: "118/76 mmHg", status: "normal", time: "3 hours ago" },
      },
    },
    {
      id: "PT-004",
      name: "David Rodriguez",
      age: 45,
      condition: "Pre-diabetes",
      riskLevel: "low",
      lastReading: "3 min ago",
      deviceStatus: "connected",
      alerts: 0,
      compliance: 92,
      readings: {
        glucose: { value: "128 mg/dL", status: "normal", time: "3 min ago" },
        weight: { value: "189.8 lbs", status: "normal", time: "2 hours ago" },
      },
    },
  ];

  const systemStats = {
    totalPatients: 847,
    activePatients: 734,
    criticalAlerts: 12,
    deviceConnectivity: 94.2,
    complianceRate: 89.7,
    avgReadingsPerDay: 3.4,
  };

  const recentAlerts = [
    {
      patientId: "PT-001",
      patientName: "Margaret Thompson",
      type: "glucose_high",
      value: "185 mg/dL",
      threshold: "180 mg/dL",
      time: "5 min ago",
      severity: "medium",
      acknowledged: false,
    },
    {
      patientId: "PT-002",
      patientName: "Robert Chen",
      type: "bp_high",
      value: "165/95 mmHg",
      threshold: "160/90 mmHg",
      time: "12 min ago",
      severity: "high",
      acknowledged: true,
    },
    {
      patientId: "PT-005",
      patientName: "Linda Johnson",
      type: "weight_gain",
      value: "3.2 lbs increase",
      threshold: "2 lbs",
      time: "1 hour ago",
      severity: "medium",
      acknowledged: false,
    },
  ];

  const getFilteredPatients = () => {
    let filtered = rpmPatients;

    if (activeFilter !== "all") {
      filtered = filtered.filter((patient) => {
        if (activeFilter === "alerts") return patient.alerts > 0;
        if (activeFilter === "offline")
          return patient.deviceStatus === "offline";
        if (activeFilter === "high-risk") return patient.riskLevel === "high";
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
      );
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
      case "elevated":
        return "text-red-600";
      case "normal":
        return "text-green-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Monitor className="w-8 h-8 text-primary" />
              RPM Command Center
            </h1>
            <p className="text-muted-foreground">
              Real-time remote patient monitoring dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configure Alerts
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.totalPatients}
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
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {systemStats.activePatients}
                  </p>
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
                    Critical Alerts
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {systemStats.criticalAlerts}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Device Connectivity
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.deviceConnectivity}%
                  </p>
                </div>
                <Wifi className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Compliance Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.complianceRate}%
                  </p>
                </div>
                <Target className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Readings/Day
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.avgReadingsPerDay}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <Alert
                  key={index}
                  className={
                    alert.severity === "high"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{alert.patientName}</span>{" "}
                        - {alert.type.replace("_", " ")}
                        <span className="block text-sm text-muted-foreground">
                          {alert.value} (threshold: {alert.threshold}) •{" "}
                          {alert.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.acknowledged ? (
                          <Badge className="bg-green-100 text-green-800">
                            Acknowledged
                          </Badge>
                        ) : (
                          <Button size="sm">Acknowledge</Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Patient Monitor</TabsTrigger>
            <TabsTrigger value="devices">Device Status</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Patient Monitor */}
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Monitor</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={activeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          activeFilter === "alerts" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveFilter("alerts")}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Alerts
                      </Button>
                      <Button
                        variant={
                          activeFilter === "offline" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveFilter("offline")}
                      >
                        Offline
                      </Button>
                      <Button
                        variant={
                          activeFilter === "high-risk" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveFilter("high-risk")}
                      >
                        High Risk
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredPatients().map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {patient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {patient.id} • Age {patient.age} •{" "}
                              {patient.condition}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getRiskLevelColor(patient.riskLevel)}
                            >
                              {patient.riskLevel} risk
                            </Badge>
                            <Badge
                              variant={
                                patient.deviceStatus === "connected"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {patient.deviceStatus}
                            </Badge>
                            {patient.alerts > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {patient.alerts} alert
                                {patient.alerts > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Last reading: {patient.lastReading}
                          </span>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Readings</p>
                          <div className="space-y-1">
                            {Object.entries(patient.readings).map(
                              ([type, reading]) => (
                                <div
                                  key={type}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="capitalize">{type}:</span>
                                  <span
                                    className={getStatusColor(reading.status)}
                                  >
                                    {reading.value}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Compliance</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={patient.compliance}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium">
                              {patient.compliance}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Device Status</p>
                          <div className="flex items-center gap-2">
                            {patient.deviceStatus === "connected" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">
                              {patient.deviceStatus}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Quick Actions</p>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Status */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Connectivity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Device Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Monitor and manage connected RPM devices
                  </p>
                  <Button>View Device Status</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  RPM Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Performance Analytics
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed analytics and performance metrics
                  </p>
                  <Button>View Analytics Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RPM Billing Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Billing Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Track RPM billing codes and reimbursements
                  </p>
                  <Button>View Billing Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
