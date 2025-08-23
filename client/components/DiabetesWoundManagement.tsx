import React, { useState, useRef } from "react";
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
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  Camera,
  Upload,
  Eye,
  Ruler,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Phone,
  User,
  Activity,
  Target,
  Droplets,
  Thermometer,
  Bandage,
  Stethoscope,
  Heart,
  Shield,
  BarChart3,
  Download,
  Edit,
  Plus,
  X,
  Info,
  Zap,
  Award,
  MapPin,
  Footprints,
  Image,
  Calendar as CalendarIcon,
  Timer,
  Flag,
  Star,
  Users
} from "lucide-react";

interface WoundLocation {
  id: string;
  name: string;
  anatomicalLocation: string;
  coordinates: { x: number; y: number };
  riskFactors: string[];
}

interface WoundMeasurement {
  length: number;
  width: number;
  depth: number;
  undermining: number;
  tunneling: number;
  area: number;
  volume: number;
  timestamp: string;
  measuredBy: string;
}

interface WoundPhoto {
  id: string;
  url: string;
  timestamp: string;
  type: "overview" | "detail" | "measurement";
  annotations: Array<{
    x: number;
    y: number;
    text: string;
    type: "measurement" | "concern" | "improvement";
  }>;
}

interface WoundAssessment {
  id: string;
  patientId: string;
  patientName: string;
  woundId: string;
  location: WoundLocation;
  stage: 1 | 2 | 3 | 4 | "unstageable" | "DTPI";
  measurements: WoundMeasurement;
  photos: WoundPhoto[];
  tissueType: {
    granulation: number;
    slough: number;
    eschar: number;
    epithelial: number;
  };
  exudate: {
    amount: "none" | "minimal" | "moderate" | "heavy";
    type: "serous" | "serosanguineous" | "sanguineous" | "purulent";
    odor: "none" | "mild" | "moderate" | "strong";
  };
  periwoundSkin: {
    intact: boolean;
    macerated: boolean;
    dry: boolean;
    erythematous: boolean;
    indurated: boolean;
  };
  pain: {
    scale: number; // 0-10
    type: "none" | "aching" | "burning" | "stabbing" | "throbbing";
    triggers: string[];
  };
  infection: {
    suspected: boolean;
    signs: string[];
    cultureOrdered: boolean;
    antibiotics: string[];
  };
  healingProgress: "deteriorating" | "no_change" | "improving" | "healed";
  riskScore: number;
  interventions: string[];
  nextAssessment: string;
  notes: string;
  assessedBy: string;
  timestamp: string;
}

const woundLocations: WoundLocation[] = [
  {
    id: "plantar_heel_right",
    name: "Right Heel (Plantar)",
    anatomicalLocation: "Right foot - heel plantar surface",
    coordinates: { x: 85, y: 90 },
    riskFactors: ["Pressure", "Limited mobility", "Poor circulation"]
  },
  {
    id: "plantar_heel_left", 
    name: "Left Heel (Plantar)",
    anatomicalLocation: "Left foot - heel plantar surface",
    coordinates: { x: 15, y: 90 },
    riskFactors: ["Pressure", "Limited mobility", "Poor circulation"]
  },
  {
    id: "great_toe_right",
    name: "Right Great Toe",
    anatomicalLocation: "Right foot - great toe",
    coordinates: { x: 75, y: 10 },
    riskFactors: ["Pressure", "Tight footwear", "Neuropathy"]
  },
  {
    id: "metatarsal_right",
    name: "Right Metatarsal Head",
    anatomicalLocation: "Right foot - metatarsal head",
    coordinates: { x: 70, y: 40 },
    riskFactors: ["Pressure", "Callus formation", "High plantar pressure"]
  }
];

