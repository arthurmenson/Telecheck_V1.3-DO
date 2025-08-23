import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Plus,
  Edit,
  Eye,
  Heart,
  Activity,
  Pill,
  TestTube2,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Paperclip,
  Image,
  FileImage,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Printer,
  Share,
  Archive,
  Star,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Circle,
} from "lucide-react";
import { usePatient, usePatientAppointments, usePatientVitals } from "../hooks/api/usePatients";
import { PatientService } from "../services/patient.service";
import { useNavigate } from "react-router-dom";

interface PatientRecordsProps {
  patientId: string;
}

// Mock data for demonstration
const mockMedicalHistory = [
  {
    id: "1",
    date: "2024-02-10",
    type: "diagnosis",
    title: "Type 2 Diabetes Mellitus",
    description: "Initial diagnosis based on elevated HbA1c levels and symptoms",
    provider: "Dr. Sarah Johnson",
    severity: "moderate",
    status: "active"
  },
  {
    id: "2", 
    date: "2024-01-15",
    type: "procedure",
    title: "Annual Physical Examination",
    description: "Comprehensive physical examination with routine screenings",
    provider: "Dr. Sarah Johnson",
    severity: "routine",
    status: "completed"
  },
  {
    id: "3",
    date: "2023-12-20",
    type: "lab",
    title: "Comprehensive Metabolic Panel",
    description: "Glucose: 145 mg/dL (elevated), Creatinine: 1.0 mg/dL (normal)",
    provider: "Quest Diagnostics",
    severity: "abnormal",
    status: "completed"
  },
  {
    id: "4",
    date: "2023-11-30",
    type: "medication",
    title: "Metformin 500mg",
    description: "Started on Metformin 500mg twice daily for diabetes management",
    provider: "Dr. Sarah Johnson",
    severity: "routine",
    status: "active"
  }
];

const mockConditions = [
  {
    id: "1",
    name: "Type 2 Diabetes Mellitus",
    icd10: "E11.9",
    dateOnset: "2024-02-10",
    status: "active",
    severity: "moderate",
    notes: "Well-controlled with Metformin. Patient shows good adherence to medication and lifestyle modifications."
  },
  {
    id: "2",
    name: "Essential Hypertension", 
    icd10: "I10",
    dateOnset: "2023-08-15",
    status: "active",
    severity: "mild",
    notes: "Controlled with lifestyle modifications. Monitor closely."
  },
  {
    id: "3",
    name: "Seasonal Allergic Rhinitis",
    icd10: "J30.1",
    dateOnset: "2020-04-01",
    status: "active",
    severity: "mild",
    notes: "Seasonal symptoms in spring and fall. Managed with antihistamines as needed."
  }
];

const mockMedications = [
  {
    id: "1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    route: "Oral",
    startDate: "2024-02-10",
    endDate: null,
    prescriber: "Dr. Sarah Johnson",
    indication: "Type 2 Diabetes",
    status: "active",
    notes: "Take with meals to reduce GI upset"
  },
  {
    id: "2",
    name: "Lisinopril",
    dosage: "10mg", 
    frequency: "Once daily",
    route: "Oral",
    startDate: "2023-08-15",
    endDate: null,
    prescriber: "Dr. Sarah Johnson", 
    indication: "Hypertension",
    status: "active",
    notes: "Monitor blood pressure regularly"
  },
  {
    id: "3",
    name: "Loratadine",
    dosage: "10mg",
    frequency: "As needed",
    route: "Oral", 
    startDate: "2023-04-01",
    endDate: null,
    prescriber: "Dr. Sarah Johnson",
    indication: "Allergic Rhinitis",
    status: "active",
    notes: "For seasonal allergies"
  }
];

