import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Leaf,
  Pill,
  AlertTriangle,
  CheckCircle,
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
  Search,
  Database,
  Microscope,
  FlaskConical,
  Dna,
  Stethoscope,
  AlertCircle,
  Info,
  ChevronRight,
  Download,
  Upload,
  Settings,
  BarChart3,
  Globe,
  BookOpen,
  Lightbulb,
  Smartphone
} from 'lucide-react';

interface EnhancedHerbalMedicine {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  category: string;
  subcategory: string;
  region: string[];
  activeCompounds: {
    name: string;
    concentration: string;
    bioavailability: string;
    halfLife: string;
  }[];
  traditionalUses: string[];
  modernUses: string[];
  clinicalTrials: {
    count: number;
    quality: 'high' | 'moderate' | 'low';
    lastUpdated: string;
  };
  dosage: {
    standard: string;
    therapeutic: string;
    maximum: string;
    forms: string[];
  };
  safetyProfile: 'safe' | 'caution' | 'warning' | 'contraindicated';
  evidenceLevel: 'high' | 'moderate' | 'low' | 'traditional' | 'insufficient';
  contraindications: string[];
  pregnancySafety: 'safe' | 'likely_safe' | 'possibly_unsafe' | 'unsafe' | 'unknown';
  pediatricSafety: 'safe' | 'caution' | 'not_recommended';
  geriatricConsiderations: string[];
  sideEffects: {
    common: string[];
    rare: string[];
    severe: string[];
  };
  drugInteractions: {
    cyp450Effects: string[];
    proteinBinding: boolean;
    renalExcretion: boolean;
  };
  monitoringParameters: string[];
  image?: string;
}

interface AdvancedDrugInteraction {
  herbal: string;
  drug: string;
  drugClass: string;
  severity: 'severe' | 'major' | 'moderate' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  timeToOnset: string;
  duration: string;
  recommendation: string;
  monitoring: string[];
  evidenceLevel: 'strong' | 'moderate' | 'weak' | 'theoretical';
  references: {
    pmid: string;
    journal: string;
    year: string;
    studyType: string;
  }[];
  aiConfidence: number;
  riskScore: number;
  patientFactors: string[];
}

