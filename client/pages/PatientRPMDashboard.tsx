import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  PatientService,
  LabService,
  MedicationService,
  VitalsService,
} from "@/services/api.service";
import { PatientProfileCompletion } from "@/components/PatientProfileCompletion";
import {
  usePatientStats,
  useDebouncedPatientSearch,
  usePatient as usePatientQuery,
  usePatientAppointments,
  usePatientVitals,
} from "@/hooks/api/usePatients";
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
  Eye,
} from "lucide-react";

export function PatientRPMDashboard() {
  const [selectedDevice, setSelectedDevice] = useState("glucose");
  const [patientData, setPatientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const isDoctor = user?.role === "doctor";

  const setPatientQueryParam = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (id) {
        next.set("patientId", id);
      } else {
        next.delete("patientId");
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (!isDoctor && !patientId && user?.id) {
      setPatientQueryParam(user.id);
    }
  }, [isDoctor, patientId, setPatientQueryParam, user?.id]);

  useEffect(() => {
    setError(null);
  }, [patientId]);

  if (isDoctor) {
    return (
      <DoctorPatientRPMView
        initialPatientId={patientId}
        onSelectPatient={setPatientQueryParam}
      />
    );
  }

  useEffect(() => {
    if (isDoctor) {
      return;
    }

    const fetchPatientData = async () => {
      if (!patientId) {
        setIsLoading(false);
        setError("No patient ID provided");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [patientRes, labsRes, medsRes, vitalsRes] = await Promise.all([
          PatientService.getPatientById(patientId),
          LabService.getResults(patientId),
          MedicationService.getMedications(patientId),
          VitalsService.getVitalSigns(patientId),
        ]);

        if (patientRes.success && patientRes.data) {
          const patient = patientRes.data;
          const patientProfile = {
            name: `${patient.firstName} ${patient.lastName}`,
            id: patient.id,
            program: patient.program || "Not enrolled",
            enrollmentDate: patient.enrollmentDate || "Not set",
            nextAppointment: patient.nextAppointment || "Not scheduled",
            // Add other patient data
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            allergies: patient.allergies || [],
            emergencyContacts: patient.emergencyContacts || {},
            insuranceInfo: patient.insuranceInfo || {},
          };

          setPatientData(patientProfile);
          setLabs(Array.isArray(labsRes?.data) ? labsRes.data : []);
          setMedications(
            Array.isArray(medsRes?.data)
              ? medsRes.data
              : Array.isArray((medsRes as any)?.medications)
                ? (medsRes as any).medications
                : [],
          );
          setVitals(
            Array.isArray((vitalsRes as any)?.data)
              ? (vitalsRes as any).data
              : Array.isArray(vitalsRes)
                ? (vitalsRes as any[])
                : [],
          );

          // Check if profile needs completion (has default/empty values)
          const needsCompletion =
            !patient.dateOfBirth ||
            patient.dateOfBirth === "1900-01-01" ||
            !patient.gender ||
            (patient.allergies && patient.allergies.length === 0) ||
            !patient.emergencyContacts?.name ||
            !patient.insuranceInfo?.provider;

          setShowProfileCompletion(needsCompletion);
        } else {
          // Initialize empty profile for new users
          setPatientData({
            name: user?.name ?? "Pending Patient",
            id: user?.id ?? patientId ?? "unknown",
            program: "Not enrolled",
            enrollmentDate: "Not set",
            nextAppointment: "Not scheduled",
            dateOfBirth: null,
            gender: null,
            allergies: [],
            emergencyContacts: {},
            insuranceInfo: {},
          });
          setShowProfileCompletion(true);
          setLabs([]);
          setMedications([]);
          setVitals([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to load patient data. Please try again later.");

        // Initialize empty profile on error
        setPatientData({
          name: user?.name || "Unknown Patient",
          id: patientId || user?.id || "unknown",
          program: "Not enrolled",
          enrollmentDate: "Not set",
          nextAppointment: "Not scheduled",
          dateOfBirth: null,
          gender: null,
          allergies: [],
          emergencyContacts: {},
          insuranceInfo: {},
        });
        setShowProfileCompletion(true);
        setLabs([]);
        setMedications([]);
        setVitals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, isDoctor, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state if no patient data
  if (!patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No patient data available</p>
        </div>
      </div>
    );
  }

  // Show profile completion for new users
  if (showProfileCompletion) {
    return (
      <div
        className="min-h-screen bg-background p-6"
        data-testid="rpm-dashboard"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              My Health Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete your profile to unlock personalized remote monitoring.
            </p>
          </div>
          <PatientProfileCompletion
            onComplete={() => {
              setShowProfileCompletion(false);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  const deviceStatus = {
    glucose: { connected: true, battery: 78, lastReading: "2 min ago" },
    bloodPressure: { connected: true, battery: 92, lastReading: "1 hour ago" },
    weight: { connected: false, battery: 45, lastReading: "2 days ago" },
    temperature: { connected: true, battery: 88, lastReading: "30 min ago" },
  } as const;

  const latestVitals = vitals.slice(0, 4).map((vital, index) => ({
    id:
      vital.id ??
      vital.recorded_at ??
      vital.recordedAt ??
      `vital-${index}-${vital.user_id ?? "unknown"}`,
    recordedAt: vital.recorded_at ?? vital.recordedAt,
    heartRate: vital.heart_rate ?? vital.heartRate,
    bloodPressureSystolic:
      vital.blood_pressure_systolic ?? vital.bloodPressureSystolic,
    bloodPressureDiastolic:
      vital.blood_pressure_diastolic ?? vital.bloodPressureDiastolic,
    temperature: vital.temperature,
    oxygenSaturation: vital.oxygen_saturation ?? vital.oxygenSaturation,
    weight: vital.weight,
  }));

  const activeMeds = medications.filter((med) => med.isActive !== false);

  const weeklyAdherence = useMemo(() => {
    const readingCount = vitals.slice(0, 10).length;
    const medicationCount = activeMeds.length;

    if (readingCount === 0 && medicationCount === 0) return null;

    return {
      readings: {
        goal: "Record vitals readings",
        current: readingCount,
        target: 10,
        percentage: Math.min(100, Math.round((readingCount / 10) * 100)),
      },
      medications: {
        goal: "Active medications",
        current: medicationCount,
        target: Math.max(medicationCount, 1),
        percentage: medicationCount > 0 ? 100 : 0,
      },
    };
  }, [activeMeds, vitals]);

  const alerts = useMemo(() => {
    const items: Array<{
      type: string;
      message: string;
      time: string;
      priority: "low" | "medium" | "high";
    }> = [];

    const latestVital = latestVitals[0];
    if (latestVital) {
      const weight = parseFloat(latestVital.weight ?? "0");
      if (!Number.isNaN(weight) && weight > 200) {
        items.push({
          type: "vital",
          message: `Recent weight reading ${weight} lbs exceeds threshold`,
          time: "Latest vital",
          priority: "medium",
        });
      }

      const systolic = parseInt(latestVital.bloodPressureSystolic ?? "0", 10);
      const diastolic = parseInt(latestVital.bloodPressureDiastolic ?? "0", 10);
      if (systolic > 140 || diastolic > 90) {
        items.push({
          type: "vital",
          message: `Blood pressure ${systolic}/${diastolic} flagged for review`,
          time: "Latest vital",
          priority: "high",
        });
      }
    }

    activeMeds
      .filter((med) => med.isActive && med.instructions)
      .slice(0, 2)
      .forEach((med) => {
        items.push({
          type: "medication",
          message: `${med.name} — ${med.instructions}`,
          time: "Medication plan",
          priority: "low",
        });
      });

    return items;
  }, [activeMeds, latestVitals]);

  return (
    <div className="min-h-screen bg-background p-6" data-testid="rpm-dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Health Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {patientData.name}
            </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Glucose
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    142 mg/dL
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Blood Pressure
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Weight
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    184.2 lbs
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Medication Adherence
                  </p>
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
                  <Alert
                    key={index}
                    className={
                      alert.priority === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <span className="text-xs text-muted-foreground">
                          {alert.time}
                        </span>
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
            <TabsTrigger value="readings">
              {isDoctor ? "Vitals" : "My Vitals"}
            </TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
          </TabsList>

          {/* Vital Readings */}
          <TabsContent value="readings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Vital Readings</CardTitle>
              </CardHeader>
              <CardContent>
                {latestVitals.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No vital readings recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestVitals.map((reading) => {
                      const testTime = formatTime(reading.recordedAt);
                      return (
                        <div
                          key={reading.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(reading.recordedAt)}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              {reading.heartRate ? (
                                <Badge variant="outline" className="gap-1">
                                  <Heart className="w-3 h-3" />
                                  {reading.heartRate} bpm
                                </Badge>
                              ) : null}
                              {reading.bloodPressureSystolic &&
                              reading.bloodPressureDiastolic ? (
                                <Badge variant="outline" className="gap-1">
                                  <Activity className="w-3 h-3" />
                                  {reading.bloodPressureSystolic}/
                                  {reading.bloodPressureDiastolic}
                                </Badge>
                              ) : null}
                              {reading.weight ? (
                                <Badge variant="outline" className="gap-1">
                                  <Weight className="w-3 h-3" />
                                  {reading.weight} lbs
                                </Badge>
                              ) : null}
                              {reading.oxygenSaturation ? (
                                <Badge variant="outline" className="gap-1">
                                  <Droplets className="w-3 h-3" />
                                  {reading.oxygenSaturation}% SpO₂
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {testTime}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medication Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeMeds.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6 text-center">
                      No active medications on file.
                    </div>
                  ) : (
                    activeMeds.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Pill className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground capitalize">
                            {med.frequency ?? "As prescribed"}
                          </span>
                          {med.prescribedBy ? (
                            <Badge variant="secondary" className="capitalize">
                              {med.prescribedBy}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs */}
          <TabsContent value="labs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lab Results</CardTitle>
              </CardHeader>
              <CardContent>
                {labs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No lab results recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labs.slice(0, 6).map((lab) => (
                      <div
                        key={lab.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{lab.testName}</p>
                            <p className="text-xs text-muted-foreground">
                              {lab.labName ?? "Telecheck Labs"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              lab.status === "normal"
                                ? "secondary"
                                : "destructive"
                            }
                            className="capitalize"
                          >
                            {lab.status ?? "pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">
                            {lab.value} {lab.unit}
                          </span>
                          <span className="text-muted-foreground">
                            Ref. Range: {lab.referenceRange ?? "—"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>{formatDate(lab.testDate)}</span>
                          {lab.doctorNotes ? (
                            <span>{lab.doctorNotes}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          <span className="font-medium capitalize">
                            {device.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {status.connected ? (
                            <Wifi className="w-4 h-4 text-green-600" />
                          ) : (
                            <Wifi className="w-4 h-4 text-red-600" />
                          )}
                          <Badge
                            variant={
                              status.connected ? "secondary" : "destructive"
                            }
                          >
                            {status.connected ? "Connected" : "Offline"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Battery
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={status.battery}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">{status.battery}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Last Reading
                          </span>
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
                  {weeklyAdherence ? (
                    Object.values(weeklyAdherence).map((goal) => (
                      <div key={goal.goal} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal.goal}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target}
                          </span>
                        </div>
                        <Progress value={goal.percentage} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-sm font-medium">
                            {goal.percentage}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Complete your first readings and medications to see goals.
                    </div>
                  )}
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

function DoctorPatientRPMView({
  initialPatientId,
  onSelectPatient,
}: {
  initialPatientId?: string | null;
  onSelectPatient: (patientId: string | null) => void;
}) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<string | undefined>(undefined);

  const patientsQuery = useDebouncedPatientSearch(
    { scope: "supervisor" },
    page,
    10,
    300,
  );

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    filters,
    setFilters,
    isSearching,
  } = patientsQuery;

  useEffect(() => {
    setFilters((prev) => ({ ...prev, scope: "supervisor" }));
  }, [setFilters]);

  const { data: stats } = usePatientStats();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialPatientId ?? null,
  );

  useEffect(() => {
    if (initialPatientId && initialPatientId !== selectedPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, selectedPatientId]);

  const patients = searchData?.patients ?? [];
  const totalPatients = searchData?.total ?? 0;
  const totalPages = Math.max(searchData?.totalPages ?? 1, 1);

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      const nextId =
        initialPatientId &&
        patients.some((patient) => patient.id === initialPatientId)
          ? initialPatientId
          : patients[0].id;
      setSelectedPatientId(nextId);
      if (!initialPatientId || nextId !== initialPatientId) {
        onSelectPatient(nextId);
      }
    }
  }, [selectedPatientId, patients, initialPatientId, onSelectPatient]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    onSelectPatient(patientId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setQuery(value.length > 0 ? value : undefined);
    setFilters((prev) => ({
      ...prev,
      query: value.length > 0 ? value : undefined,
    }));
    setPage(1);
  };

  const {
    data: patientDetails,
    isLoading: patientLoading,
    isError: patientHasError,
    error: patientError,
  } = usePatientQuery(selectedPatientId ?? "", !!selectedPatientId);

  const { data: vitalsData = [], isLoading: vitalsLoading } = usePatientVitals(
    selectedPatientId ?? "",
    6,
    0,
    !!selectedPatientId,
  );

  const { data: appointmentsData = [], isLoading: appointmentsLoading } =
    usePatientAppointments(selectedPatientId ?? "", !!selectedPatientId);

  const statCards = [
    { label: "Total Patients", value: stats?.total_patients ?? 0 },
    { label: "Active", value: stats?.active_patients ?? 0 },
    { label: "Inactive", value: stats?.inactive_patients ?? 0 },
    { label: "Senior", value: stats?.senior_patients ?? 0 },
  ];

  const recentVitals = vitalsData.slice(0, 5);
  const appointments = appointmentsData.slice(0, 4);

  const renderPatientList = () => {
    if (searchLoading && patients.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Loading patients...
        </div>
      );
    }

    if (patients.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No patients found. Adjust your search filters.
        </div>
      );
    }

    return patients.map((patient) => {
      const isActive = patient.id === selectedPatientId;
      return (
        <button
          key={patient.id}
          type="button"
          onClick={() => handlePatientSelect(patient.id)}
          className={`w-full text-left rounded-lg border px-3 py-3 transition ${
            isActive
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-muted-foreground break-words">
                {patient.email}
              </p>
            </div>
            <Badge
              variant={isActive ? "default" : "outline"}
              className="capitalize"
            >
              {patient.status || "active"}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>MRN: {patient.mrn || "—"}</span>
            {patient.lastAppointment ? (
              <span>Last visit: {formatDate(patient.lastAppointment)}</span>
            ) : null}
          </div>
        </button>
      );
    });
  };

  const patientErrorMessage =
    patientError instanceof Error
      ? patientError.message
      : "Unable to load patient record. Please select another patient.";

  const emergencyContact = patientDetails?.emergencyContacts;
  const emergencyContactDisplay = emergencyContact?.name
    ? `${emergencyContact.name}${
        emergencyContact.phone ? ` • ${emergencyContact.phone}` : ""
      }`
    : "—";

  const insuranceProvider = patientDetails?.insuranceInfo?.provider
    ? patientDetails.insuranceInfo.provider
    : typeof patientDetails?.insuranceInfo === "string"
      ? patientDetails.insuranceInfo
      : "—";

  const infoBlocks = patientDetails
    ? [
        {
          label: "Date of Birth",
          value: formatDate(patientDetails.dateOfBirth),
        },
        { label: "Age", value: calculateAge(patientDetails.dateOfBirth) },
        { label: "Phone", value: patientDetails.phone || "—" },
        { label: "Insurance", value: insuranceProvider },
        {
          label: "Primary Provider",
          value: patientDetails.primaryProviderId || "—",
        },
        { label: "Emergency Contact", value: emergencyContactDisplay },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Remote Monitoring Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor enrolled patients, review their vitals, and stay ahead of
            clinical alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <CardTitle className="text-2xl">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Monitored Patients</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search across all patients participating in remote monitoring.
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search patients by name or email"
                value={filters.query ?? ""}
                onChange={handleSearchChange}
                aria-label="Search patients"
              />
              <div className="mt-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {(isSearching || searchFetching) && patients.length > 0 ? (
                  <div className="py-2 text-xs text-muted-foreground text-center">
                    Updating results...
                  </div>
                ) : null}
                {renderPatientList()}
              </div>

              {totalPatients > 0 && (
                <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
                  <div>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {Math.min((page - 1) * pageSize + 1, totalPatients)}
                    </span>
                    {" - "}
                    <span className="font-medium text-foreground">
                      {Math.min(page * pageSize, totalPatients)}
                    </span>
                    {" of "}
                    <span className="font-medium text-foreground">
                      {totalPatients.toLocaleString()}
                    </span>
                    {" patients"}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Overview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Clinical snapshot for the selected patient.
                </p>
              </CardHeader>
              <CardContent>
                {!selectedPatientId ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Select a patient to review their monitoring data.
                  </div>
                ) : patientLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Loading patient record...
                  </div>
                ) : patientHasError || !patientDetails ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{patientErrorMessage}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">
                          {patientDetails.firstName} {patientDetails.lastName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {patientDetails.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          {patientDetails.status || "active"}
                        </Badge>
                        {patientDetails.mrn ? (
                          <Badge variant="outline">
                            MRN {patientDetails.mrn}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {infoBlocks.map((block) => (
                        <div
                          key={block.label}
                          className="rounded-lg border border-border/60 p-3"
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {block.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {block.value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link to={`/ehr/intake?patientId=${patientDetails.id}`}>
                          Open Intake
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/patient-management">Patient Registry</Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Vitals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest submitted readings from connected devices or manual
                  entry.
                </p>
              </CardHeader>
              <CardContent>
                {!selectedPatientId ? (
                  <p className="text-sm text-muted-foreground">
                    Select a patient to view recent vitals.
                  </p>
                ) : vitalsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading vitals...
                  </p>
                ) : recentVitals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No vitals recorded for this patient yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentVitals.map((vital) => (
                      <div
                        key={vital.id}
                        className="rounded-lg border border-border/60 p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDateTime(vital.readingDate)}</span>
                          {vital.recordedBy ? (
                            <span>Recorded by {vital.recordedBy}</span>
                          ) : null}
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(vital.vitalSignsData || {}).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="rounded-md bg-muted/50 p-2"
                              >
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                  {formatValue(value)}
                                </p>
                              </div>
                            ),
                          )}
                          {Object.keys(vital.vitalSignsData || {}).length ===
                            0 && (
                            <p className="text-sm text-muted-foreground col-span-full">
                              No structured values recorded for this reading.
                            </p>
                          )}
                        </div>
                        {vital.notes ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Notes: {vital.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent and upcoming visits for coordination with the care
                  team.
                </p>
              </CardHeader>
              <CardContent>
                {!selectedPatientId ? (
                  <p className="text-sm text-muted-foreground">
                    Select a patient to view appointment history.
                  </p>
                ) : appointmentsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading appointments...
                  </p>
                ) : appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No appointments recorded for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-lg border border-border/60 p-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {appointment.appointmentType || "Appointment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.providerName || "Telecheck Provider"}
                          </p>
                          {appointment.duration ? (
                            <p className="text-xs text-muted-foreground">
                              Duration: {appointment.duration} mins
                            </p>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatDateTime(appointment.appointmentDate)}
                          </p>
                          <p className="capitalize">
                            {appointment.status || "scheduled"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calculateAge(value?: string | null): string {
  if (!value) return "—";
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "—";
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return `${age}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number")
    return Number.isFinite(value) ? value.toString() : "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return "—";
    }
  }
  return String(value);
}
