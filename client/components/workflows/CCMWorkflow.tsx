import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Calendar,
  Clock,
  Phone,
  Video,
  MessageSquare,
  FileText,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  User,
  UserCheck,
  ClipboardList,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Star,
  Flag,
  ArrowRight,
  Timer,
  Zap,
  Shield,
  Award,
  Bell
} from "lucide-react";

interface CCMPatient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  riskLevel: "low" | "moderate" | "high";
  lastContact: string;
  nextScheduled: string;
  careCoordinator: string;
  monthlyMinutes: number;
  billingStatus: "eligible" | "completed" | "pending";
  goals: CCMGoal[];
  medications: number;
  vitals: {
    bloodPressure: string;
    weight: string;
    heartRate: number;
    lastUpdated: string;
  };
}

interface CCMGoal {
  id: string;
  description: string;
  target: string;
  current: string;
  progress: number;
  dueDate: string;
  status: "on-track" | "needs-attention" | "achieved";
  interventions: string[];
}

interface CCMEncounter {
  id: string;
  patientId: string;
  date: string;
  duration: number;
  type: "scheduled" | "urgent" | "followup";
  coordinator: string;
  notes: string;
  goals_reviewed: number;
  medications_reconciled: boolean;
  vitals_reviewed: boolean;
  care_plan_updated: boolean;
  patient_education: string[];
  next_steps: string[];
  billingCode: string;
}

const mockCCMPatients: CCMPatient[] = [
  {
    id: "ccm_001",
    name: "Margaret Thompson",
    age: 68,
    conditions: ["Type 2 Diabetes", "Hypertension", "CHF"],
    riskLevel: "high",
    lastContact: "2024-01-15T14:30:00",
    nextScheduled: "2024-01-22T10:00:00",
    careCoordinator: "Maria Rodriguez, RN",
    monthlyMinutes: 45,
    billingStatus: "eligible",
    goals: [
      {
        id: "goal_1",
        description: "Achieve A1C < 7.5%",
        target: "7.5%",
        current: "7.8%",
        progress: 70,
        dueDate: "2024-03-01",
        status: "needs-attention",
        interventions: ["Medication adjustment", "Nutrition counseling"]
      },
      {
        id: "goal_2", 
        description: "Weight loss 10 lbs",
        target: "165 lbs",
        current: "172 lbs",
        progress: 30,
        dueDate: "2024-04-01",
        status: "on-track",
        interventions: ["Diet modification", "Exercise plan"]
      }
    ],
    medications: 8,
    vitals: {
      bloodPressure: "138/82",
      weight: "172 lbs",
      heartRate: 78,
      lastUpdated: "2024-01-15"
    }
  },
  {
    id: "ccm_002",
    name: "Robert Chen",
    age: 72,
    conditions: ["COPD", "Diabetes", "CAD"],
    riskLevel: "moderate",
    lastContact: "2024-01-14T16:00:00",
    nextScheduled: "2024-01-21T14:00:00",
    careCoordinator: "Jennifer Park, RN",
    monthlyMinutes: 32,
    billingStatus: "completed",
    goals: [
      {
        id: "goal_3",
        description: "Reduce hospitalizations",
        target: "0 admissions",
        current: "1 in 6 months",
        progress: 80,
        dueDate: "2024-06-01",
        status: "on-track",
        interventions: ["Medication adherence", "Home monitoring"]
      }
    ],
    medications: 12,
    vitals: {
      bloodPressure: "128/75",
      weight: "185 lbs",
      heartRate: 82,
      lastUpdated: "2024-01-14"
    }
  }
];

const billingCodes = {
  "99490": "CCM services; first 20 minutes",
  "99491": "CCM services; each additional 20 minutes",
  "99487": "Complex CCM; first 60 minutes", 
  "99489": "Complex CCM; each additional 30 minutes"
};

