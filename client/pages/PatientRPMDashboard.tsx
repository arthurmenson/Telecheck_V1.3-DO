import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Droplets,
  Battery,
  CheckCircle,
  AlertTriangle,
  Camera,
  MessageSquare,
  Calendar,
  Pill,
  Target,
  TrendingUp,
  Smartphone,
  Wifi,
  Bell,
  Plus,
  Eye
} from "lucide-react";

export function PatientRPMDashboard() {
  const [selectedDevice, setSelectedDevice] = useState("glucose");

  // Mock patient data
  const patientData = {
    name: "John Smith",
    id: "PT-001",
    program: "Diabetes Management",
    enrollmentDate: "2024-01-15",
    nextAppointment: "2024-02-20"
  };

  const deviceStatus = {
    glucose: { connected: true, battery: 78, lastReading: "2 min ago" },
    bloodPressure: { connected: true, battery: 92, lastReading: "1 hour ago" },
    weight: { connected: false, battery: 45, lastReading: "2 days ago" },
    temperature: { connected: true, battery: 88, lastReading: "30 min ago" }
  };

  const todaysReadings = [
    { type: "Glucose", value: "142 mg/dL", time: "2:15 PM", status: "normal", icon: Droplets },
    { type: "Blood Pressure", value: "125/82 mmHg", time: "11:30 AM", status: "normal", icon: Heart },
    { type: "Weight", value: "184.2 lbs", time: "8:00 AM", status: "normal", icon: Weight },
    { type: "Temperature", value: "98.4°F", time: "9:15 AM", status: "normal", icon: Thermometer }
  ];

  const medications = [
    { name: "Metformin", dosage: "500mg", time: "8:00 AM", taken: true },
    { name: "Lisinopril", dosage: "10mg", time: "8:00 AM", taken: true },
    { name: "Metformin", dosage: "500mg", time: "8:00 PM", taken: false },
    { name: "Insulin", dosage: "15 units", time: "Before meals", taken: false }
  ];

  const weeklyGoals = [
    { goal: "Take glucose readings 4x daily", current: 26, target: 28, percentage: 93 },
    { goal: "Take medications as prescribed", current: 13, target: 14, percentage: 93 },
    { goal: "Check blood pressure daily", current: 6, target: 7, percentage: 86 },
    { goal: "Maintain weight under 185 lbs", current: 1, target: 1, percentage: 100 }
  ];

  const alerts = [
    {
      type: "medication",
      message: "Metformin dose due in 30 minutes",
      time: "7:30 PM",
      priority: "medium"
    },
    {
      type: "device",
      message: "Weight scale needs charging",
      time: "Today",
      priority: "low"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Health Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {patientData.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Connected
            </Badge>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Care Team
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Glucose</p>
                  <p className="text-2xl font-bold text-foreground">142 mg/dL</p>
                  <p className="text-xs text-green-600">Within range</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                  <p className="text-2xl font-bold text-foreground">125/82</p>
                  <p className="text-xs text-green-600">Normal</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                  <p className="text-2xl font-bold text-foreground">184.2 lbs</p>
                  <p className="text-xs text-yellow-600">-0.8 from goal</p>
                </div>
                <Weight className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medication Adherence</p>
                  <p className="text-2xl font-bold text-foreground">93%</p>
                  <p className="text-xs text-green-600">This week</p>
                </div>
                <Pill className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <Alert key={index} className={
                    alert.priority === "high" ? "border-red-200 bg-red-50" :
                    alert.priority === "medium" ? "border-yellow-200 bg-yellow-50" :
                    "border-blue-200 bg-blue-50"
                  }>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="readings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="readings">Today's Readings</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Today's Readings */}
          <TabsContent value="readings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Health Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todaysReadings.map((reading, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <reading.icon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{reading.type}</p>
                          <p className="text-2xl font-bold">{reading.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{reading.time}</p>
                        <Badge variant={reading.status === "normal" ? "secondary" : "destructive"}>
                          {reading.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className={`w-5 h-5 ${med.taken ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{med.time}</span>
                        {med.taken ? (
                          <Badge className="bg-green-100 text-green-800">Taken</Badge>
                        ) : (
                          <Button size="sm">Mark Taken</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(deviceStatus).map(([device, status]) => (
                    <div key={device} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5" />
                          <span className="font-medium capitalize">{device.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status.connected ? (
                            <Wifi className="w-4 h-4 text-green-600" />
                          ) : (
                            <Wifi className="w-4 h-4 text-red-600" />
                          )}
                          <Badge variant={status.connected ? "secondary" : "destructive"}>
                            {status.connected ? "Connected" : "Offline"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Battery</span>
                          <div className="flex items-center gap-2">
                            <Progress value={status.battery} className="w-16 h-2" />
                            <span className="text-sm">{status.battery}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Reading</span>
                          <span className="text-sm">{status.lastReading}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Health Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {weeklyGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.goal}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <Progress value={goal.percentage} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{goal.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Health Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    View your health data trends over time
                  </p>
                  <Button>View Detailed Trends</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Camera className="w-6 h-6" />
                <span className="text-sm">Photo Log</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Message Care Team</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Schedule Visit</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Eye className="w-6 h-6" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
