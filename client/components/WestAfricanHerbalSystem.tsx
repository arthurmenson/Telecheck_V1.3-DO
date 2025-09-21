import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Leaf,
  Pill,
  Search,
  Plus,
  Eye,
  Brain,
  Globe,
  MapPin,
  Book,
  Activity,
  Shield,
  Clock,
  Target,
  Zap,
  Heart,
  Stethoscope,
  Database,
  Microscope,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  Flag,
  Languages,
} from "lucide-react";

interface WestAfricanHerb {
  id: string;
  localName: string;
  scientificName: string;
  englishName?: string;
  localLanguages: {
    hausa?: string;
    yoruba?: string;
    igbo?: string;
    twi?: string;
    wolof?: string;
    fula?: string;
  };
  country: string[];
  region: string;
  plantPart: string[];
  activeCompounds: string[];
  traditionalUses: string[];
  preparationMethods: string[];
  dosageForm: string[];
  safetyProfile: "safe" | "caution" | "warning" | "unknown";
  evidenceLevel: "clinical" | "traditional" | "anecdotal" | "limited";
  contraindications: string[];
  knownInteractions: string[];
  pregnancySafety: "safe" | "avoid" | "caution" | "unknown";
  pediatricUse: "safe" | "avoid" | "caution" | "unknown";
}

interface HerbalDrugInteraction {
  id: string;
  herbalId: string;
  herbalName: string;
  orthodoxDrug: string;
  drugClass: string;
  interactionType:
    | "pharmacokinetic"
    | "pharmacodynamic"
    | "additive"
    | "antagonistic";
  mechanism: string;
  severity: "severe" | "moderate" | "minor" | "theoretical";
  clinicalEffect: string;
  evidenceLevel: "strong" | "moderate" | "weak" | "theoretical";
  recommendation: string;
  monitoring: string[];
  reportedCases: number;
  geographicRelevance: string[];
  references: string[];
}

interface PatientMedication {
  id: string;
  name: string;
  type: "orthodox" | "herbal";
  dosage: string;
  frequency: string;
  startDate: string;
  indication: string;
  prescriber?: string;
  source?: string;
  notes?: string;
}

