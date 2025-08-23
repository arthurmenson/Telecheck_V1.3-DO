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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import {
  Settings,
  Dna,
  TestTube,
  Heart,
  Activity,
  Brain,
  Pill,
  Shield,
  AlertTriangle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Info,
  Lock,
  Unlock,
  Calculator,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AlgorithmConfig() {
  const [isModified, setIsModified] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("weights");

  // Health Score Algorithm Configuration
  const [algorithmConfig, setAlgorithmConfig] = useState({
    // Core Component Weights (must sum to 100)
    weights: {
      genomic: 25,        // Genomic risk factors
      labResults: 30,     // Lab test results
      vitals: 20,         // Vital signs and measurements
      lifestyle: 15,      // Activity, sleep, diet
      medications: 10,    // Medication adherence and effects
    },
    
    // Genomic Factors Configuration
    genomicFactors: {
      enabled: true,
      riskVariants: [
        { gene: "APOE", variant: "ε4", impact: "high", weight: 0.3, condition: "Cardiovascular Disease" },
        { gene: "BRCA1", variant: "pathogenic", impact: "critical", weight: 0.4, condition: "Breast Cancer" },
        { gene: "BRCA2", variant: "pathogenic", impact: "critical", weight: 0.4, condition: "Breast Cancer" },
        { gene: "LDLR", variant: "pathogenic", impact: "high", weight: 0.35, condition: "Hypercholesterolemia" },
        { gene: "MTHFR", variant: "C677T", impact: "medium", weight: 0.2, condition: "Folate Metabolism" },
        { gene: "CYP2D6", variant: "poor metabolizer", impact: "medium", weight: 0.25, condition: "Drug Metabolism" },
        { gene: "HLA-B*5701", variant: "positive", impact: "high", weight: 0.3, condition: "Abacavir Sensitivity" },
      ],
      polygeneticRiskScores: {
        enabled: true,
        coronaryArteryDisease: { weight: 0.3, threshold: 75 },
        type2Diabetes: { weight: 0.25, threshold: 80 },
        breastCancer: { weight: 0.35, threshold: 85 },
        prostateCancer: { weight: 0.3, threshold: 80 },
        alzheimersDisease: { weight: 0.4, threshold: 90 },
      },
      pharmacogenomics: {
        enabled: true,
        weight: 0.2,
        factors: ["CYP2D6", "CYP2C19", "CYP3A4", "SLCO1B1", "VKORC1", "UGT1A1"]
      }
    },

    // Lab Results Scoring
    labScoring: {
      biomarkers: [
        { name: "Total Cholesterol", optimalRange: [150, 200], unit: "mg/dL", weight: 0.15 },
        { name: "LDL Cholesterol", optimalRange: [0, 100], unit: "mg/dL", weight: 0.2 },
        { name: "HDL Cholesterol", optimalRange: [40, 100], unit: "mg/dL", weight: 0.15 },
        { name: "Triglycerides", optimalRange: [0, 150], unit: "mg/dL", weight: 0.1 },
        { name: "Glucose (Fasting)", optimalRange: [70, 100], unit: "mg/dL", weight: 0.15 },
        { name: "HbA1c", optimalRange: [4.0, 5.7], unit: "%", weight: 0.2 },
        { name: "Creatinine", optimalRange: [0.6, 1.2], unit: "mg/dL", weight: 0.1 },
        { name: "eGFR", optimalRange: [90, 120], unit: "mL/min", weight: 0.1 },
        { name: "C-Reactive Protein", optimalRange: [0, 3.0], unit: "mg/L", weight: 0.1 },
        { name: "Vitamin D", optimalRange: [30, 100], unit: "ng/mL", weight: 0.05 },
      ],
      ageAdjustments: {
        enabled: true,
        factors: {
          "18-30": 1.0,
          "31-40": 0.95,
          "41-50": 0.9,
          "51-60": 0.85,
          "61-70": 0.8,
          "71+": 0.75
        }
      }
    },

    // Vital Signs Configuration
    vitalsConfig: {
      bloodPressure: {
        systolic: { optimal: [90, 120], weight: 0.3 },
        diastolic: { optimal: [60, 80], weight: 0.3 }
      },
      heartRate: { optimal: [60, 100], weight: 0.2 },
      bmi: { optimal: [18.5, 24.9], weight: 0.2 }
    },

    // Lifestyle Factors
    lifestyleFactors: {
      physicalActivity: { 
        weight: 0.4,
        targets: { steps: 10000, exerciseMinutes: 150 }
      },
      sleep: {
        weight: 0.3,
        targets: { hours: [7, 9], quality: 80 }
      },
      nutrition: {
        weight: 0.3,
        factors: ["vegetables", "fruits", "whole_grains", "lean_protein"]
      }
    },

    // Advanced Settings
    advanced: {
      temporalWeighting: {
        enabled: true,
        recentDataWeight: 0.6,
        historicalDataWeight: 0.4,
        trendAnalysis: true
      },
      aiEnhancement: {
        enabled: true,
        modelVersion: "v2.1",
        confidenceThreshold: 0.85,
        adaptiveLearning: true
      },
      riskStratification: {
        lowRisk: [80, 100],
        moderateRisk: [60, 79],
        highRisk: [40, 59],
        criticalRisk: [0, 39]
      }
    }
  });

  const handleSave = () => {
    console.log("Saving algorithm configuration:", algorithmConfig);
    setIsModified(false);
    alert("Algorithm configuration saved successfully!");
  };

  const handleReset = () => {
    // Reset to default values
    setIsModified(false);
    alert("Configuration reset to defaults");
  };

  const addGeneticVariant = () => {
    setAlgorithmConfig(prev => ({
      ...prev,
      genomicFactors: {
        ...prev.genomicFactors,
        riskVariants: [
          ...prev.genomicFactors.riskVariants,
          { gene: "", variant: "", impact: "medium", weight: 0.2, condition: "" }
        ]
      }
    }));
    setIsModified(true);
  };

  const removeGeneticVariant = (index: number) => {
    setAlgorithmConfig(prev => ({
      ...prev,
      genomicFactors: {
        ...prev.genomicFactors,
        riskVariants: prev.genomicFactors.riskVariants.filter((_, i) => i !== index)
      }
    }));
    setIsModified(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Health Score Algorithm Configuration
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              System-level settings for health score computation
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} disabled={!isModified}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={!isModified}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <Card className={`border-2 ${isModified ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isModified ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <Shield className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium">
                    {isModified ? "Configuration Modified" : "Configuration Saved"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isModified ? "Changes pending - remember to save" : "All changes are saved and active"}
                  </p>
                </div>
              </div>
              <Badge variant={isModified ? "destructive" : "secondary"}>
                {isModified ? "Unsaved Changes" : "Active Configuration"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          {[
            { id: "weights", label: "Component Weights", icon: Calculator },
            { id: "genomic", label: "Genomic Factors", icon: Dna },
            { id: "lab", label: "Lab Results", icon: TestTube },
            { id: "vitals", label: "Vital Signs", icon: Heart },
            { id: "lifestyle", label: "Lifestyle", icon: Activity },
            { id: "advanced", label: "Advanced", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Component Weights Tab */}
        {activeTab === "weights" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Core Component Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(algorithmConfig.weights).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="50"
                      value={value}
                      onChange={(e) => {
                        setAlgorithmConfig(prev => ({
                          ...prev,
                          weights: { ...prev.weights, [key]: Number(e.target.value) }
                        }));
                        setIsModified(true);
                      }}
                      className="w-full"
                    />
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total Weight:</span>
                  <span className={Object.values(algorithmConfig.weights).reduce((a, b) => a + b, 0) === 100 ? 'text-green-600' : 'text-red-600'}>
                    {Object.values(algorithmConfig.weights).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weight Distribution Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(algorithmConfig.weights).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Genomic Factors Tab */}
        {activeTab === "genomic" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-purple-500" />
                  Genomic Risk Variants
                  <Badge className="ml-auto">
                    Weight: {algorithmConfig.weights.genomic}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {algorithmConfig.genomicFactors.riskVariants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Gene</Label>
                        <Input 
                          value={variant.gene}
                          onChange={(e) => {
                            const newVariants = [...algorithmConfig.genomicFactors.riskVariants];
                            newVariants[index].gene = e.target.value;
                            setAlgorithmConfig(prev => ({
                              ...prev,
                              genomicFactors: { ...prev.genomicFactors, riskVariants: newVariants }
                            }));
                            setIsModified(true);
                          }}
                          placeholder="e.g., APOE"
                        />
                      </div>
                      <div>
                        <Label>Variant</Label>
                        <Input 
                          value={variant.variant}
                          onChange={(e) => {
                            const newVariants = [...algorithmConfig.genomicFactors.riskVariants];
                            newVariants[index].variant = e.target.value;
                            setAlgorithmConfig(prev => ({
                              ...prev,
                              genomicFactors: { ...prev.genomicFactors, riskVariants: newVariants }
                            }));
                            setIsModified(true);
                          }}
                          placeholder="e.g., ε4"
                        />
                      </div>
                      <div>
                        <Label>Impact</Label>
                        <select 
                          value={variant.impact}
                          onChange={(e) => {
                            const newVariants = [...algorithmConfig.genomicFactors.riskVariants];
                            newVariants[index].impact = e.target.value;
                            setAlgorithmConfig(prev => ({
                              ...prev,
                              genomicFactors: { ...prev.genomicFactors, riskVariants: newVariants }
                            }));
                            setIsModified(true);
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <Label>Weight</Label>
                        <Input 
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={variant.weight}
                          onChange={(e) => {
                            const newVariants = [...algorithmConfig.genomicFactors.riskVariants];
                            newVariants[index].weight = Number(e.target.value);
                            setAlgorithmConfig(prev => ({
                              ...prev,
                              genomicFactors: { ...prev.genomicFactors, riskVariants: newVariants }
                            }));
                            setIsModified(true);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Condition</Label>
                        <Input 
                          value={variant.condition}
                          onChange={(e) => {
                            const newVariants = [...algorithmConfig.genomicFactors.riskVariants];
                            newVariants[index].condition = e.target.value;
                            setAlgorithmConfig(prev => ({
                              ...prev,
                              genomicFactors: { ...prev.genomicFactors, riskVariants: newVariants }
                            }));
                            setIsModified(true);
                          }}
                          placeholder="Associated condition"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeGeneticVariant(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addGeneticVariant} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Genetic Variant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Polygenic Risk Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Polygenic Risk Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(algorithmConfig.genomicFactors.polygeneticRiskScores).filter(([key]) => key !== 'enabled').map(([condition, config]) => (
                    <div key={condition} className="p-4 border rounded-lg">
                      <h4 className="font-medium capitalize mb-2">
                        {condition.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <Label>Weight</Label>
                          <Input 
                            type="number"
                            step="0.05"
                            value={config.weight}
                            onChange={(e) => {
                              setAlgorithmConfig(prev => ({
                                ...prev,
                                genomicFactors: {
                                  ...prev.genomicFactors,
                                  polygeneticRiskScores: {
                                    ...prev.genomicFactors.polygeneticRiskScores,
                                    [condition]: {
                                      ...config,
                                      weight: Number(e.target.value)
                                    }
                                  }
                                }
                              }));
                              setIsModified(true);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Threshold (%)</Label>
                          <Input 
                            type="number"
                            value={config.threshold}
                            onChange={(e) => {
                              setAlgorithmConfig(prev => ({
                                ...prev,
                                genomicFactors: {
                                  ...prev.genomicFactors,
                                  polygeneticRiskScores: {
                                    ...prev.genomicFactors.polygeneticRiskScores,
                                    [condition]: {
                                      ...config,
                                      threshold: Number(e.target.value)
                                    }
                                  }
                                }
                              }));
                              setIsModified(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs would be implemented similarly... */}
        {activeTab !== "weights" && activeTab !== "genomic" && (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Configuration Section</h3>
              <p className="text-muted-foreground">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration panel will be implemented here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Algorithm Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Algorithm Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Total Components</h4>
                <p className="text-2xl font-bold">{Object.keys(algorithmConfig.weights).length}</p>
                <p className="text-sm text-muted-foreground">Active weight categories</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Genomic Variants</h4>
                <p className="text-2xl font-bold">{algorithmConfig.genomicFactors.riskVariants.length}</p>
                <p className="text-sm text-muted-foreground">Tracked genetic factors</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Lab Biomarkers</h4>
                <p className="text-2xl font-bold">{algorithmConfig.labScoring.biomarkers.length}</p>
                <p className="text-sm text-muted-foreground">Measured parameters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