export function CCMWorkflow() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatient, setSelectedPatient] = useState<CCMPatient | null>(null);
  const [patients, setPatients] = useState<CCMPatient[]>(mockCCMPatients);
  const [encounters, setEncounters] = useState<CCMEncounter[]>([]);
  const [newEncounter, setNewEncounter] = useState<Partial<CCMEncounter>>({});

  const totalPatients = patients.length;
  const highRiskPatients = patients.filter(p => p.riskLevel === "high").length;
  const avgMonthlyMinutes = patients.reduce((sum, p) => sum + p.monthlyMinutes, 0) / patients.length;
  const billingCompliance = Math.round((patients.filter(p => p.billingStatus === "completed").length / patients.length) * 100);

  const handleStartEncounter = (patient: CCMPatient) => {
    setSelectedPatient(patient);
    setNewEncounter({
      id: `enc_${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString(),
      type: "scheduled",
      coordinator: patient.careCoordinator,
      notes: "",
      goals_reviewed: 0,
      medications_reconciled: false,
      vitals_reviewed: false,
      care_plan_updated: false,
      patient_education: [],
      next_steps: [],
      billingCode: "99490"
    });
    setActiveTab("encounter");
  };

  const completeEncounter = () => {
    if (newEncounter.id && selectedPatient) {
      const encounter: CCMEncounter = {
        ...newEncounter,
        duration: 25, // Mock duration
        notes: newEncounter.notes || "",
        goals_reviewed: newEncounter.goals_reviewed || 0,
        medications_reconciled: newEncounter.medications_reconciled || false,
        vitals_reviewed: newEncounter.vitals_reviewed || false,
        care_plan_updated: newEncounter.care_plan_updated || false,
        patient_education: newEncounter.patient_education || [],
        next_steps: newEncounter.next_steps || [],
        billingCode: newEncounter.billingCode || "99490"
      } as CCMEncounter;

      setEncounters([...encounters, encounter]);
      
      // Update patient
      setPatients(patients.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, lastContact: encounter.date, monthlyMinutes: p.monthlyMinutes + encounter.duration }
          : p
      ));

      setSelectedPatient(null);
      setNewEncounter({});
      setActiveTab("overview");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Chronic Care Management (CCM)
          </h1>
          <p className="text-muted-foreground">
            Comprehensive care coordination for complex chronic conditions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {totalPatients} Active Patients
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Enroll Patient
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-sm text-green-600">+3 this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <div className="text-2xl font-bold text-red-600">{highRiskPatients}</div>
                <p className="text-sm text-muted-foreground">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Minutes/Month</p>
                <div className="text-2xl font-bold">{Math.round(avgMonthlyMinutes)}</div>
                <p className="text-sm text-blue-600">Above CMS minimum</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billing Compliance</p>
                <div className="text-2xl font-bold text-green-600">{billingCompliance}%</div>
                <p className="text-sm text-muted-foreground">Documentation complete</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="encounter">Encounter</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Upcoming CCM encounters and check-ins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        patient.riskLevel === "high" ? "bg-red-500" :
                        patient.riskLevel === "moderate" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(patient.nextScheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{patient.monthlyMinutes} min</Badge>
                      <Button size="sm" onClick={() => handleStartEncounter(patient)}>
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Care Gaps & Alerts</CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Margaret Thompson</strong> - A1C above target (7.8%), missed last appointment
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <strong>Robert Chen</strong> - Monthly minutes below CMS requirement (32/60 min)
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    3 patients due for medication reconciliation this week
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CCM Patient Registry</CardTitle>
              <CardDescription>Enrolled patients and their care status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <Card key={patient.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          patient.riskLevel === "high" ? "bg-red-500" :
                          patient.riskLevel === "moderate" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {patient.age} • {patient.conditions.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={patient.riskLevel === "high" ? "destructive" : "outline"}>
                          {patient.riskLevel} risk
                        </Badge>
                        <Badge variant={patient.billingStatus === "completed" ? "default" : "secondary"}>
                          {patient.billingStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Care Coordinator</Label>
                        <p className="font-medium">{patient.careCoordinator}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Monthly Minutes</Label>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{patient.monthlyMinutes}/60</p>
                          <Progress value={(patient.monthlyMinutes / 60) * 100} className="flex-1 h-2" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Active Goals</Label>
                        <p className="font-medium">{patient.goals.length} goals</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Last Contact</Label>
                        <p className="font-medium">{new Date(patient.lastContact).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleStartEncounter(patient)}>
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next: {new Date(patient.nextScheduled).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encounter" className="space-y-4">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle>CCM Encounter - {selectedPatient.name}</CardTitle>
                <CardDescription>
                  Document care coordination activities and patient interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="encounterType">Encounter Type</Label>
                    <Select onValueChange={(value) => setNewEncounter({...newEncounter, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled Check-in</SelectItem>
                        <SelectItem value="urgent">Urgent Contact</SelectItem>
                        <SelectItem value="followup">Follow-up Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="billingCode">Billing Code</Label>
                    <Select onValueChange={(value) => setNewEncounter({...newEncounter, billingCode: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select code" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(billingCodes).map(([code, description]) => (
                          <SelectItem key={code} value={code}>
                            {code} - {description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Timer className="w-4 h-4" />
                      <span className="font-medium">25 minutes</span>
                      <Button size="sm" variant="outline">Start Timer</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Care Activities (Check all completed)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="vitals" 
                          checked={newEncounter.vitals_reviewed}
                          onCheckedChange={(checked) => setNewEncounter({...newEncounter, vitals_reviewed: !!checked})}
                        />
                        <Label htmlFor="vitals">Vital signs reviewed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="medications" 
                          checked={newEncounter.medications_reconciled}
                          onCheckedChange={(checked) => setNewEncounter({...newEncounter, medications_reconciled: !!checked})}
                        />
                        <Label htmlFor="medications">Medication reconciliation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="carePlan" 
                          checked={newEncounter.care_plan_updated}
                          onCheckedChange={(checked) => setNewEncounter({...newEncounter, care_plan_updated: !!checked})}
                        />
                        <Label htmlFor="carePlan">Care plan updated</Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Goals Reviewed</Label>
                        <Select onValueChange={(value) => setNewEncounter({...newEncounter, goals_reviewed: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Number of goals" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} goals</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="encounterNotes">Encounter Notes</Label>
                  <Textarea 
                    id="encounterNotes"
                    placeholder="Document patient conversation, care activities, and clinical observations..."
                    className="min-h-[120px]"
                    value={newEncounter.notes}
                    onChange={(e) => setNewEncounter({...newEncounter, notes: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Patient Education Topics</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Medication adherence", "Diet modification", "Exercise plan", "Symptom monitoring", "Emergency protocols", "Device usage"].map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox 
                          id={topic}
                          checked={newEncounter.patient_education?.includes(topic)}
                          onCheckedChange={(checked) => {
                            const education = newEncounter.patient_education || [];
                            if (checked) {
                              setNewEncounter({...newEncounter, patient_education: [...education, topic]});
                            } else {
                              setNewEncounter({...newEncounter, patient_education: education.filter(t => t !== topic)});
                            }
                          }}
                        />
                        <Label htmlFor={topic}>{topic}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveTab("overview")}>
                    Cancel
                  </Button>
                  <Button onClick={completeEncounter}>
                    Complete Encounter
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Encounter</h3>
                <p className="text-muted-foreground mb-4">
                  Select a patient from the overview or patients tab to start a CCM encounter.
                </p>
                <Button onClick={() => setActiveTab("patients")}>
                  View Patients
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Goals & Outcomes</CardTitle>
              <CardDescription>Track progress on care plan goals across all CCM patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {patients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{patient.name}</h4>
                    <Badge variant="outline">{patient.goals.length} active goals</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {patient.goals.map((goal) => (
                      <div key={goal.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{goal.description}</h5>
                          <Badge variant={
                            goal.status === "achieved" ? "default" :
                            goal.status === "on-track" ? "secondary" : "destructive"
                          }>
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <span>Target: {goal.target}</span>
                          <span>Current: {goal.current}</span>
                          <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                        </div>
                        <Progress value={goal.progress} className="h-2 mb-2" />
                        <div className="flex flex-wrap gap-1">
                          {goal.interventions.map((intervention, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {intervention}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Billing Summary</CardTitle>
                <CardDescription>January 2024 CCM billing overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">$1,245</div>
                    <div className="text-sm text-muted-foreground">Total Billed</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm text-muted-foreground">Billable Encounters</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-muted-foreground">Compliance Rate</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">580</div>
                    <div className="text-sm text-muted-foreground">Total Minutes</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Billing Code Distribution</h5>
                  {Object.entries(billingCodes).map(([code, description]) => (
                    <div key={code} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <span className="font-medium">{code}</span>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Badge variant="outline">
                        {code === "99490" ? "12" : code === "99491" ? "6" : code === "99487" ? "2" : "1"} uses
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Compliance</CardTitle>
                <CardDescription>CMS requirements and documentation status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Compliant:</strong> All patients have &gt;20 minutes monthly contact and documented care plans.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h5 className="font-medium">CMS Requirements Status</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comprehensive care plan</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24/7 access to care team</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly patient contact</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Care coordination</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medication management</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Billing Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className, htmlFor, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  htmlFor?: string;
  [key: string]: any;
}) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}