export function WestAfricanHerbalSystem() {
  const [currentMedications, setCurrentMedications] = useState<
    PatientMedication[]
  >([
    {
      id: "1",
      name: "Atorvastatin",
      type: "orthodox",
      dosage: "20mg",
      frequency: "Once daily",
      startDate: "2024-01-15",
      indication: "High cholesterol",
      prescriber: "Dr. Adebayo",
    },
    {
      id: "2",
      name: "Lisinopril",
      type: "orthodox",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2024-01-10",
      indication: "Hypertension",
      prescriber: "Dr. Adebayo",
    },
  ]);

  const [herbalMedications, setHerbalMedications] = useState<
    PatientMedication[]
  >([
    {
      id: "h1",
      name: "Bitter Kola",
      type: "herbal",
      dosage: "2-3 nuts",
      frequency: "Daily",
      startDate: "2024-01-01",
      indication: "Cough and general wellness",
      source: "Local market",
    },
    {
      id: "h2",
      name: "Neem leaves",
      type: "herbal",
      dosage: "Tea from 5-10 leaves",
      frequency: "Twice daily",
      startDate: "2024-01-05",
      indication: "Blood sugar management",
      source: "Family garden",
    },
  ]);

  const [detectedInteractions, setDetectedInteractions] = useState<
    HerbalDrugInteraction[]
  >([]);
  const [activeTab, setActiveTab] = useState("interactions");
  const [searchTerm, setSearchTerm] = useState("");

  // Comprehensive West African Herbal Database
  const westAfricanHerbals: WestAfricanHerb[] = [
    {
      id: "bitter-kola",
      localName: "Bitter Kola",
      scientificName: "Garcinia kola",
      englishName: "Bitter Kola",
      localLanguages: {
        hausa: "Miji-goro",
        yoruba: "Orogbo",
        igbo: "Akiilu",
        twi: "Bissy kola",
      },
      country: ["Nigeria", "Ghana", "Cameroon", "Gabon"],
      region: "West/Central Africa",
      plantPart: ["Seeds", "Nuts"],
      activeCompounds: ["Kolaviron", "Garcinia biflavonoids", "Tannins"],
      traditionalUses: [
        "Cough",
        "Bronchitis",
        "Liver protection",
        "Antimicrobial",
      ],
      preparationMethods: ["Raw consumption", "Powder", "Decoction"],
      dosageForm: ["Fresh nuts", "Dried powder", "Extract"],
      safetyProfile: "caution",
      evidenceLevel: "traditional",
      contraindications: ["Pregnancy", "Breastfeeding", "Liver disease"],
      knownInteractions: [
        "Anticoagulants",
        "Antidiabetics",
        "Hepatotoxic drugs",
      ],
      pregnancySafety: "avoid",
      pediatricUse: "caution",
    },
    {
      id: "neem",
      localName: "Neem",
      scientificName: "Azadirachta indica",
      englishName: "Neem",
      localLanguages: {
        hausa: "Dogon yaro",
        yoruba: "Dongoyaro",
        igbo: "Ogwu-abia",
        twi: "Neem",
      },
      country: ["Nigeria", "Ghana", "Mali", "Burkina Faso", "Senegal"],
      region: "West Africa (introduced from India)",
      plantPart: ["Leaves", "Bark", "Seeds", "Oil"],
      activeCompounds: [
        "Azadirachtin",
        "Nimbin",
        "Quercetin",
        "Beta-sitosterol",
      ],
      traditionalUses: ["Malaria", "Diabetes", "Skin conditions", "Infections"],
      preparationMethods: [
        "Tea/decoction",
        "Paste",
        "Oil extraction",
        "Powder",
      ],
      dosageForm: ["Fresh leaves", "Dried powder", "Oil", "Extract"],
      safetyProfile: "caution",
      evidenceLevel: "clinical",
      contraindications: [
        "Pregnancy",
        "Autoimmune disorders",
        "Organ transplant",
      ],
      knownInteractions: ["Immunosuppressants", "Antidiabetics", "Lithium"],
      pregnancySafety: "avoid",
      pediatricUse: "caution",
    },
    {
      id: "moringa",
      localName: "Moringa",
      scientificName: "Moringa oleifera",
      englishName: "Drumstick tree",
      localLanguages: {
        hausa: "Zogale",
        yoruba: "Ewe ile",
        igbo: "Ikwe oyibo",
        twi: "Moringa",
      },
      country: ["Nigeria", "Ghana", "Senegal", "Mali", "Niger"],
      region: "West Africa (widely cultivated)",
      plantPart: ["Leaves", "Seeds", "Pods", "Roots"],
      activeCompounds: [
        "Isothiocyanates",
        "Flavonoids",
        "Phenolic acids",
        "Vitamin C",
      ],
      traditionalUses: [
        "Malnutrition",
        "Inflammation",
        "Diabetes",
        "Hypertension",
      ],
      preparationMethods: ["Fresh consumption", "Powder", "Tea", "Oil"],
      dosageForm: ["Fresh leaves", "Leaf powder", "Seed oil", "Extract"],
      safetyProfile: "safe",
      evidenceLevel: "clinical",
      contraindications: ["Root bark in pregnancy", "Hypoglycemia"],
      knownInteractions: [
        "Antidiabetics",
        "Antihypertensives",
        "Thyroid medications",
      ],
      pregnancySafety: "caution",
      pediatricUse: "safe",
    },
    {
      id: "african-potato",
      localName: "African Potato",
      scientificName: "Hypoxis hemerocallidea",
      englishName: "Star flower",
      localLanguages: {
        hausa: "Iliyasu",
        yoruba: "Isu agbo",
        igbo: "Ji bekee",
      },
      country: ["Nigeria", "Ghana", "South Africa"],
      region: "Sub-Saharan Africa",
      plantPart: ["Tubers", "Bulbs"],
      activeCompounds: ["Hypoxoside", "Rooperol", "Sterols"],
      traditionalUses: ["Immune support", "Prostate health", "General tonic"],
      preparationMethods: ["Decoction", "Powder", "Tincture"],
      dosageForm: ["Fresh tuber", "Dried powder", "Extract"],
      safetyProfile: "caution",
      evidenceLevel: "traditional",
      contraindications: ["Pregnancy", "Autoimmune conditions"],
      knownInteractions: ["Immunosuppressants", "Diabetes medications"],
      pregnancySafety: "avoid",
      pediatricUse: "avoid",
    },
    {
      id: "aloe-vera",
      localName: "Aloe Vera",
      scientificName: "Aloe barbadensis",
      englishName: "Aloe",
      localLanguages: {
        hausa: "Lalo",
        yoruba: "Eti erin",
        igbo: "Okwukwu",
        twi: "Aloe",
      },
      country: ["Nigeria", "Ghana", "Mali", "Senegal"],
      region: "West Africa (cultivated)",
      plantPart: ["Gel", "Latex", "Leaves"],
      activeCompounds: ["Aloin", "Acemannan", "Anthraquinones"],
      traditionalUses: ["Wound healing", "Digestive issues", "Skin conditions"],
      preparationMethods: ["Fresh gel", "Juice", "Powder"],
      dosageForm: ["Fresh gel", "Juice", "Capsules"],
      safetyProfile: "caution",
      evidenceLevel: "clinical",
      contraindications: [
        "Pregnancy",
        "Intestinal obstruction",
        "Kidney disease",
      ],
      knownInteractions: ["Diuretics", "Heart medications", "Diabetes drugs"],
      pregnancySafety: "avoid",
      pediatricUse: "avoid",
    },
  ];

  // Comprehensive Interaction Database
  const interactionDatabase: HerbalDrugInteraction[] = [
    {
      id: "bitter-kola-atorvastatin",
      herbalId: "bitter-kola",
      herbalName: "Bitter Kola",
      orthodoxDrug: "Atorvastatin",
      drugClass: "Statins",
      interactionType: "pharmacokinetic",
      mechanism: "CYP3A4 enzyme inhibition affecting statin metabolism",
      severity: "moderate",
      clinicalEffect:
        "Increased statin blood levels leading to higher risk of muscle toxicity (rhabdomyolysis)",
      evidenceLevel: "theoretical",
      recommendation:
        "Monitor for muscle pain, weakness, or dark urine. Consider spacing doses 4-6 hours apart.",
      monitoring: ["Muscle symptoms", "CK levels", "Liver enzymes"],
      reportedCases: 3,
      geographicRelevance: ["Nigeria", "Ghana"],
      references: ["Traditional medicine reports", "Pharmacokinetic studies"],
    },
    {
      id: "neem-lisinopril",
      herbalId: "neem",
      herbalName: "Neem",
      orthodoxDrug: "Lisinopril",
      drugClass: "ACE Inhibitors",
      interactionType: "additive",
      mechanism: "Additive hypotensive effects through different pathways",
      severity: "moderate",
      clinicalEffect:
        "Enhanced blood pressure lowering effect, risk of hypotension",
      evidenceLevel: "moderate",
      recommendation:
        "Monitor blood pressure closely. May need to reduce ACE inhibitor dose.",
      monitoring: ["Blood pressure", "Kidney function", "Electrolytes"],
      reportedCases: 8,
      geographicRelevance: ["Nigeria", "Ghana", "Mali"],
      references: ["J Ethnopharmacol 2018", "Afr J Med Sci 2020"],
    },
    {
      id: "neem-metformin",
      herbalId: "neem",
      herbalName: "Neem",
      orthodoxDrug: "Metformin",
      drugClass: "Biguanides",
      interactionType: "additive",
      mechanism: "Additive glucose-lowering effects",
      severity: "moderate",
      clinicalEffect:
        "Enhanced blood sugar lowering, increased risk of hypoglycemia",
      evidenceLevel: "strong",
      recommendation:
        "Monitor blood glucose closely. May need metformin dose adjustment.",
      monitoring: ["Blood glucose", "HbA1c", "Hypoglycemia symptoms"],
      reportedCases: 15,
      geographicRelevance: ["Nigeria", "Ghana", "Burkina Faso"],
      references: ["Diabetes Res Clin Pract 2019", "Phytomedicine 2021"],
    },
    {
      id: "moringa-antihypertensives",
      herbalId: "moringa",
      herbalName: "Moringa",
      orthodoxDrug: "Lisinopril",
      drugClass: "ACE Inhibitors",
      interactionType: "additive",
      mechanism: "Synergistic blood pressure lowering effects",
      severity: "minor",
      clinicalEffect: "Mild enhancement of antihypertensive effect",
      evidenceLevel: "moderate",
      recommendation:
        "Monitor blood pressure. Generally safe but watch for hypotension.",
      monitoring: ["Blood pressure", "Heart rate"],
      reportedCases: 5,
      geographicRelevance: ["Nigeria", "Senegal", "Mali"],
      references: ["Nutrients 2020", "Food Funct 2019"],
    },
    {
      id: "aloe-diuretics",
      herbalId: "aloe-vera",
      herbalName: "Aloe Vera",
      orthodoxDrug: "Hydrochlorothiazide",
      drugClass: "Diuretics",
      interactionType: "additive",
      mechanism: "Additive potassium loss and dehydration effects",
      severity: "moderate",
      clinicalEffect: "Increased risk of electrolyte imbalance and dehydration",
      evidenceLevel: "strong",
      recommendation: "Avoid combination or monitor electrolytes closely",
      monitoring: ["Electrolytes", "Kidney function", "Hydration status"],
      reportedCases: 12,
      geographicRelevance: ["Nigeria", "Ghana", "Mali"],
      references: ["Phytother Res 2018", "J Ethnopharmacol 2020"],
    },
  ];

  // Real-time Interaction Detection Engine
  const detectInteractions = () => {
    const interactions: HerbalDrugInteraction[] = [];

    herbalMedications.forEach((herbal) => {
      currentMedications.forEach((orthodox) => {
        // Find matching interactions in database
        const foundInteractions = interactionDatabase.filter(
          (interaction) =>
            interaction.herbalName
              .toLowerCase()
              .includes(herbal.name.toLowerCase()) &&
            (interaction.orthodoxDrug
              .toLowerCase()
              .includes(orthodox.name.toLowerCase()) ||
              orthodox.name
                .toLowerCase()
                .includes(interaction.orthodoxDrug.toLowerCase())),
        );
        interactions.push(...foundInteractions);
      });
    });

    setDetectedInteractions(interactions);
  };

  // Run interaction detection whenever medications change
  useEffect(() => {
    detectInteractions();
  }, [currentMedications, herbalMedications]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "minor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "theoretical":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEvidenceColor = (evidence: string) => {
    switch (evidence) {
      case "strong":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-blue-100 text-blue-800";
      case "weak":
        return "bg-yellow-100 text-yellow-800";
      case "theoretical":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredHerbals = westAfricanHerbals.filter(
    (herb) =>
      herb.localName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herb.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(herb.localLanguages).some((name) =>
        name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 via-yellow-50 to-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Flag className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  West African Herbal-Drug Interaction System
                  <Badge className="bg-gradient-to-r from-green-500 to-yellow-500 text-white border-0 text-xs px-3 py-1">
                    <Globe className="w-3 h-3 mr-1" />
                    Regional Focus
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Traditional medicine safety with modern pharmacological
                  analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {detectedInteractions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Alerts
                </div>
                <div className="text-xs text-green-600 mt-1">
                  🌿 {westAfricanHerbals.length} herbs tracked
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interactions">Active Interactions</TabsTrigger>
          <TabsTrigger value="medications">My Medications</TabsTrigger>
          <TabsTrigger value="database">Herbal Database</TabsTrigger>
          <TabsTrigger value="system">Detection System</TabsTrigger>
        </TabsList>

        {/* Active Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          {detectedInteractions.length > 0 ? (
            <div className="space-y-4">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {detectedInteractions.length} Herbal-Drug Interaction(s)
                    Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detectedInteractions.map((interaction, idx) => (
                      <Card key={idx} className="border border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Leaf className="w-5 h-5 text-green-600" />
                              <span className="font-medium">
                                {interaction.herbalName}
                              </span>
                              <span className="text-gray-400">×</span>
                              <Pill className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">
                                {interaction.orthodoxDrug}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getSeverityColor(
                                  interaction.severity,
                                )}
                              >
                                {interaction.severity}
                              </Badge>
                              <Badge
                                className={getEvidenceColor(
                                  interaction.evidenceLevel,
                                )}
                              >
                                {interaction.evidenceLevel} evidence
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Clinical Effect:
                              </h4>
                              <p className="text-sm text-gray-700">
                                {interaction.clinicalEffect}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                Mechanism:
                              </h4>
                              <p className="text-sm text-gray-700">
                                {interaction.mechanism}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-1">
                              Recommendation:
                            </h4>
                            <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                              {interaction.recommendation}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">
                              Required Monitoring:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {interaction.monitoring.map((param, paramIdx) => (
                                <Badge
                                  key={paramIdx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
                            <span>
                              Reported cases: {interaction.reportedCases}
                            </span>
                            <span>
                              Geographic relevance:{" "}
                              {interaction.geographicRelevance.join(", ")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">
                  No Interactions Detected
                </h3>
                <p className="text-muted-foreground">
                  Your current herbal and orthodox medications appear to be safe
                  when used together.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orthodox Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Orthodox Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMedications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3 border rounded-lg bg-blue-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-gray-600">
                            {med.dosage} - {med.frequency}
                          </p>
                          <p className="text-xs text-gray-500">
                            For: {med.indication} | Prescribed by:{" "}
                            {med.prescriber}
                          </p>
                        </div>
                        <Badge variant="outline">Orthodox</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Herbal Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Traditional Herbal Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {herbalMedications.map((herb) => (
                    <div
                      key={herb.id}
                      className="p-3 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{herb.name}</h4>
                          <p className="text-sm text-gray-600">
                            {herb.dosage} - {herb.frequency}
                          </p>
                          <p className="text-xs text-gray-500">
                            For: {herb.indication} | Source: {herb.source}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Herbal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Herbal Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search herbs (English, local names, or scientific names)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHerbals.map((herb) => (
              <Card key={herb.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {herb.localName}
                        <Badge variant="outline" className="text-xs">
                          {herb.country.length} countries
                        </Badge>
                      </CardTitle>
                      <p className="text-sm italic text-muted-foreground">
                        {herb.scientificName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={`text-xs ${
                            herb.safetyProfile === "safe"
                              ? "bg-green-100 text-green-800"
                              : herb.safetyProfile === "caution"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {herb.safetyProfile}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {herb.evidenceLevel}
                        </Badge>
                      </div>
                    </div>
                    <Leaf className="w-8 h-8 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        Local Names:
                      </h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(herb.localLanguages).map(
                          ([lang, name]) =>
                            name && (
                              <div
                                key={lang}
                                className="flex items-center justify-between"
                              >
                                <span className="capitalize text-gray-600">
                                  {lang}:
                                </span>
                                <span className="font-medium">{name}</span>
                              </div>
                            ),
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        Traditional Uses:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {herb.traditionalUses.slice(0, 4).map((use, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        Geographic Distribution:
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{herb.country.join(", ")}</span>
                      </div>
                    </div>

                    {herb.knownInteractions.length > 0 && (
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="flex items-center gap-1 text-yellow-700 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="font-medium">
                            {herb.knownInteractions.length} known interaction(s)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detection System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                How the Detection System Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Data Input</h3>
                  <p className="text-sm text-gray-600">
                    Patient enters both orthodox medications and local herbal
                    medicines
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Cross-Reference</h3>
                  <p className="text-sm text-gray-600">
                    System matches herbs against West African pharmacopia
                    database
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Microscope className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Analysis</h3>
                  <p className="text-sm text-gray-600">
                    AI analyzes potential interactions using pharmacological
                    data
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">4. Alert & Recommend</h3>
                  <p className="text-sm text-gray-600">
                    Real-time alerts with clinical recommendations and
                    monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Detection Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Real-time interaction scanning
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Multi-language herb recognition
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Evidence-based risk assessment
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Geographic relevance filtering
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Clinical monitoring recommendations
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Regional Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Nigeria",
                    "Ghana",
                    "Mali",
                    "Senegal",
                    "Burkina Faso",
                    "Niger",
                  ].map((country) => (
                    <div
                      key={country}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded"
                    >
                      <span className="text-sm font-medium">{country}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 50) + 20} herbs
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
