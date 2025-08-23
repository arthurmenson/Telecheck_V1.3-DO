import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Shield,
  Target,
  Zap,
  Info,
  TrendingUp,
  Heart,
  Pill,
  TestTube,
  Calendar,
  Clock,
  Star,
  Eye,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Activity,
  BarChart3,
  Sparkles,
  FileText,
  Phone,
} from "lucide-react";

interface ClinicalAlert {
  id: string;
  type:
    | "drug_interaction"
    | "contraindication"
    | "dosing_alert"
    | "allergy_alert"
    | "lab_alert"
    | "guideline_recommendation";
  severity: "critical" | "major" | "moderate" | "minor";
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  source: string;
  confidence: number;
  isActive: boolean;
  patientSpecific: boolean;
  metadata: Record<string, any>;
}

interface ClinicalGuideline {
  id: string;
  condition: string;
  title: string;
  recommendation: string;
  evidenceLevel: "A" | "B" | "C";
  source: string;
  applicability: number;
}

interface RiskScore {
  type: string;
  score: number;
  risk: "low" | "moderate" | "high";
  factors: string[];
  recommendation: string;
}

export function ClinicalDecisionSupport() {
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([
    {
      id: "1",
      type: "drug_interaction",
      severity: "critical",
      title: "Major Drug-Drug Interaction",
      description:
        "Concurrent use of Warfarin and Ibuprofen significantly increases bleeding risk",
      evidence:
        "Meta-analysis of 15 studies (n=45,000) shows 3.2x increased bleeding risk",
      recommendation:
        "Consider alternative analgesic (acetaminophen) or gastric protection if NSAID necessary",
      source: "Lexicomp Clinical Database",
      confidence: 95,
      isActive: true,
      patientSpecific: true,
      metadata: {
        drugs: ["Warfarin", "Ibuprofen"],
        mechanismOfAction: "Synergistic anticoagulant effect",
        timeframe: "Immediate",
        severity_score: 9,
      },
    },
    {
      id: "2",
      type: "contraindication",
      severity: "major",
      title: "Age-Related Contraindication",
      description:
        "Diphenhydramine is potentially inappropriate for patients ≥65 years (Beers Criteria)",
      evidence:
        "Increased risk of cognitive impairment, delirium, and falls in elderly patients",
      recommendation: "Consider cetirizine or loratadine as safer alternatives",
      source: "AGS Beers Criteria 2023",
      confidence: 88,
      isActive: true,
      patientSpecific: true,
      metadata: {
        drug: "Diphenhydramine",
        patientAge: 72,
        alternatives: ["Cetirizine", "Loratadine"],
        beers_category: "Potentially Inappropriate",
      },
    },
    {
      id: "3",
      type: "dosing_alert",
      severity: "moderate",
      title: "Renal Dose Adjustment Required",
      description:
        "Current metformin dose may be too high given estimated GFR of 45 mL/min/1.73m²",
      evidence: "FDA recommends dose reduction when eGFR 30-45 mL/min/1.73m²",
      recommendation:
        "Reduce metformin to 500mg daily or consider alternative antidiabetic",
      source: "FDA Prescribing Information",
      confidence: 92,
      isActive: true,
      patientSpecific: true,
      metadata: {
        drug: "Metformin",
        currentDose: "1000mg BID",
        recommendedDose: "500mg daily",
        eGFR: 45,
        creatinine: 1.4,
      },
    },
  ]);

  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([
    {
      id: "1",
      condition: "Hyperlipidemia",
      title: "Statin Therapy Optimization",
      recommendation:
        "Consider high-intensity statin therapy for LDL-C >190 mg/dL or ASCVD risk >20%",
      evidenceLevel: "A",
      source: "AHA/ACC Cholesterol Guidelines 2019",
      applicability: 85,
    },
    {
      id: "2",
      condition: "Diabetes",
      title: "Cardiovascular Risk Reduction",
      recommendation:
        "Consider SGLT2 inhibitor or GLP-1 RA for patients with established ASCVD",
      evidenceLevel: "A",
      source: "ADA Standards of Care 2024",
      applicability: 78,
    },
  ]);

  const [riskScores, setRiskScores] = useState<RiskScore[]>([
    {
      type: "ASCVD Risk Calculator",
      score: 15.2,
      risk: "moderate",
      factors: ["Age 65", "Hypertension", "Diabetes", "LDL 145 mg/dL"],
      recommendation: "High-intensity statin therapy recommended",
    },
    {
      type: "Fall Risk Assessment",
      score: 7,
      risk: "high",
      factors: [
        "Age >70",
        "Polypharmacy",
        "Previous falls",
        "Sedative medications",
      ],
      recommendation:
        "Consider medication review and fall prevention strategies",
    },
    {
      type: "Bleeding Risk (HAS-BLED)",
      score: 3,
      risk: "moderate",
      factors: ["Age >65", "Concurrent NSAID use", "Previous GI bleeding"],
      recommendation: "Consider PPI if anticoagulation continued",
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "minor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "major":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "moderate":
        return <Info className="w-4 h-4 text-yellow-500" />;
      case "minor":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "drug_interaction":
        return <Pill className="w-4 h-4" />;
      case "contraindication":
        return <Shield className="w-4 h-4" />;
      case "dosing_alert":
        return <Target className="w-4 h-4" />;
      case "allergy_alert":
        return <AlertTriangle className="w-4 h-4" />;
      case "lab_alert":
        return <TestTube className="w-4 h-4" />;
      case "guideline_recommendation":
        return <FileText className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
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

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200";
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isActive: false } : alert,
      ),
    );
  };

  const activeAlerts = alerts.filter((alert) => alert.isActive);
  const criticalCount = activeAlerts.filter(
    (alert) => alert.severity === "critical",
  ).length;

  return (
    <div className="space-y-6">
      {/* Active Clinical Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary" />
              Clinical Decision Support
              {criticalCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                  {criticalCount} Critical
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(alert.severity)}
                      {getTypeIcon(alert.type)}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {alert.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity} severity
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.confidence}% confidence
                          </Badge>
                          {alert.patientSpecific && (
                            <Badge variant="secondary" className="text-xs">
                              Patient-specific
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        Clinical Evidence
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.evidence}
                      </p>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="text-sm font-medium text-foreground mb-1 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                        Recommendation
                      </h4>
                      <p className="text-sm text-foreground">
                        {alert.recommendation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Source: {alert.source}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-bg text-white border-0"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Consult
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Clinical Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guidelines.map((guideline) => (
                <div
                  key={guideline.id}
                  className="glass-morphism p-4 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">
                        {guideline.condition}
                      </h4>
                      <Badge
                        className={getEvidenceLevelColor(
                          guideline.evidenceLevel,
                        )}
                      >
                        Level {guideline.evidenceLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {guideline.applicability}% applicable
                    </div>
                  </div>
                  <h5 className="text-sm font-medium text-foreground mb-2">
                    {guideline.title}
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    {guideline.recommendation}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {guideline.source}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Scores */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskScores.map((risk, index) => (
                <div key={index} className="glass-morphism p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{risk.type}</h4>
                    <span
                      className={`text-lg font-bold ${getRiskColor(risk.risk)}`}
                    >
                      {risk.score}
                      {risk.type.includes("Calculator") ? "%" : ""}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Risk Level</span>
                      <span
                        className={`font-medium ${getRiskColor(risk.risk)}`}
                      >
                        {risk.risk.charAt(0).toUpperCase() + risk.risk.slice(1)}
                      </span>
                    </div>
                    <Progress
                      value={
                        risk.risk === "low"
                          ? 25
                          : risk.risk === "moderate"
                            ? 60
                            : 90
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">
                      Risk Factors
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {risk.factors.map((factor, factorIndex) => (
                        <Badge
                          key={factorIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Recommendation
                    </div>
                    <div className="text-sm text-foreground">
                      {risk.recommendation}
                    </div>
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