const mockLabResults = [
  {
    id: "1",
    date: "2024-02-01",
    testName: "HbA1c",
    result: "7.2%",
    reference: "< 7.0%",
    status: "high",
    orderedBy: "Dr. Sarah Johnson",
    labName: "Quest Diagnostics"
  },
  {
    id: "2",
    date: "2024-02-01", 
    testName: "Fasting Glucose",
    result: "145 mg/dL",
    reference: "70-100 mg/dL",
    status: "high",
    orderedBy: "Dr. Sarah Johnson",
    labName: "Quest Diagnostics"
  },
  {
    id: "3",
    date: "2024-02-01",
    testName: "Total Cholesterol",
    result: "185 mg/dL",
    reference: "< 200 mg/dL",
    status: "normal",
    orderedBy: "Dr. Sarah Johnson",
    labName: "Quest Diagnostics"
  },
  {
    id: "4",
    date: "2024-02-01",
    testName: "Blood Pressure",
    result: "138/85 mmHg",
    reference: "< 120/80 mmHg",
    status: "high",
    orderedBy: "Dr. Sarah Johnson",
    labName: "In-office"
  }
];

const mockDocuments = [
  {
    id: "1",
    name: "Physical Examination Report",
    type: "Clinical Note",
    date: "2024-02-10",
    provider: "Dr. Sarah Johnson",
    size: "2.4 MB",
    format: "PDF"
  },
  {
    id: "2",
    name: "Lab Results - Comprehensive Panel",
    type: "Lab Report",
    date: "2024-02-01",
    provider: "Quest Diagnostics",
    size: "1.8 MB",
    format: "PDF"
  },
  {
    id: "3",
    name: "Chest X-Ray",
    type: "Imaging",
    date: "2024-01-15",
    provider: "Radiology Associates",
    size: "5.2 MB",
    format: "DICOM"
  },
  {
    id: "4",
    name: "Insurance Card",
    type: "Administrative",
    date: "2024-01-01",
    provider: "Patient Upload",
    size: "0.8 MB",
    format: "JPG"
  }
];

