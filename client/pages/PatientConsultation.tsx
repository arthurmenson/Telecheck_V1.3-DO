import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { CompactAIScribe } from "../components/CompactAIScribe";
import { FeatureExplainer } from "../components/FeatureExplainer";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageCircle,
  FileText,
  Pill,
  TestTube,
  Heart,
  Activity,
  Brain,
  Save,
  Send,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Thermometer,
  Weight,
  Ruler,
  Camera,
  Mic,
  X,
  Plus,
  Settings,
} from "lucide-react";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  insuranceProvider: string;
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  lastVisit: string;
  appointmentType: string;
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: string;
    oxygenSaturation: number;
  };
}

export function PatientConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isScribeExpanded, setIsScribeExpanded] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isConsultationStarted, setIsConsultationStarted] = useState(false);

  // Mock patient data
  const [patientData] = useState<PatientData>({
    id: patientId || "1",
    name: "Sarah Johnson",
    age: 45,
    gender: "Female",
    dateOfBirth: "1979-03-15",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    address: "123 Main St, City, State 12345",
    emergencyContact: "John Johnson (Spouse) - (555) 987-6543",
    insuranceProvider: "Blue Cross Blue Shield",
    allergies: ["Penicillin", "Shellfish"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"],
    medicalHistory: ["Hypertension", "Type 2 Diabetes", "Osteoarthritis"],
    lastVisit: "2024-01-10",
    appointmentType: "Follow-up Consultation",
    chiefComplaint: "Chest pain and shortness of breath",
    vitalSigns: {
      bloodPressure: "142/88",
      heartRate: 78,
      temperature: 98.6,
      weight: 165,
      height: "5'6\"",
      oxygenSaturation: 98,
    },
  });

  const startConsultation = () => {
    setIsConsultationStarted(true);
    setActiveTab("consultation");
  };

  const endConsultation = () => {
    setIsConsultationStarted(false);
    // Save consultation data
    console.log("Ending consultation and saving data");
  };

  const handleScribeTranscription = (transcript: string, soapNote?: string) => {
    if (soapNote) {
      setConsultationNotes(soapNote);
    }
  };

  const addPrescription = () => {
    const newPrescription = {
      id: Date.now(),
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    };
    setPrescriptions([...prescriptions, newPrescription]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/doctor-dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-primary" />
                Patient Consultation
              </h1>
              <p className="text-muted-foreground">
                {patientData.name} • {patientData.appointmentType}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isConsultationStarted ? (
              <Button
                onClick={startConsultation}
                className="bg-green-600 hover:bg-green-700"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Consultation
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScribeExpanded(!isScribeExpanded)}
                  className={isScribeExpanded ? "bg-primary text-white" : ""}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  AI Scribe
                </Button>
                <Button variant="destructive" onClick={endConsultation}>
                  <X className="w-4 h-4 mr-2" />
                  End Consultation
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{patientData.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{patientData.age} years old</span>
                    <span>{patientData.gender}</span>
                    <span>
                      DOB:{" "}
                      {new Date(patientData.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {patientData.insuranceProvider}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">
                  Chief Complaint
                </div>
                <div className="font-medium">{patientData.chiefComplaint}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Last Visit:{" "}
                  {new Date(patientData.lastVisit).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Patient Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">BP:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.bloodPressure}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">HR:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.heartRate} bpm
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.temperature}°F
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">O2 Sat:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.oxygenSaturation}%
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Weight:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.weight} lbs
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Height:</span>
                    <div className="font-medium">
                      {patientData.vitalSigns.height}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-3 h-3 mr-1" />
                  Update Vitals
                </Button>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {patientData.allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="text-xs"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patientData.medications.map((medication, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-muted/30 rounded"
                    >
                      {medication}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {patientData.medicalHistory.map((condition, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {condition}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="consultation">Consultation</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Type:
                        </span>
                        <div className="font-medium">
                          {patientData.appointmentType}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Chief Complaint:
                        </span>
                        <div className="font-medium">
                          {patientData.chiefComplaint}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Scheduled:
                        </span>
                        <div className="font-medium">Today, 10:30 AM</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Phone:
                        </span>
                        <div className="font-medium">{patientData.phone}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Email:
                        </span>
                        <div className="font-medium">{patientData.email}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Emergency Contact:
                        </span>
                        <div className="font-medium text-sm">
                          {patientData.emergencyContact}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Consultation Tab */}
              <TabsContent value="consultation">
                {isConsultationStarted ? (
                  <div className="space-y-4">
                    {/* Consultation Status */}
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Consultation in Progress
                          </span>
                          <Badge variant="secondary">Started at 10:30 AM</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Scribe Integration */}
                    {isScribeExpanded ? (
                      <CompactAIScribe
                        patientName={patientData.name}
                        appointmentType={patientData.appointmentType}
                        onTranscriptionComplete={handleScribeTranscription}
                        isExpanded={true}
                        onToggleExpand={() => setIsScribeExpanded(false)}
                      />
                    ) : (
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Brain className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-blue-800 dark:text-blue-200">
                                  AI Scribe Available
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-300">
                                  Click to start recording and automatic
                                  note-taking
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => setIsScribeExpanded(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Mic className="w-4 h-4 mr-2" />
                              Start AI Scribe
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="h-20 flex-col">
                        <Pill className="w-5 h-5 mb-1" />
                        <span className="text-xs">Prescribe</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <TestTube className="w-5 h-5 mb-1" />
                        <span className="text-xs">Lab Order</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-xs">Take Photo</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <FileText className="w-5 h-5 mb-1" />
                        <span className="text-xs">Referral</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        Ready to Start Consultation
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Click "Start Consultation" to begin your session with{" "}
                        {patientData.name}
                      </p>
                      <Button
                        onClick={startConsultation}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Consultation
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Consultation Notes
                      <FeatureExplainer
                        title="Consultation Notes"
                        description="Document patient encounter details, examination findings, and clinical decisions."
                        features={[
                          "SOAP note format",
                          "Auto-save functionality",
                          "AI assistance available",
                          "Template integration",
                        ]}
                        size="sm"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="Enter consultation notes here... AI Scribe can auto-populate this section."
                      className="min-h-64"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Enhance
                      </Button>
                      <Button>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        Prescriptions
                      </CardTitle>
                      <Button onClick={addPrescription}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prescription
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {prescriptions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>
                          No prescriptions yet. Click "Add Prescription" to get
                          started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prescriptions.map((prescription, index) => (
                          <div
                            key={prescription.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Input placeholder="Medication name" />
                              <Input placeholder="Dosage" />
                              <Input placeholder="Frequency" />
                              <Input placeholder="Duration" />
                            </div>
                            <Textarea
                              placeholder="Special instructions"
                              className="mt-3"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      Lab Orders & Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>
                        No lab orders yet. Add orders as needed during the
                        consultation.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Compact AI Scribe Widget (when not expanded) */}
        {isConsultationStarted && !isScribeExpanded && (
          <CompactAIScribe
            patientName={patientData.name}
            appointmentType={patientData.appointmentType}
            onTranscriptionComplete={handleScribeTranscription}
            isExpanded={false}
            onToggleExpand={() => setIsScribeExpanded(true)}
          />
        )}
      </div>
    </div>
  );
}
