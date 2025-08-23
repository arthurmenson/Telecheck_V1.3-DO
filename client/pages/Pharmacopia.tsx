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
import { HerbalDrugInteractions } from "../components/HerbalDrugInteractions";
import { useToast } from "../hooks/use-toast";
import {
  Leaf,
  Pill,
  Book,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Sparkles,
  Star,
  Award,
  Users,
  Activity,
  TrendingUp,
  Shield,
  Beaker,
  Microscope,
  Globe,
} from "lucide-react";

export function Pharmacopia() {
  const { toast } = useToast();
  const [currentMedications] = useState([
    "Warfarin",
    "Metformin",
    "Aspirin",
    "Ritonavir",
  ]);
  const [currentHerbals, setCurrentHerbals] = useState([
    "Turmeric",
    "Ginkgo Biloba",
  ]);

  const handleAddHerbal = (herbal: any) => {
    if (!currentHerbals.includes(herbal.name)) {
      setCurrentHerbals((prev) => [...prev, herbal.name]);
      toast({
        title: "Herbal Added",
        description: `${herbal.name} has been added to your tracking list.`,
      });
    } else {
      toast({
        title: "Already Tracked",
        description: `${herbal.name} is already in your list.`,
        variant: "destructive",
      });
    }
  };

  const pharmacopiaStats = {
    totalHerbals: 247,
    drugInteractions: 1834,
    clinicalStudies: 5692,
    safetyAlerts: 23,
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Digital Pharmacopia
                </h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive herbal medicine database with AI-powered drug
                  interaction analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" className="hover-lift">
                <Search className="w-4 h-4 mr-2" />
                Advanced Search
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Evidence
              </Button>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Herbal Medicines
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {pharmacopiaStats.totalHerbals}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Drug Interactions
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {pharmacopiaStats.drugInteractions.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Clinical Studies
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {pharmacopiaStats.clinicalStudies.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Safety Alerts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {pharmacopiaStats.safetyAlerts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Evidence-Based Research */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Evidence-Based Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">
                      High Evidence
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Randomized trials
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">89</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">
                      Moderate Evidence
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Clinical studies
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">124</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">
                      Traditional Use
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Historical data
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">34</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Usage */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary" />
                Global Usage Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Asia-Pacific</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Africa</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Europe</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>North America</span>
                    <span className="font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                      style={{ width: "32%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>South America</span>
                    <span className="font-medium">58%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full"
                      style={{ width: "58%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Monitoring */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Safety Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">98.7%</div>
                  <div className="text-sm text-muted-foreground">
                    Safety Score
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Adverse event monitoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Quality control standards
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Interaction database
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">
                      23 active safety alerts
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Herbal-Drug Interaction Component */}
        <HerbalDrugInteractions
          currentMedications={currentMedications}
          currentHerbals={currentHerbals}
          onAddHerbal={handleAddHerbal}
        />

        {/* AI Insights Summary */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Machine Learning
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Pattern recognition across 50M+ clinical records
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Predictive Analysis
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Forecasting interaction risks with 94% accuracy
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Real-time Monitoring
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Continuous safety surveillance system
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Evidence Synthesis
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Automated meta-analysis of research data
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
