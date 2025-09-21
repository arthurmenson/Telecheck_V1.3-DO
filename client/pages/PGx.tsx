import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Dna,
  AlertTriangle,
  CheckCircle,
  Info,
  Upload,
  Download,
  Zap,
  Brain,
  Pill,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  RefreshCw,
  Settings,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function PGx() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Mock PGx data
  const pgxProfile = {
    testDate: "2024-01-15",
    provider: "Genomind",
    reportId: "PGX-2024-001",
    genesTested: 15,
    drugsAnalyzed: 47,
    riskVariants: 3,
    actionableFindings: 5,
  };

  const geneVariants = [
    {
      gene: "CYP2D6",
      phenotype: "Poor Metabolizer",
      frequency: "7%",
      impact: "high",
      description:
        "Significantly reduced enzyme activity affecting multiple medications",
      medications: ["Codeine", "Tramadol", "Metoprolol", "Risperidone"],
      recommendations:
        "Avoid codeine and tramadol. Consider alternative pain medications.",
    },
    {
      gene: "SLCO1B1",
      phenotype: "Decreased Function",
      frequency: "15%",
      impact: "moderate",
      description:
        "Reduced transporter function increasing statin-related muscle toxicity risk",
      medications: ["Simvastatin", "Atorvastatin", "Rosuvastatin"],
      recommendations:
        "Use lowest effective statin dose. Consider alternative statins.",
    },
    {
      gene: "CYP2C19",
      phenotype: "Rapid Metabolizer",
      frequency: "30%",
      impact: "moderate",
      description:
        "Increased enzyme activity affecting antidepressant and antiplatelet drugs",
      medications: ["Clopidogrel", "Escitalopram", "Sertraline"],
      recommendations: "May require higher doses for therapeutic effect.",
    },
    {
      gene: "DPYD",
      phenotype: "Normal Metabolizer",
      frequency: "85%",
      impact: "low",
      description: "Normal enzyme function for fluoropyrimidine metabolism",
      medications: ["5-Fluorouracil", "Capecitabine"],
      recommendations: "Standard dosing appropriate.",
    },
  ];

  const drugRecommendations = [
    {
      category: "Pain Management",
      medications: [
        {
          drug: "Codeine",
          recommendation: "Avoid",
          reason: "CYP2D6 poor metabolizer - ineffective analgesia",
          alternatives: ["Morphine", "Oxycodone", "Acetaminophen"],
          confidence: 95,
        },
        {
          drug: "Tramadol",
          recommendation: "Avoid",
          reason: "CYP2D6 poor metabolizer - reduced efficacy",
          alternatives: ["Ibuprofen", "Naproxen", "Celecoxib"],
          confidence: 92,
        },
      ],
    },
    {
      category: "Cardiovascular",
      medications: [
        {
          drug: "Simvastatin",
          recommendation: "Use caution",
          reason: "SLCO1B1 variant increases muscle toxicity risk",
          alternatives: ["Rosuvastatin", "Pravastatin"],
          confidence: 88,
        },
        {
          drug: "Clopidogrel",
          recommendation: "Consider alternatives",
          reason: "CYP2C19 rapid metabolizer - reduced efficacy",
          alternatives: ["Prasugrel", "Ticagrelor"],
          confidence: 85,
        },
      ],
    },
    {
      category: "Mental Health",
      medications: [
        {
          drug: "Escitalopram",
          recommendation: "Adjust dose",
          reason: "CYP2C19 rapid metabolizer - may need higher dose",
          alternatives: ["Sertraline", "Venlafaxine"],
          confidence: 78,
        },
      ],
    },
  ];

  const riskAssessment = [
    {
      category: "Statin Myopathy",
      risk: "high",
      score: 85,
      genes: ["SLCO1B1"],
      description:
        "Significantly increased risk of muscle-related side effects with certain statins",
      prevention:
        "Use lowest effective dose, monitor CK levels, consider alternative statins",
    },
    {
      category: "Opioid Inefficacy",
      risk: "high",
      score: 95,
      genes: ["CYP2D6"],
      description: "Codeine and tramadol will not provide adequate pain relief",
      prevention:
        "Use alternative analgesics, avoid codeine-containing medications",
    },
    {
      category: "Antiplatelet Resistance",
      risk: "moderate",
      score: 70,
      genes: ["CYP2C19"],
      description: "Reduced response to clopidogrel therapy",
      prevention: "Consider alternative antiplatelet agents or higher doses",
    },
  ];

  const currentMedications = [
    {
      name: "Atorvastatin 20mg",
      pgxStatus: "monitor",
      recommendation: "Monitor for muscle symptoms, consider dose reduction",
      geneImpact: "SLCO1B1 decreased function",
    },
    {
      name: "Metformin 500mg",
      pgxStatus: "compatible",
      recommendation: "No genetic contraindications",
      geneImpact: "No relevant variants detected",
    },
    {
      name: "Lisinopril 10mg",
      pgxStatus: "compatible",
      recommendation: "Standard dosing appropriate",
      geneImpact: "No relevant variants detected",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200";
      case "use caution":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "consider alternatives":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "adjust dose":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "moderate":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center">
                <Dna className="w-8 h-8 text-primary mr-3" />
                Pharmacogenomics (PGx)
              </h1>
              <p className="text-muted-foreground text-lg">
                Personalized medication insights based on your genetic profile
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" className="hover-lift">
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Analysis
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Test
              </Button>
            </div>
          </div>
        </div>

        {/* PGx Profile Overview */}
        <Card className="mb-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <FileText className="w-6 h-6 text-primary mr-2" />
              PGx Test Report Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-morphism p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {pgxProfile.genesTested}
                </div>
                <div className="text-sm text-muted-foreground">
                  Genes Tested
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {pgxProfile.drugsAnalyzed}
                </div>
                <div className="text-sm text-muted-foreground">
                  Drugs Analyzed
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {pgxProfile.riskVariants}
                </div>
                <div className="text-sm text-muted-foreground">
                  Risk Variants
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {pgxProfile.actionableFindings}
                </div>
                <div className="text-sm text-muted-foreground">
                  Actionable Findings
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 glass-morphism rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Test Date:</span>
                  <span className="ml-2 font-medium text-foreground">
                    {new Date(pgxProfile.testDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2 font-medium text-foreground">
                    {pgxProfile.provider}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Report ID:</span>
                  <span className="ml-2 font-medium text-foreground font-mono">
                    {pgxProfile.reportId}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Gene Variants */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Genetic Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geneVariants.map((variant, index) => (
                    <div
                      key={index}
                      className="glass-morphism p-6 rounded-xl border border-border/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {variant.gene}
                          </h3>
                          <Badge className={getImpactColor(variant.impact)}>
                            {variant.impact} impact
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowDetails(
                              showDetails === variant.gene
                                ? null
                                : variant.gene,
                            )
                          }
                        >
                          {showDetails === variant.gene ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Phenotype
                          </div>
                          <div className="text-lg font-medium text-foreground">
                            {variant.phenotype}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Population Frequency
                          </div>
                          <div className="text-lg font-medium text-foreground">
                            {variant.frequency}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {variant.description}
                      </p>

                      {showDetails === variant.gene && (
                        <div className="mt-4 space-y-4 border-t border-border/20 pt-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Affected Medications
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {variant.medications.map((med, medIndex) => (
                                <Badge
                                  key={medIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Clinical Recommendations
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {variant.recommendations}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <div>
            <Card className="glass-morphism border border-border/20 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAssessment.map((risk, index) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground text-sm">
                          {risk.category}
                        </span>
                        <span
                          className={`text-sm font-medium ${getRiskColor(risk.risk)}`}
                        >
                          {risk.risk} risk
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-2">
                        {risk.score}/100
                      </div>
                      <Progress value={risk.score} className="h-2 mb-3" />
                      <p className="text-xs text-muted-foreground mb-2">
                        {risk.description}
                      </p>
                      <div className="text-xs text-primary">
                        <strong>Prevention:</strong> {risk.prevention}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <Pill className="w-5 h-5 text-primary mr-2" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMedications.map((med, index) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground text-sm">
                          {med.name}
                        </span>
                        <Badge className={getStatusColor(med.pgxStatus)}>
                          {med.pgxStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {med.recommendation}
                      </p>
                      <div className="text-xs text-primary">
                        <strong>Genetic Impact:</strong> {med.geneImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Drug Recommendations */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <Target className="w-6 h-6 text-primary mr-2" />
              Personalized Drug Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {drugRecommendations.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {category.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.medications.map((med, medIndex) => (
                      <div
                        key={medIndex}
                        className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">
                            {med.drug}
                          </h4>
                          <Badge
                            className={getRecommendationColor(
                              med.recommendation,
                            )}
                          >
                            {med.recommendation}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {med.reason}
                        </p>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Alternatives
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {med.alternatives.map((alt, altIndex) => (
                                <Badge
                                  key={altIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Zap className="w-3 h-3" />
                              <span>{med.confidence}% confidence</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