const mockWoundAssessments: WoundAssessment[] = [
  {
    id: "wound_001",
    patientId: "rpm_001",
    patientName: "Margaret Thompson",
    woundId: "W001",
    location: woundLocations[0],
    stage: 2,
    measurements: {
      length: 2.3,
      width: 1.8,
      depth: 0.4,
      undermining: 0.2,
      tunneling: 0,
      area: 4.14,
      volume: 1.66,
      timestamp: "2024-01-15T10:00:00",
      measuredBy: "Maria Rodriguez, RN"
    },
    photos: [
      {
        id: "photo_001",
        url: "/wound-photos/wound_001_overview.jpg",
        timestamp: "2024-01-15T10:05:00",
        type: "overview",
        annotations: []
      }
    ],
    tissueType: {
      granulation: 60,
      slough: 30,
      eschar: 5,
      epithelial: 5
    },
    exudate: {
      amount: "moderate",
      type: "serosanguineous",
      odor: "mild"
    },
    periwoundSkin: {
      intact: false,
      macerated: true,
      dry: false,
      erythematous: true,
      indurated: false
    },
    pain: {
      scale: 4,
      type: "aching",
      triggers: ["Weight bearing", "Dressing changes"]
    },
    infection: {
      suspected: false,
      signs: [],
      cultureOrdered: false,
      antibiotics: []
    },
    healingProgress: "improving",
    riskScore: 68,
    interventions: [
      "Hydrocolloid dressing",
      "Pressure offloading",
      "Daily inspection",
      "Glucose control &lt;180 mg/dL"
    ],
    nextAssessment: "2024-01-18T10:00:00",
    notes: "Wound showing signs of granulation tissue formation. Periwound maceration noted - adjust dressing frequency.",
    assessedBy: "Maria Rodriguez, RN, CWS",
    timestamp: "2024-01-15T10:30:00"
  }
];

