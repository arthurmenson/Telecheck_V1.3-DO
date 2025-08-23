import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Dna,
  Calendar,
  TrendingUp,
  Shield,
  Brain,
  Sparkles,
  Info,
  Eye,
  RefreshCw,
  Zap,
  Activity,
  Heart,
  Leaf,
  Book,
  BarChart3,
  Settings,
  AlertCircle,
} from "lucide-react";
import { AITreatmentRecommendations } from "../components/AITreatmentRecommendations";

export function Medications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock herbal medicines the user is taking
  const currentHerbals = [
    { name: "Turmeric", dosage: "500mg daily", startDate: "2024-01-01" },
    { name: "Ginkgo Biloba", dosage: "120mg daily", startDate: "2023-12-15" },
    { name: "Garlic Extract", dosage: "600mg daily", startDate: "2024-01-10" },
  ];

  // Herbal-drug interactions
  const herbalInteractions = [
    {
      medication: "Atorvastatin",
      herbal: "Turmeric",
      severity: "moderate",
      risk: "May increase muscle pain risk",
      recommendation: "Monitor for muscle symptoms",
    },
    {
      medication: "Lisinopril",
      herbal: "Garlic Extract",
      severity: "minor",
      risk: "May enhance blood pressure lowering",
      recommendation: "Monitor blood pressure regularly",
    },
  ];

  // Mock medication data
  const medications = [
    {
      id: 1,
      name: "Atorvastatin",
      brand: "Lipitor",
      dosage: "20mg",
      frequency: "Once daily",
      prescribedDate: "2024-01-15",
      nextRefill: "2024-03-15",
      adherence: 94,
      category: "Cardiovascular",
      pgxStatus: "compatible",
      interactions: [],
      sideEffects: ["Muscle pain", "Digestive issues"],
      indication: "High cholesterol",
      prescriber: "Dr. Smith",
      pharmacy: "CVS Pharmacy",
    },
    {
      id: 2,
      name: "Metformin",
      brand: "Glucophage",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedDate: "2024-01-20",
      nextRefill: "2024-03-20",
      adherence: 89,
      category: "Diabetes",
      pgxStatus: "monitor",
      interactions: ["Alcohol"],
      sideEffects: ["Nausea", "Diarrhea"],
      indication: "Type 2 Diabetes",
      prescriber: "Dr. Johnson",
      pharmacy: "Walgreens",
    },
    {
      id: 3,
      name: "Lisinopril",
      brand: "Prinivil",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedDate: "2024-02-01",
      nextRefill: "2024-04-01",
      adherence: 96,
      category: "Cardiovascular",
      pgxStatus: "compatible",
      interactions: ["NSAIDs"],
      sideEffects: ["Dry cough", "Dizziness"],
      indication: "High blood pressure",
      prescriber: "Dr. Smith",
      pharmacy: "CVS Pharmacy",
    },
  ];

  const interactions = [
    {
      id: 1,
      medications: ["Atorvastatin", "Warfarin"],
      severity: "moderate",
      description: "May increase bleeding risk. Monitor INR levels closely.",
      recommendation: "Regular blood tests recommended",
    },
    {
      id: 2,
      medications: ["Metformin", "Alcohol"],
      severity: "high",
      description:
        "Increased risk of lactic acidosis when combined with alcohol.",
      recommendation: "Avoid alcohol consumption",
    },
  ];

  const pgxInsights = [
    {
      gene: "SLCO1B1",
      medication: "Atorvastatin",
      variant: "*15",
      impact: "Increased muscle toxicity risk",
      recommendation: "Consider alternative statin or lower dose",
      confidence: 92,
    },
    {
      gene: "CYP2C19",
      medication: "Clopidogrel",
      variant: "*2",
      impact: "Reduced drug effectiveness",
      recommendation: "Consider alternative antiplatelet therapy",
      confidence: 88,
    },
  ];

  const adherenceData = [
    { date: "2024-01-01", percentage: 85 },
    { date: "2024-01-08", percentage: 89 },
    { date: "2024-01-15", percentage: 92 },
    { date: "2024-01-22", percentage: 94 },
    { date: "2024-01-29", percentage: 96 },
    { date: "2024-02-05", percentage: 93 },
    { date: "2024-02-12", percentage: 94 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compatible":
        return "bg-green-100 text-green-800 border-green-200";
      case "monitor":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredMedications = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Streamlined Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Medication Management
              </h1>
              <p className="text-muted-foreground">
                AI-powered medication tracking with safety alerts and PGx
                insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats - Simplified */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass-morphism border border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground">3</p>
                  </div>
                  <Pill className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Adherence</p>
                    <p className="text-2xl font-bold text-green-600">94%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">2</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border border-border/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">PGx</p>
                    <p className="text-2xl font-bold text-purple-600">1</p>
                  </div>
                  <Dna className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="interactions"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Interactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search */}
            <Card className="glass-morphism border border-border/20">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredMedications.map((medication) => (
                    <Card
                      key={medication.id}
                      className="glass-morphism p-6 border border-border/10 hover-lift"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {medication.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(medication.pgxStatus)}
                            >
                              PGx {medication.pgxStatus}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">
                            {medication.brand} • {medication.dosage} •{" "}
                            {medication.frequency}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            For {medication.indication} • Prescribed by{" "}
                            {medication.prescriber}
                          </p>
                        </div>

                        <div className="mt-4 lg:mt-0 flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">
                              Adherence
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {medication.adherence}%
                            </div>
                            <Progress
                              value={medication.adherence}
                              className="w-16 h-2 mt-1"
                            />
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Bell className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/10">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Next refill:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              medication.nextRefill,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Interactions:
                          </span>
                          <span className="font-medium">
                            {medication.interactions.length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Pharmacy:
                          </span>
                          <span className="font-medium">
                            {medication.pharmacy}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations Preview */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <Brain className="w-5 h-5 text-primary mr-2" />
                    AI Treatment Recommendations
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("ai")}
                    className="hover-lift"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* High Priority Recommendation Preview */}
                  <Card className="p-4 border border-red-200 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          HIGH PRIORITY
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          94% confidence
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Consider Atorvastatin Dosage Adjustment
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Based on recent lab values showing elevated CK levels and
                      patient-reported muscle pain...
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Reduces side effects</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Clock className="w-3 h-3" />
                        <span>2-4 weeks implementation</span>
                      </div>
                    </div>
                  </Card>

                  {/* Medium Priority Recommendation Preview */}
                  <Card className="p-4 border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Info className="w-5 h-5 text-yellow-500" />
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          MEDIUM PRIORITY
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          87% confidence
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Enhanced Diabetes Monitoring Protocol
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Recent HbA1c trends suggest need for more frequent glucose
                      monitoring...
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Better glucose control</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Clock className="w-3 h-3" />
                        <span>Immediate start</span>
                      </div>
                    </div>
                  </Card>

                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      3 more recommendations available • Last updated 2 hours
                      ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Drug Interactions */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    Drug Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <Card
                        key={interaction.id}
                        className="p-4 border border-border/10 bg-background/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={getSeverityColor(interaction.severity)}
                          >
                            {interaction.severity} risk
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {interaction.medications.join(" + ")}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {interaction.description}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-primary">
                          <Brain className="w-3 h-3" />
                          <span>{interaction.recommendation}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Herbal Interactions */}
              <Card className="glass-morphism border border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                    <Leaf className="w-5 h-5 mr-2" />
                    Herbal-Drug Interactions
                    <Badge className="ml-2 bg-orange-100 text-orange-800">
                      {herbalInteractions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {herbalInteractions.map((interaction, idx) => (
                      <Card key={idx} className="p-3 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Pill className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">
                              {interaction.medication}
                            </span>
                            <span className="text-muted-foreground">+</span>
                            <Leaf className="w-4 h-4 text-green-500" />
                            <span className="font-medium">
                              {interaction.herbal}
                            </span>
                          </div>
                          <Badge
                            className={`text-xs ${
                              interaction.severity === "severe"
                                ? "bg-red-100 text-red-800"
                                : interaction.severity === "moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {interaction.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          <strong>Risk:</strong> {interaction.risk}
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          <strong>Recommendation:</strong>{" "}
                          {interaction.recommendation}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Adherence Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      94%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average adherence
                    </div>
                  </div>

                  <div className="h-32 flex items-end justify-between space-x-1">
                    {adherenceData.map((data, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{
                            height: `${(data.percentage / 100) * 100}px`,
                          }}
                        ></div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(data.date).toLocaleDateString("en-US", {
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai">
            <AITreatmentRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