export function PatientRecords({ patientId }: PatientRecordsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const navigate = useNavigate();

  // Hooks - load dependencies sequentially to reduce API load
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  // Only load appointments and vitals if we have a valid patient
  const hasValidPatient = patient && !('_error' in patient);
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments(patientId, hasValidPatient);
  const { data: vitals, isLoading: vitalsLoading } = usePatientVitals(patientId, 20, 0, hasValidPatient);

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if patient data has an error (fallback data with _error field)
  const hasPatientError = patient && '_error' in patient;

  if (!patient || hasPatientError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ehr/intake')}
              className="gap-2 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Patient Intake
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">
              Patient Records - ID: {patientId}
            </span>
          </div>

          {/* Patient Not Found */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Patient Record Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The patient record for ID <code className="bg-muted px-2 py-1 rounded">{patientId}</code> could not be found.
              </p>
              {hasPatientError && patient && '_error' in patient && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {(patient as any)._error}
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-blue-900 mb-1">Possible Reasons:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• This may be an intake ID that hasn't been converted to a patient record yet</li>
                      <li>• The patient may not have completed the intake process</li>
                      <li>• The patient ID format may be invalid</li>
                      <li>• You may not have permission to view this patient</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate('/ehr/intake')}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Patient Intake
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/patient-registry')}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800",
      high: "bg-red-100 text-red-800",
      normal: "bg-green-100 text-green-800",
      abnormal: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
      case "severe":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "moderate":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "mild":
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ehr/intake')}
            className="gap-2 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Patient Intake
          </Button>
          <span>/</span>
          <span className="text-foreground font-medium">
            Patient Records - {patient ? PatientService.formatPatientName(patient) : `ID: ${patientId}`}
          </span>
        </div>

        {/* Patient Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {PatientService.formatPatientName(patient)}
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Age: {PatientService.calculateAge(patient.dateOfBirth)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      MRN: {patient.mrn}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {patient.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {patient.phone && PatientService.formatPhoneNumber(patient.phone)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button size="sm" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMedicalHistory.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getSeverityIcon(item.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{item.title}</h4>
                              <Badge className={getStatusBadge(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                              <span>{item.provider}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Active Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockConditions.filter(c => c.status === 'active').map((condition) => (
                        <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{condition.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ICD-10: {condition.icd10} • Since {new Date(condition.dateOnset).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusBadge(condition.severity)}>
                            {condition.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockMedications.filter(m => m.status === 'active').map((medication) => (
                        <div key={medication.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{medication.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} {medication.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {medication.indication}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube2 className="w-5 h-5 text-primary" />
                      Recent Lab Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockLabResults.slice(0, 3).map((lab) => (
                        <div key={lab.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{lab.testName}</h4>
                            <Badge className={getStatusBadge(lab.status)} variant="outline">
                              {lab.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{lab.result}</p>
                          <p className="text-xs text-muted-foreground">
                            Ref: {lab.reference}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Allergies & Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        patient.allergies.map((allergy, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                            <span className="text-sm font-medium text-red-800">{allergy}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No known allergies</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Medical History Timeline
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="diagnosis">Diagnoses</SelectItem>
                        <SelectItem value="procedure">Procedures</SelectItem>
                        <SelectItem value="lab">Lab Results</SelectItem>
                        <SelectItem value="medication">Medications</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMedicalHistory.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index < mockMedicalHistory.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-16 bg-border"></div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {item.type === 'diagnosis' && <Stethoscope className="w-5 h-5 text-primary" />}
                          {item.type === 'procedure' && <Activity className="w-5 h-5 text-primary" />}
                          {item.type === 'lab' && <TestTube2 className="w-5 h-5 text-primary" />}
                          {item.type === 'medication' && <Pill className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1 p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.type}</Badge>
                              <Badge className={getStatusBadge(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span>{item.provider}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Conditions & Diagnoses
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockConditions.map((condition) => (
                    <Card key={condition.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{condition.name}</h3>
                              <Badge className={getStatusBadge(condition.status)}>
                                {condition.status}
                              </Badge>
                              <Badge className={getStatusBadge(condition.severity)} variant="outline">
                                {condition.severity}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                              <div>
                                <span className="font-medium">ICD-10 Code:</span> {condition.icd10}
                              </div>
                              <div>
                                <span className="font-medium">Date of Onset:</span> {new Date(condition.dateOnset).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm">{condition.notes}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Current Medications
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Indication</TableHead>
                      <TableHead>Prescriber</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMedications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell className="font-medium">{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                        <TableCell>{medication.indication}</TableCell>
                        <TableCell>{medication.prescriber}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(medication.status)}>
                            {medication.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube2 className="w-5 h-5 text-primary" />
                    Laboratory Results
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lab Result
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Ordered By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLabResults.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.testName}</TableCell>
                        <TableCell>{lab.result}</TableCell>
                        <TableCell>{lab.reference}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(lab.status)}>
                            {lab.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(lab.date).toLocaleDateString()}</TableCell>
                        <TableCell>{lab.orderedBy}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Documents & Files
                  </CardTitle>
                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            {document.format === 'PDF' && <FileText className="w-5 h-5 text-primary" />}
                            {document.format === 'JPG' && <FileImage className="w-5 h-5 text-primary" />}
                            {document.format === 'DICOM' && <Image className="w-5 h-5 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{document.name}</h4>
                            <p className="text-xs text-muted-foreground">{document.type}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(document.date).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground">{document.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Record Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medical Record</DialogTitle>
              <DialogDescription>
                Select the type of record you want to add
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedRecordType('condition')}
              >
                <Heart className="w-6 h-6" />
                <span>Condition</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedRecordType('medication')}
              >
                <Pill className="w-6 h-6" />
                <span>Medication</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedRecordType('lab')}
              >
                <TestTube2 className="w-6 h-6" />
                <span>Lab Result</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedRecordType('document')}
              >
                <FileText className="w-6 h-6" />
                <span>Document</span>
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