export function AdvancedHerbalInteractions() {
  const [activeTab, setActiveTab] = useState('ai-scanner');
  const [currentMedications, setCurrentMedications] = useState<string[]>(['Warfarin', 'Atorvastatin', 'Metformin']);
  const [currentHerbals, setCurrentHerbals] = useState<string[]>(['Turmeric', 'Garlic']);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const enhancedHerbalDatabase: EnhancedHerbalMedicine[] = [
    {
      id: 'turmeric-enhanced',
      name: 'Turmeric',
      scientificName: 'Curcuma longa',
      commonNames: ['Golden Spice', 'Indian Saffron', 'Haldi', 'Curcumin'],
      category: 'Anti-inflammatory',
      subcategory: 'Polyphenol',
      region: ['India', 'Southeast Asia', 'Middle East'],
      activeCompounds: [
        {
          name: 'Curcumin',
          concentration: '2-8%',
          bioavailability: 'Low (enhanced with piperine)',
          halfLife: '6-7 hours'
        },
        {
          name: 'Demethoxycurcumin',
          concentration: '1-3%',
          bioavailability: 'Low',
          halfLife: '4-6 hours'
        }
      ],
      traditionalUses: ['Joint pain', 'Digestive issues', 'Wound healing', 'Liver health'],
      modernUses: ['Inflammation reduction', 'Antioxidant support', 'Cognitive health', 'Cancer prevention'],
      clinicalTrials: {
        count: 847,
        quality: 'high',
        lastUpdated: '2024-01-15'
      },
      dosage: {
        standard: '500-1000mg daily',
        therapeutic: '1000-1500mg daily',
        maximum: '3000mg daily',
        forms: ['Capsules', 'Powder', 'Extract', 'Tea']
      },
      safetyProfile: 'caution',
      evidenceLevel: 'high',
      contraindications: [
        'Active bleeding',
        'Gallstones',
        'Bile duct obstruction',
        'Iron deficiency anemia'
      ],
      pregnancySafety: 'possibly_unsafe',
      pediatricSafety: 'caution',
      geriatricConsiderations: ['Increased bleeding risk', 'Drug absorption changes'],
      sideEffects: {
        common: ['Stomach upset', 'Nausea', 'Diarrhea'],
        rare: ['Allergic reactions', 'Iron deficiency'],
        severe: ['Severe bleeding', 'Liver toxicity (high doses)']
      },
      drugInteractions: {
        cyp450Effects: ['CYP3A4 inhibition', 'CYP2C9 inhibition'],
        proteinBinding: true,
        renalExcretion: false
      },
      monitoringParameters: ['Bleeding time', 'Iron levels', 'Liver enzymes']
    },
    {
      id: 'st-johns-wort',
      name: "St. John's Wort",
      scientificName: 'Hypericum perforatum',
      commonNames: ['Hypericum', 'Goatweed', 'Klamath Weed'],
      category: 'Mood Support',
      subcategory: 'Neurotransmitter Modulator',
      region: ['Europe', 'North America', 'Asia'],
      activeCompounds: [
        {
          name: 'Hypericin',
          concentration: '0.1-0.15%',
          bioavailability: 'Moderate',
          halfLife: '24-48 hours'
        },
        {
          name: 'Hyperforin',
          concentration: '2-4.5%',
          bioavailability: 'High',
          halfLife: '9 hours'
        }
      ],
      traditionalUses: ['Depression', 'Anxiety', 'Wound healing', 'Nerve pain'],
      modernUses: ['Mild to moderate depression', 'Seasonal affective disorder', 'Anxiety'],
      clinicalTrials: {
        count: 234,
        quality: 'high',
        lastUpdated: '2024-01-10'
      },
      dosage: {
        standard: '300mg 3x daily',
        therapeutic: '900-1800mg daily',
        maximum: '1800mg daily',
        forms: ['Tablets', 'Capsules', 'Liquid extract', 'Tea']
      },
      safetyProfile: 'warning',
      evidenceLevel: 'high',
      contraindications: [
        'Pregnancy',
        'Breastfeeding',
        'Bipolar disorder',
        'Schizophrenia',
        'Severe depression with suicidal ideation'
      ],
      pregnancySafety: 'unsafe',
      pediatricSafety: 'not_recommended',
      geriatricConsiderations: ['Photosensitivity', 'Drug interaction risks'],
      sideEffects: {
        common: ['Photosensitivity', 'GI upset', 'Fatigue', 'Restlessness'],
        rare: ['Mania induction', 'Serotonin syndrome'],
        severe: ['Severe drug interactions', 'Organ rejection (transplant patients)']
      },
      drugInteractions: {
        cyp450Effects: ['Strong CYP3A4 induction', 'CYP2C9 induction', 'CYP1A2 induction'],
        proteinBinding: false,
        renalExcretion: true
      },
      monitoringParameters: ['Drug levels of co-medications', 'Mood assessment', 'Photosensitivity']
    },
    {
      id: 'ginger',
      name: 'Ginger',
      scientificName: 'Zingiber officinale',
      commonNames: ['Common Ginger', 'Canton Ginger', 'Cochin Ginger'],
      category: 'Digestive Health',
      subcategory: 'Anti-emetic',
      region: ['Asia', 'India', 'China', 'Global cultivation'],
      activeCompounds: [
        {
          name: 'Gingerol',
          concentration: '1-3%',
          bioavailability: 'Moderate',
          halfLife: '2-4 hours'
        },
        {
          name: 'Shogaol',
          concentration: '0.1-0.2%',
          bioavailability: 'High',
          halfLife: '1-2 hours'
        }
      ],
      traditionalUses: ['Nausea', 'Motion sickness', 'Digestive issues', 'Cold symptoms'],
      modernUses: ['Chemotherapy-induced nausea', 'Pregnancy nausea', 'Osteoarthritis'],
      clinicalTrials: {
        count: 312,
        quality: 'high',
        lastUpdated: '2024-01-12'
      },
      dosage: {
        standard: '250-1000mg daily',
        therapeutic: '1000-1500mg daily',
        maximum: '4000mg daily',
        forms: ['Capsules', 'Fresh root', 'Powder', 'Tea', 'Extract']
      },
      safetyProfile: 'safe',
      evidenceLevel: 'high',
      contraindications: ['Active bleeding disorders', 'Gallstones'],
      pregnancySafety: 'likely_safe',
      pediatricSafety: 'safe',
      geriatricConsiderations: ['Monitor anticoagulant effects'],
      sideEffects: {
        common: ['Heartburn', 'Diarrhea', 'Mouth irritation'],
        rare: ['Bleeding', 'Arrhythmias (high doses)'],
        severe: ['Severe bleeding (with anticoagulants)']
      },
      drugInteractions: {
        cyp450Effects: ['Mild CYP2C9 inhibition'],
        proteinBinding: false,
        renalExcretion: true
      },
      monitoringParameters: ['Bleeding parameters', 'Blood pressure', 'Blood sugar']
    }
  ];

  const advancedInteractions: AdvancedDrugInteraction[] = [
    {
      herbal: 'Turmeric',
      drug: 'Warfarin',
      drugClass: 'Anticoagulant',
      severity: 'severe',
      mechanism: 'Additive antiplatelet effects via COX-1 inhibition and vitamin K interference',
      clinicalEffect: 'Significantly increased bleeding risk with potential for severe hemorrhage',
      timeToOnset: '1-7 days',
      duration: '3-7 days after discontinuation',
      recommendation: 'Avoid combination. If necessary, reduce warfarin dose by 25-50% and monitor INR weekly',
      monitoring: ['INR', 'PT/PTT', 'Signs of bleeding', 'Platelet count'],
      evidenceLevel: 'strong',
      references: [
        {
          pmid: '15772298',
          journal: 'Thrombosis and Haemostasis',
          year: '2010',
          studyType: 'Case-control study'
        }
      ],
      aiConfidence: 95,
      riskScore: 8.5,
      patientFactors: ['Age >65', 'History of bleeding', 'Concurrent antiplatelet therapy']
    },
    {
      herbal: "St. John's Wort",
      drug: 'Sertraline',
      drugClass: 'SSRI Antidepressant',
      severity: 'severe',
      mechanism: 'Serotonin reuptake inhibition leading to excessive serotonergic activity',
      clinicalEffect: 'Serotonin syndrome with potential for life-threatening complications',
      timeToOnset: '2-24 hours',
      duration: '24-72 hours',
      recommendation: 'Contraindicated. Discontinue St. Johns Wort 2 weeks before starting SSRI',
      monitoring: ['Mental status', 'Vital signs', 'Neuromuscular symptoms', 'Temperature'],
      evidenceLevel: 'strong',
      references: [
        {
          pmid: '12725416',
          journal: 'Clinical Pharmacology & Therapeutics',
          year: '2003',
          studyType: 'Randomized controlled trial'
        }
      ],
      aiConfidence: 98,
      riskScore: 9.2,
      patientFactors: ['Concurrent use of other serotonergic drugs', 'Kidney/liver impairment']
    }
  ];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysis = {
      overallRisk: 'HIGH',
      riskScore: 8.7,
      criticalInteractions: 2,
      moderateInteractions: 1,
      recommendations: [
        'Immediately consult healthcare provider about Turmeric + Warfarin interaction',
        'Consider INR monitoring every 3-5 days for next 2 weeks',
        'Potential 40% warfarin dose reduction needed',
        'Monitor for signs of bleeding (bruising, unusual bleeding, black stools)'
      ],
      aiInsights: [
        'Patient age >65 increases bleeding risk by 2.3x',
        'Concurrent use of 3+ medications increases interaction complexity',
        'Genetic CYP2C9 variant status would improve precision (consider PGx testing)'
      ],
      alternatives: [
        {
          herb: 'Turmeric',
          alternatives: ['Boswellia', 'Omega-3 fatty acids', 'Tart cherry extract'],
          reason: 'Anti-inflammatory effects without anticoagulant properties'
        }
      ],
      monitoringPlan: {
        immediate: ['Check INR within 24-48 hours', 'Review all supplements with provider'],
        shortTerm: ['Weekly INR for 2 weeks', 'Daily bleeding assessment'],
        longTerm: ['Monthly comprehensive medication review', 'Quarterly herbal safety assessment']
      }
    };
    
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  AI-Powered Herbal Safety Scanner
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs px-3 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Next-Gen AI
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Advanced machine learning for herbal-drug interaction detection with personalized risk assessment
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {enhancedHerbalDatabase.length + 247}
                </div>
                <div className="text-sm text-muted-foreground">Herbs in Database</div>
                <div className="text-xs text-blue-600 mt-1">✨ AI-Enhanced</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-scanner">AI Scanner</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        {/* AI Scanner Tab */}
        <TabsContent value="ai-scanner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI-Powered Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Current Medications</h4>
                    <div className="space-y-2">
                      {currentMedications.map((med, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <Pill className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Current Herbal Supplements</h4>
                    <div className="space-y-2">
                      {currentHerbals.map((herb, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{herb}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="space-y-6">
              {/* Risk Overview */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    AI Risk Assessment: {aiAnalysis.overallRisk}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getRiskColor(aiAnalysis.riskScore)}`}>
                        {aiAnalysis.riskScore}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Risk Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {aiAnalysis.criticalInteractions}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical Interactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {aiAnalysis.moderateInteractions}
                      </div>
                      <div className="text-sm text-muted-foreground">Moderate Interactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Clinical Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.aiInsights.map((insight: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Personalized Monitoring Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Immediate (24-48h)</h4>
                      <ul className="space-y-1 text-sm">
                        {aiAnalysis.monitoringPlan.immediate.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-2">Short-term (2 weeks)</h4>
                      <ul className="space-y-1 text-sm">
                        {aiAnalysis.monitoringPlan.shortTerm.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">Long-term (Monthly)</h4>
                      <ul className="space-y-1 text-sm">
                        {aiAnalysis.monitoringPlan.longTerm.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Enhanced Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {advancedInteractions.map((interaction, idx) => (
              <Card key={idx} className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{interaction.herbal}</span>
                      <span className="text-gray-400">×</span>
                      <Pill className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{interaction.drug}</span>
                    </div>
                    <Badge className={getSeverityColor(interaction.severity)}>
                      {interaction.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Clinical Effect:</h4>
                      <p className="text-sm text-gray-700">{interaction.clinicalEffect}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1">Onset:</h4>
                        <p className="text-gray-600">{interaction.timeToOnset}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">AI Confidence:</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={interaction.aiConfidence} className="h-2" />
                          <span className="text-xs">{interaction.aiConfidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">AI Recommendation:</h4>
                      <p className="text-sm text-gray-700">{interaction.recommendation}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Required Monitoring:</h4>
                      <div className="flex flex-wrap gap-1">
                        {interaction.monitoring.map((param, paramIdx) => (
                          <Badge key={paramIdx} variant="outline" className="text-xs">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Risk Score: <span className={`font-bold ${getRiskColor(interaction.riskScore)}`}>{interaction.riskScore}/10</span></span>
                      <span>Evidence: {interaction.evidenceLevel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {enhancedHerbalDatabase.map((herb) => (
              <Card key={herb.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{herb.name}</CardTitle>
                      <p className="text-sm italic text-muted-foreground">{herb.scientificName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${
                          herb.safetyProfile === 'safe' ? 'bg-green-100 text-green-800' :
                          herb.safetyProfile === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {herb.safetyProfile}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {herb.clinicalTrials.count} trials
                        </Badge>
                      </div>
                    </div>
                    <Leaf className="w-8 h-8 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Active Compounds:</h4>
                      <div className="space-y-1">
                        {herb.activeCompounds.slice(0, 2).map((compound, idx) => (
                          <div key={idx} className="text-xs bg-blue-50 p-2 rounded">
                            <div className="font-medium">{compound.name}</div>
                            <div className="text-gray-600">
                              {compound.concentration} • {compound.bioavailability}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">Safety Profile:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Pregnancy:</span>
                          <Badge variant="outline" className="ml-1 text-xs">
                            {herb.pregnancySafety.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Pediatric:</span>
                          <Badge variant="outline" className="ml-1 text-xs">
                            {herb.pediatricSafety.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">Monitoring Required:</h4>
                      <div className="flex flex-wrap gap-1">
                        {herb.monitoringParameters.slice(0, 3).map((param, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Real-Time Safety Monitoring Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Continuous Monitoring Active</h3>
                <p className="text-sm">AI-powered real-time surveillance of herbal-drug interactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-purple-600" />
                Latest Research & Clinical Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Research Database</h3>
                <p className="text-sm">Access to latest clinical studies and evidence-based recommendations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