export function DiabetesWoundManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWound, setSelectedWound] = useState<WoundAssessment | null>(null);
  const [assessments, setAssessments] = useState<WoundAssessment[]>(mockWoundAssessments);
  const [newAssessment, setNewAssessment] = useState<Partial<WoundAssessment>>({});
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeWounds = assessments.filter(w => w.healingProgress !== "healed");
  const healedWounds = assessments.filter(w => w.healingProgress === "healed");
  const highRiskWounds = assessments.filter(w => w.riskScore > 70);
  const avgHealingTime = 14; // Mock data

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { color: "destructive", text: "High Risk" };
    if (score >= 60) return { color: "warning", text: "Moderate Risk" };
    return { color: "success", text: "Low Risk" };
  };

  const getHealingTrend = (assessment: WoundAssessment) => {
    // Mock trend calculation based on last measurements
    const trend = Math.random() > 0.5 ? "improving" : "stable";
    return trend;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Mock photo upload
      const newPhoto: WoundPhoto = {
        id: `photo_${Date.now()}`,
        url: URL.createObjectURL(files[0]),
        timestamp: new Date().toISOString(),
        type: "overview",
        annotations: []
      };
      
      if (selectedWound) {
        const updatedWound = {
          ...selectedWound,
          photos: [...selectedWound.photos, newPhoto]
        };
        setAssessments(assessments.map(w => w.id === selectedWound.id ? updatedWound : w));
        setSelectedWound(updatedWound);
      }
    }
  };

  const startNewAssessment = () => {
    setNewAssessment({
      id: `wound_${Date.now()}`,
      patientId: "rpm_001",
      patientName: "New Patient",
      woundId: `W${String(assessments.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      assessedBy: "Current User",
      stage: 1,
      healingProgress: "no_change",
      riskScore: 50
    });
    setActiveTab("assessment");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Diabetes Wound Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive wound tracking and diabetic foot ulcer management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Footprints className="w-4 h-4" />
            {activeWounds.length} Active Wounds
          </Badge>
          <Button onClick={startNewAssessment}>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Wounds</p>
                <div className="text-2xl font-bold">{activeWounds.length}</div>
                <p className="text-sm text-muted-foreground">Under treatment</p>
              </div>
              <Bandage className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <div className="text-2xl font-bold text-red-600">{highRiskWounds.length}</div>
                <p className="text-sm text-muted-foreground">Need attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Healing Time</p>
                <div className="text-2xl font-bold">{avgHealingTime}</div>
                <p className="text-sm text-green-600">days (improving)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healed This Month</p>
                <div className="text-2xl font-bold text-green-600">{healedWounds.length}</div>
                <p className="text-sm text-muted-foreground">Successful outcomes</p>
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
          <TabsTrigger value="wounds">Wounds</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active Wound Monitoring</CardTitle>
                <CardDescription>Wounds requiring ongoing care and attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeWounds.map((wound) => (
                  <Card key={wound.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          wound.riskScore >= 80 ? "bg-red-500" :
                          wound.riskScore >= 60 ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <div>
                          <h4 className="font-medium">{wound.patientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {wound.location.name} • Stage {wound.stage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRiskBadge(wound.riskScore).color as any}>
                          {getRiskBadge(wound.riskScore).text}
                        </Badge>
                        <Badge variant={
                          wound.healingProgress === "improving" ? "default" :
                          wound.healingProgress === "deteriorating" ? "destructive" : "secondary"
                        }>
                          {wound.healingProgress}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Size: </span>
                        <span className="font-medium">
                          {wound.measurements.length} × {wound.measurements.width} cm
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Area: </span>
                        <span className="font-medium">{wound.measurements.area.toFixed(1)} cm²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last assessed: </span>
                        <span className="font-medium">
                          {new Date(wound.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => setSelectedWound(wound)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next assessment: {new Date(wound.nextAssessment).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      <strong>Margaret Thompson</strong> - Wound deteriorating, infection suspected
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      2 wounds overdue for assessment
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      3 patients with glucose levels &gt;180 mg/dL affecting healing
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" onClick={startNewAssessment}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Wound Assessment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Photo Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Wound Specialist
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wounds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wound Registry</CardTitle>
              <CardDescription>Complete wound tracking and management system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((wound) => (
                  <Card key={wound.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-lg border-2 ${
                            wound.healingProgress === "improving" ? "border-green-500 bg-green-50" :
                            wound.healingProgress === "deteriorating" ? "border-red-500 bg-red-50" :
                            "border-gray-300 bg-gray-50"
                          } flex items-center justify-center`}>
                            <Footprints className={`w-8 h-8 ${
                              wound.healingProgress === "improving" ? "text-green-600" :
                              wound.healingProgress === "deteriorating" ? "text-red-600" :
                              "text-gray-600"
                            }`} />
                          </div>
                          <Badge 
                            className="absolute -top-2 -right-2 text-xs"
                            variant={wound.stage === 1 || wound.stage === 2 ? "secondary" : "destructive"}
                          >
                            Stage {wound.stage}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{wound.patientName}</h4>
                            <Badge variant="outline">{wound.woundId}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {wound.location.name} • {wound.location.anatomicalLocation}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Dimensions:</span>
                              <p className="font-medium">
                                {wound.measurements.length}×{wound.measurements.width}×{wound.measurements.depth} cm
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Area:</span>
                              <p className="font-medium">{wound.measurements.area.toFixed(1)} cm²</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk Score:</span>
                              <p className={`font-medium ${getRiskColor(wound.riskScore)}`}>
                                {wound.riskScore}/100
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pain Level:</span>
                              <p className="font-medium">{wound.pain.scale}/10</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-2">
                          <Badge variant={
                            wound.healingProgress === "improving" ? "default" :
                            wound.healingProgress === "deteriorating" ? "destructive" :
                            wound.healingProgress === "healed" ? "success" : "secondary"
                          }>
                            {wound.healingProgress.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getRiskBadge(wound.riskScore).color as any}>
                            {getRiskBadge(wound.riskScore).text}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => setSelectedWound(wound)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {wound.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Latest Notes:</strong> {wound.notes}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assessed by {wound.assessedBy} on {new Date(wound.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wound Assessment</CardTitle>
              <CardDescription>
                Comprehensive diabetic wound evaluation and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient & Wound Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input 
                    id="patientName" 
                    placeholder="Enter patient name"
                    value={newAssessment.patientName || ""}
                    onChange={(e) => setNewAssessment({...newAssessment, patientName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="woundId">Wound ID</Label>
                  <Input 
                    id="woundId" 
                    placeholder="Auto-generated"
                    value={newAssessment.woundId || ""}
                    disabled
                  />
                </div>
                <div>
                  <Label>Wound Location</Label>
                  <Select onValueChange={(value) => {
                    const location = woundLocations.find(l => l.id === value);
                    if (location) {
                      setNewAssessment({...newAssessment, location});
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {woundLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Wound Stage & Measurements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Wound Classification</h4>
                  <div>
                    <Label>Wound Stage</Label>
                    <Select onValueChange={(value) => setNewAssessment({...newAssessment, stage: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Stage 1 - Intact skin with non-blanchable redness</SelectItem>
                        <SelectItem value="2">Stage 2 - Partial thickness skin loss</SelectItem>
                        <SelectItem value="3">Stage 3 - Full thickness skin loss</SelectItem>
                        <SelectItem value="4">Stage 4 - Full thickness tissue loss</SelectItem>
                        <SelectItem value="unstageable">Unstageable</SelectItem>
                        <SelectItem value="DTPI">Deep Tissue Pressure Injury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Measurements (cm)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input 
                        id="length" 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width</Label>
                      <Input 
                        id="width" 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="depth">Depth</Label>
                      <Input 
                        id="depth" 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tissue Type */}
              <div>
                <h4 className="font-medium mb-4">Tissue Type Distribution (%)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="granulation">Granulation</Label>
                    <Input 
                      id="granulation" 
                      type="number" 
                      placeholder="0-100"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slough">Slough</Label>
                    <Input 
                      id="slough" 
                      type="number" 
                      placeholder="0-100"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eschar">Eschar</Label>
                    <Input 
                      id="eschar" 
                      type="number" 
                      placeholder="0-100"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="epithelial">Epithelial</Label>
                    <Input 
                      id="epithelial" 
                      type="number" 
                      placeholder="0-100"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Exudate Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Exudate Amount</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exudate Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serous">Serous</SelectItem>
                      <SelectItem value="serosanguineous">Serosanguineous</SelectItem>
                      <SelectItem value="sanguineous">Sanguineous</SelectItem>
                      <SelectItem value="purulent">Purulent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Odor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select odor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pain Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pain Scale (0-10)</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <span>0</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      className="flex-1"
                    />
                    <span>10</span>
                  </div>
                </div>
                <div>
                  <Label>Pain Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="aching">Aching</SelectItem>
                      <SelectItem value="burning">Burning</SelectItem>
                      <SelectItem value="stabbing">Stabbing</SelectItem>
                      <SelectItem value="throbbing">Throbbing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assessment Notes */}
              <div>
                <Label htmlFor="assessmentNotes">Assessment Notes</Label>
                <Textarea 
                  id="assessmentNotes"
                  placeholder="Document wound appearance, progress, concerns, and treatment plan..."
                  className="min-h-[100px]"
                  value={newAssessment.notes || ""}
                  onChange={(e) => setNewAssessment({...newAssessment, notes: e.target.value})}
                />
              </div>

              {/* Photo Documentation */}
              <div>
                <h4 className="font-medium mb-4">Photo Documentation</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Take or upload wound photos for documentation
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={() => setIsPhotoCaptureOpen(true)}>
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    multiple
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => setActiveTab("overview")}>
                  Cancel
                </Button>
                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Documentation</CardTitle>
              <CardDescription>Visual wound tracking and progress monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.flatMap(wound => 
                  wound.photos.map(photo => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <Image className="w-16 h-16 text-gray-400" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{wound.patientName}</h5>
                          <Badge variant="outline">{photo.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {wound.location.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Healing Progress Analytics</CardTitle>
                <CardDescription>Wound outcomes and healing trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">Healing Rate</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">21</div>
                    <div className="text-sm text-muted-foreground">Avg Days to Heal</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">12%</div>
                    <div className="text-sm text-muted-foreground">Recurrence Rate</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-muted-foreground">Documentation Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors Impact</CardTitle>
                <CardDescription>Factors affecting wound healing outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Glucose Control (&lt;180 mg/dL)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={78} className="w-20 h-2" />
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Pressure Offloading</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={95} className="w-20 h-2" />
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Infection Prevention</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={88} className="w-20 h-2" />
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Patient Education</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={72} className="w-20 h-2" />
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>
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
