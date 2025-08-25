import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Thermometer,
  Weight,
  Droplets,
  Activity,
  CheckCircle,
  AlertTriangle,
  Upload,
  Clock,
  TrendingUp,
  Target,
  Camera,
  Smartphone,
} from "lucide-react";

export function VitalSubmission() {
  const [vitals, setVitals] = useState({
    glucose: "",
    systolic: "",
    diastolic: "",
    weight: "",
    temperature: "",
    heartRate: "",
    oxygenSat: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState<{
    submitted: boolean;
    alerts: Array<{ type: string; message: string; severity: string }>;
  }>({ submitted: false, alerts: [] });

  const handleVitalChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Simulate API call
    const alerts = [];

    // Check thresholds (simplified)
    if (parseFloat(vitals.glucose) > 180) {
      alerts.push({
        type: "glucose_high",
        message: "Blood glucose is elevated. Care team has been notified.",
        severity: "medium",
      });
    }

    if (
      parseFloat(vitals.systolic) > 140 ||
      parseFloat(vitals.diastolic) > 90
    ) {
      alerts.push({
        type: "bp_high",
        message: "Blood pressure is elevated. Please monitor closely.",
        severity: "medium",
      });
    }

    setSubmissionStatus({ submitted: true, alerts });
  };

  const vitalHistory = [
    {
      date: "2024-02-15",
      glucose: "142 mg/dL",
      bp: "125/82 mmHg",
      weight: "184.2 lbs",
      status: "normal",
    },
    {
      date: "2024-02-14",
      glucose: "156 mg/dL",
      bp: "128/84 mmHg",
      weight: "184.5 lbs",
      status: "normal",
    },
    {
      date: "2024-02-13",
      glucose: "189 mg/dL",
      bp: "135/87 mmHg",
      weight: "185.1 lbs",
      status: "elevated",
    },
  ];

  const deviceConnections = [
    {
      name: "Glucose Meter",
      model: "OneTouch Verio",
      connected: true,
      lastSync: "2 min ago",
    },
    {
      name: "Blood Pressure Monitor",
      model: "Omron 10 Series",
      connected: true,
      lastSync: "1 hour ago",
    },
    {
      name: "Smart Scale",
      model: "Withings Body+",
      connected: false,
      lastSync: "2 days ago",
    },
    {
      name: "Pulse Oximeter",
      model: "ChoiceMMed MD300",
      connected: true,
      lastSync: "30 min ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Daily Vitals Check-in
            </h1>
            <p className="text-muted-foreground">
              Submit your daily health readings
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Secure Transmission
          </Badge>
        </div>

        {/* Submission Success Alert */}
        {submissionStatus.submitted && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-green-800 font-medium">
                  Vitals submitted successfully!
                </p>
                {submissionStatus.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border ${
                      alert.severity === "medium"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                        : ""
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="submit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="submit">Submit Vitals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="devices">Connected Devices</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Submit Vitals */}
          <TabsContent value="submit" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Glucose */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Blood Glucose
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
                    <Input
                      id="glucose"
                      type="number"
                      placeholder="Enter glucose level"
                      value={vitals.glucose}
                      onChange={(e) =>
                        handleVitalChange("glucose", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target range: 80-130 mg/dL (fasting)
                  </div>
                  <Button variant="outline" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo of Reading
                  </Button>
                </CardContent>
              </Card>

              {/* Blood Pressure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">Systolic</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={vitals.systolic}
                        onChange={(e) =>
                          handleVitalChange("systolic", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">Diastolic</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={vitals.diastolic}
                        onChange={(e) =>
                          handleVitalChange("diastolic", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: Less than 130/80 mmHg
                  </div>
                  <Button variant="outline" className="w-full">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Sync from Device
                  </Button>
                </CardContent>
              </Card>

              {/* Weight */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="w-5 h-5 text-purple-600" />
                    Weight
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      value={vitals.weight}
                      onChange={(e) =>
                        handleVitalChange("weight", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Goal: Maintain within 2 lbs of target
                  </div>
                  <Button variant="outline" className="w-full">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Sync from Scale
                  </Button>
                </CardContent>
              </Card>

              {/* Temperature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={vitals.temperature}
                      onChange={(e) =>
                        handleVitalChange("temperature", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Normal range: 97.0 - 99.0°F
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      Oral
                    </Button>
                    <Button variant="outline" size="sm">
                      Temporal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Vitals (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={vitals.heartRate}
                      onChange={(e) =>
                        handleVitalChange("heartRate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSat">Oxygen Saturation (%)</Label>
                    <Input
                      id="oxygenSat"
                      type="number"
                      placeholder="98"
                      value={vitals.oxygenSat}
                      onChange={(e) =>
                        handleVitalChange("oxygenSat", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Ready to submit?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your care team will review these readings and contact you
                      if needed.
                    </p>
                  </div>
                  <Button onClick={handleSubmit} className="px-8">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Vitals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Vitals History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vitalHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{entry.date}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Glucose: {entry.glucose}</p>
                          <p>BP: {entry.bp}</p>
                          <p>Weight: {entry.weight}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          entry.status === "normal"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Devices */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Health Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceConnections.map((device, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge
                            variant={
                              device.connected ? "secondary" : "destructive"
                            }
                          >
                            {device.connected ? "Connected" : "Offline"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last sync: {device.lastSync}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          {device.connected ? "Sync" : "Connect"}
                        </Button>
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
      </div>
    </div>
  );
}
