import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Leaf,
  Pill,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  Filter,
  Brain,
  Target,
  Activity,
  Heart,
  Eye,
  Book,
  Beaker,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  Star,
  Plus,
} from "lucide-react";

interface HerbalMedicine {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  category: string;
  activeCompounds: string[];
  traditionalUses: string[];
  modernUses: string[];
  dosage: string;
  safetyProfile: "safe" | "caution" | "warning";
  evidenceLevel: "high" | "moderate" | "low" | "traditional";
  contraindications: string[];
  sideEffects: string[];
  image?: string;
}

interface DrugInteraction {
  herbal: string;
  drug: string;
  severity: "severe" | "moderate" | "minor";
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
  evidenceLevel: string;
  references: string[];
}

interface HerbalDrugInteractionsProps {
  currentMedications: string[];
  currentHerbals: string[];
  onAddHerbal: (herbal: HerbalMedicine) => void;
}

export function HerbalDrugInteractions({
  currentMedications,
  currentHerbals,
  onAddHerbal,
}: HerbalDrugInteractionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "interactions" | "pharmacopia" | "tracker"
  >("interactions");

  const herbalDatabase: HerbalMedicine[] = [
    {
      id: "turmeric",
      name: "Turmeric",
      scientificName: "Curcuma longa",
      commonNames: ["Golden Spice", "Indian Saffron", "Curcumin"],
      category: "Anti-inflammatory",
      activeCompounds: [
        "Curcumin",
        "Demethoxycurcumin",
        "Bisdemethoxycurcumin",
      ],
      traditionalUses: ["Joint pain", "Digestive issues", "Wound healing"],
      modernUses: [
        "Inflammation reduction",
        "Antioxidant support",
        "Cognitive health",
      ],
      dosage: "500-1000mg daily (standardized extract)",
      safetyProfile: "caution",
      evidenceLevel: "high",
      contraindications: [
        "Blood thinning medications",
        "Gallbladder disease",
        "Iron deficiency",
      ],
      sideEffects: [
        "Stomach upset",
        "Increased bleeding risk",
        "Iron absorption reduction",
      ],
    },
    {
      id: "ginkgo",
      name: "Ginkgo Biloba",
      scientificName: "Ginkgo biloba",
      commonNames: ["Maidenhair Tree", "Fossil Tree"],
      category: "Cognitive Support",
      activeCompounds: ["Flavonoids", "Terpenoids", "Ginkgolides"],
      traditionalUses: [
        "Memory enhancement",
        "Circulation improvement",
        "Respiratory support",
      ],
      modernUses: ["Cognitive function", "Peripheral circulation", "Tinnitus"],
      dosage: "120-240mg daily (standardized extract)",
      safetyProfile: "warning",
      evidenceLevel: "moderate",
      contraindications: [
        "Anticoagulant medications",
        "Seizure disorders",
        "Surgery",
      ],
      sideEffects: [
        "Bleeding risk",
        "Headache",
        "Digestive upset",
        "Allergic reactions",
      ],
    },
    {
      id: "garlic",
      name: "Garlic",
      scientificName: "Allium sativum",
      commonNames: ["Common Garlic", "Stinking Rose"],
      category: "Cardiovascular",
      activeCompounds: ["Allicin", "Ajoene", "Alliin"],
      traditionalUses: [
        "Infection prevention",
        "Heart health",
        "Digestive support",
      ],
      modernUses: [
        "Cholesterol management",
        "Blood pressure support",
        "Immune function",
      ],
      dosage: "600-1200mg daily (aged garlic extract)",
      safetyProfile: "caution",
      evidenceLevel: "moderate",
      contraindications: [
        "Blood thinning medications",
        "HIV medications",
        "Surgery",
      ],
      sideEffects: [
        "Bleeding risk",
        "Digestive upset",
        "Body odor",
        "Breath odor",
      ],
    },
    {
      id: "ginseng",
      name: "Asian Ginseng",
      scientificName: "Panax ginseng",
      commonNames: ["Korean Ginseng", "Red Ginseng", "White Ginseng"],
      category: "Adaptogen",
      activeCompounds: ["Ginsenosides", "Polysaccharides", "Peptidoglycans"],
      traditionalUses: ["Energy enhancement", "Stress adaptation", "Longevity"],
      modernUses: [
        "Fatigue reduction",
        "Cognitive performance",
        "Immune support",
      ],
      dosage: "200-400mg daily (standardized extract)",
      safetyProfile: "caution",
      evidenceLevel: "moderate",
      contraindications: [
        "Diabetes medications",
        "Blood thinners",
        "Stimulants",
      ],
      sideEffects: [
        "Insomnia",
        "Blood sugar changes",
        "Blood pressure changes",
      ],
    },
    {
      id: "echinacea",
      name: "Echinacea",
      scientificName: "Echinacea purpurea",
      commonNames: ["Purple Coneflower", "American Coneflower"],
      category: "Immune Support",
      activeCompounds: [
        "Alkamides",
        "Caffeic acid derivatives",
        "Polysaccharides",
      ],
      traditionalUses: [
        "Cold prevention",
        "Wound healing",
        "Infection fighting",
      ],
      modernUses: ["Upper respiratory infections", "Immune system support"],
      dosage: "300-500mg three times daily",
      safetyProfile: "safe",
      evidenceLevel: "moderate",
      contraindications: ["Autoimmune disorders", "Immunosuppressive drugs"],
      sideEffects: ["Allergic reactions", "Digestive upset", "Dizziness"],
    },
    {
      id: "milk-thistle",
      name: "Milk Thistle",
      scientificName: "Silybum marianum",
      commonNames: ["Holy Thistle", "Lady's Thistle", "Silymarin"],
      category: "Liver Support",
      activeCompounds: ["Silymarin", "Silybin", "Silydianin"],
      traditionalUses: [
        "Liver protection",
        "Gallbladder support",
        "Detoxification",
      ],
      modernUses: [
        "Hepatic disorders",
        "Liver detoxification",
        "Antioxidant support",
      ],
      dosage: "200-400mg daily (standardized to 80% silymarin)",
      safetyProfile: "safe",
      evidenceLevel: "high",
      contraindications: ["Hormone-sensitive conditions", "Ragweed allergy"],
      sideEffects: ["Mild digestive upset", "Allergic reactions"],
    },
  ];

  const drugHerbalInteractions: DrugInteraction[] = [
    {
      herbal: "Turmeric",
      drug: "Warfarin",
      severity: "severe",
      mechanism: "Additive anticoagulant effects",
      clinicalEffect: "Increased bleeding risk and prolonged clotting time",
      recommendation:
        "Avoid combination or monitor INR closely with dose adjustment",
      evidenceLevel: "Strong clinical evidence",
      references: ["J Thromb Haemost 2010", "Pharmacotherapy 2015"],
    },
    {
      herbal: "Ginkgo Biloba",
      drug: "Aspirin",
      severity: "severe",
      mechanism: "Platelet aggregation inhibition",
      clinicalEffect: "Significantly increased bleeding risk",
      recommendation: "Avoid combination, especially before surgery",
      evidenceLevel: "Multiple case reports",
      references: ["Stroke 2000", "Ann Pharmacother 2003"],
    },
    {
      herbal: "Garlic",
      drug: "Ritonavir",
      severity: "moderate",
      mechanism: "CYP3A4 induction",
      clinicalEffect: "Reduced antiretroviral drug levels",
      recommendation: "Monitor viral load and drug levels",
      evidenceLevel: "Clinical study",
      references: ["AIDS 2002"],
    },
    {
      herbal: "Ginseng",
      drug: "Metformin",
      severity: "moderate",
      mechanism: "Enhanced glucose-lowering effects",
      clinicalEffect: "Risk of hypoglycemia",
      recommendation: "Monitor blood glucose closely and adjust doses",
      evidenceLevel: "Clinical trials",
      references: ["Diabetes Care 2001"],
    },
    {
      herbal: "Echinacea",
      drug: "Immunosuppressants",
      severity: "moderate",
      mechanism: "Immune system stimulation",
      clinicalEffect: "Counteracts immunosuppressive effects",
      recommendation: "Avoid in organ transplant patients",
      evidenceLevel: "Theoretical concern",
      references: ["Transplantation 2004"],
    },
  ];

  const getInteractionsForUser = () => {
    return drugHerbalInteractions.filter(
      (interaction) =>
        currentMedications.some(
          (med) =>
            interaction.drug.toLowerCase().includes(med.toLowerCase()) ||
            med.toLowerCase().includes(interaction.drug.toLowerCase()),
        ) &&
        currentHerbals.some((herb) =>
          interaction.herbal.toLowerCase().includes(herb.toLowerCase()),
        ),
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "minor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case "safe":
        return "bg-green-100 text-green-800";
      case "caution":
        return "bg-yellow-100 text-yellow-800";
      case "warning":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEvidenceColor = (evidence: string) => {
    switch (evidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "traditional":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredHerbals = herbalDatabase.filter(
    (herb) =>
      herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herb.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herb.commonNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const categories = [
    "all",
    "Anti-inflammatory",
    "Cognitive Support",
    "Cardiovascular",
    "Adaptogen",
    "Immune Support",
    "Liver Support",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Herbal-Drug Interaction Center
                </CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive pharmacopia with AI-powered safety analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {herbalDatabase.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Herbal Medicines
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "interactions" ? "default" : "outline"}
          onClick={() => setActiveTab("interactions")}
          className={
            activeTab === "interactions"
              ? "gradient-bg text-white border-0"
              : ""
          }
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Interactions
        </Button>
        <Button
          variant={activeTab === "pharmacopia" ? "default" : "outline"}
          onClick={() => setActiveTab("pharmacopia")}
          className={
            activeTab === "pharmacopia" ? "gradient-bg text-white border-0" : ""
          }
        >
          <Book className="w-4 h-4 mr-2" />
          Pharmacopia
        </Button>
        <Button
          variant={activeTab === "tracker" ? "default" : "outline"}
          onClick={() => setActiveTab("tracker")}
          className={
            activeTab === "tracker" ? "gradient-bg text-white border-0" : ""
          }
        >
          <Activity className="w-4 h-4 mr-2" />
          My Herbals
        </Button>
      </div>

      {/* Interactions Tab */}
      {activeTab === "interactions" && (
        <div className="space-y-6">
          {/* Current Interactions Alert */}
          {getInteractionsForUser().length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Active Drug-Herb Interactions Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getInteractionsForUser().map((interaction, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Pill className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">
                            {interaction.drug}
                          </span>
                          <span className="text-gray-500">+</span>
                          <Leaf className="w-5 h-5 text-green-600" />
                          <span className="font-medium">
                            {interaction.herbal}
                          </span>
                        </div>
                        <Badge
                          className={getSeverityColor(interaction.severity)}
                        >
                          {interaction.severity} risk
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Clinical Effect:
                          </h4>
                          <p className="text-gray-700">
                            {interaction.clinicalEffect}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Recommendation:
                          </h4>
                          <p className="text-gray-700">
                            {interaction.recommendation}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
                        <span>
                          <strong>Mechanism:</strong> {interaction.mechanism}
                        </span>
                        <span>
                          <strong>Evidence:</strong> {interaction.evidenceLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interaction Checker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beaker className="w-5 h-5 mr-2 text-primary" />
                Interaction Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugHerbalInteractions.map((interaction, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">
                            {interaction.drug}
                          </span>
                        </div>
                        <span className="text-gray-400">×</span>
                        <div className="flex items-center space-x-2">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {interaction.herbal}
                          </span>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(interaction.severity)}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {interaction.clinicalEffect}
                    </p>
                    <div className="text-xs text-gray-600">
                      <strong>Mechanism:</strong> {interaction.mechanism}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pharmacopia Tab */}
      {activeTab === "pharmacopia" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search herbal medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Herbal Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHerbals.map((herb) => (
              <Card key={herb.id} className="hover-lift cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-foreground mb-1">
                        {herb.name}
                      </CardTitle>
                      <p className="text-sm italic text-muted-foreground mb-2">
                        {herb.scientificName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSafetyColor(herb.safetyProfile)}>
                          {herb.safetyProfile}
                        </Badge>
                        <Badge className={getEvidenceColor(herb.evidenceLevel)}>
                          {herb.evidenceLevel} evidence
                        </Badge>
                      </div>
                    </div>
                    <Leaf className="w-8 h-8 text-green-500" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Active Compounds */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">
                      Active Compounds:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {herb.activeCompounds.slice(0, 3).map((compound) => (
                        <Badge
                          key={compound}
                          variant="secondary"
                          className="text-xs"
                        >
                          {compound}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Traditional Uses */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">
                      Traditional Uses:
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {herb.traditionalUses.slice(0, 3).map((use, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dosage */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      Recommended Dosage:
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {herb.dosage}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onAddHerbal(herb)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to List
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Safety Warning */}
                  {herb.safetyProfile !== "safe" && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 text-yellow-700 dark:text-yellow-300">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {herb.contraindications.length} contraindication(s)
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Herbals Tab */}
      {activeTab === "tracker" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                My Current Herbal Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentHerbals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Leaf className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No herbal medicines tracked yet.</p>
                  <p className="text-sm">
                    Add herbals from the Pharmacopia to monitor interactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentHerbals.map((herbal, idx) => {
                    const herbalData = herbalDatabase.find(
                      (h) => h.name === herbal,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Leaf className="w-5 h-5 text-green-500" />
                          <div>
                            <h4 className="font-medium">{herbal}</h4>
                            {herbalData && (
                              <p className="text-sm text-muted-foreground">
                                {herbalData.scientificName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {herbalData && (
                            <Badge
                              className={getSafetyColor(
                                herbalData.safetyProfile,
                              )}
                            >
                              {herbalData.safetyProfile}
                            </Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Recommendations */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Shield className="w-5 h-5 mr-2" />
                Safety Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Always inform your healthcare provider about herbal
                    medicines
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Start with lower doses to assess tolerance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Purchase from reputable sources with quality certifications
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>
                    Discontinue herbal medicines before surgery (usually 2 weeks
                    prior)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
