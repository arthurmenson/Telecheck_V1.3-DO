import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Alert,
  CheckCircle,
  Activity,
  Heart,
  Brain,
  Pill,
  TestTube,
  Shield,
  Star,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  MapPin,
  Zap,
  Sparkles,
  Info,
  ArrowRight,
  PieChart,
  LineChart,
} from "lucide-react";

interface PopulationMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: "up" | "down" | "stable";
  change: number;
  category: "quality" | "safety" | "utilization" | "outcomes";
  description: string;
  benchmark: string;
  lastUpdated: Date;
}

interface QualityMeasure {
  id: string;
  name: string;
  description: string;
  numerator: number;
  denominator: number;
  percentage: number;
  target: number;
  trend: "improving" | "declining" | "stable";
  category: "HEDIS" | "CMS" | "Custom";
  interventions: string[];
}

interface RiskStratum {
  name: string;
  count: number;
  percentage: number;
  avgCost: number;
  topConditions: string[];
  interventions: number;
  outcomes: {
    readmissions: number;
    adherence: number;
    satisfaction: number;
  };
}

export function PopulationHealthAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("12m");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const populationMetrics: PopulationMetric[] = [
    {
      id: "1",
      name: "Medication Adherence Rate",
      value: 78.5,
      target: 85,
      trend: "up",
      change: 3.2,
      category: "quality",
      description: "Overall medication adherence across all chronic conditions",
      benchmark: "CMS Star Rating 4-star threshold",
      lastUpdated: new Date(),
    },
    {
      id: "2",
      name: "Drug Interaction Prevention",
      value: 94.2,
      target: 95,
      trend: "up",
      change: 1.8,
      category: "safety",
      description: "Percentage of high-risk interactions prevented or resolved",
      benchmark: "Industry leading practice",
      lastUpdated: new Date(),
    },
    {
      id: "3",
      name: "Polypharmacy Management",
      value: 67.3,
      target: 75,
      trend: "up",
      change: 4.1,
      category: "quality",
      description:
        "Patients with 5+ medications receiving comprehensive review",
      benchmark: "HEDIS comprehensive medication review",
      lastUpdated: new Date(),
    },
    {
      id: "4",
      name: "Clinical Outcomes Score",
      value: 82.1,
      target: 85,
      trend: "up",
      change: 2.5,
      category: "outcomes",
      description: "Composite score of key clinical outcomes",
      benchmark: "Top quartile performance",
      lastUpdated: new Date(),
    },
  ];

  const qualityMeasures: QualityMeasure[] = [
    {
      id: "1",
      name: "Diabetes Care - HbA1c Control",
      description: "Percentage of diabetic patients with HbA1c <8%",
      numerator: 1247,
      denominator: 1580,
      percentage: 78.9,
      target: 80,
      trend: "improving",
      category: "HEDIS",
      interventions: [
        "Medication optimization",
        "Patient education",
        "Care coordination",
      ],
    },
    {
      id: "2",
      name: "Statin Therapy - LDL Control",
      description: "Patients on statin therapy achieving LDL <100 mg/dL",
      numerator: 892,
      denominator: 1123,
      percentage: 79.4,
      target: 75,
      trend: "improving",
      category: "CMS",
      interventions: [
        "Dosage optimization",
        "Adherence monitoring",
        "PGx testing",
      ],
    },
    {
      id: "3",
      name: "Hypertension Management",
      description: "Patients with controlled blood pressure <140/90 mmHg",
      numerator: 2156,
      denominator: 2847,
      percentage: 75.7,
      target: 78,
      trend: "stable",
      category: "HEDIS",
      interventions: [
        "Medication review",
        "Lifestyle counseling",
        "Home monitoring",
      ],
    },
  ];

  const riskStrata: RiskStratum[] = [
    {
      name: "High Risk",
      count: 234,
      percentage: 8.5,
      avgCost: 12450,
      topConditions: ["Complex diabetes", "Heart failure", "COPD"],
      interventions: 45,
      outcomes: {
        readmissions: 15.2,
        adherence: 67.3,
        satisfaction: 8.1,
      },
    },
    {
      name: "Medium Risk",
      count: 876,
      percentage: 31.8,
      avgCost: 6780,
      topConditions: ["Hypertension", "Diabetes", "Hyperlipidemia"],
      interventions: 128,
      outcomes: {
        readmissions: 8.4,
        adherence: 78.5,
        satisfaction: 8.7,
      },
    },
    {
      name: "Low Risk",
      count: 1645,
      percentage: 59.7,
      avgCost: 2340,
      topConditions: ["Preventive care", "Minor conditions"],
      interventions: 89,
      outcomes: {
        readmissions: 3.1,
        adherence: 85.2,
        satisfaction: 9.1,
      },
    },
  ];

  const interventionEffectiveness = [
    {
      intervention: "Medication Therapy Management",
      patients: 567,
      costSavings: 234000,
      outcomes: {
        adherence: "+12.3%",
        hospitalization: "-18.5%",
        satisfaction: "+15.2%",
      },
      roi: 3.2,
    },
    {
      intervention: "PGx-Guided Therapy",
      patients: 234,
      costSavings: 156000,
      outcomes: {
        adherence: "+8.7%",
        adverse_events: "-24.1%",
        effectiveness: "+19.3%",
      },
      roi: 4.1,
    },
    {
      intervention: "Care Coordination",
      patients: 432,
      costSavings: 198000,
      outcomes: {
        readmissions: "-22.4%",
        emergency_visits: "-16.8%",
        satisfaction: "+18.7%",
      },
      roi: 2.8,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "quality":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "safety":
        return "bg-red-100 text-red-800 border-red-200";
      case "utilization":
        return "bg-green-100 text-green-800 border-green-200";
      case "outcomes":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "HEDIS":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CMS":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk":
        return "text-red-600 bg-red-50";
      case "Medium Risk":
        return "text-yellow-600 bg-yellow-50";
      case "Low Risk":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-primary" />
              Population Health Analytics
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" className="gradient-bg text-white border-0">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {["3m", "6m", "12m", "24m"].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(period)}
                className={
                  selectedTimeframe === period
                    ? "gradient-bg text-white border-0"
                    : ""
                }
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Key Population Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {populationMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="glass-morphism border border-border/20 hover-lift"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={getCategoryColor(metric.category)}>
                  {metric.category}
                </Badge>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm">
                  {metric.name}
                </h3>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">
                    {metric.value}%
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      metric.change > 0
                        ? "text-green-600"
                        : metric.change < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to Target</span>
                    <span>{metric.target}%</span>
                  </div>
                  <Progress
                    value={(metric.value / metric.target) * 100}
                    className="h-2"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality Measures */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Quality Measures Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {qualityMeasures.map((measure) => (
              <div key={measure.id} className="glass-morphism p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {measure.name}
                      </h3>
                      <Badge className={getCategoryColor(measure.category)}>
                        {measure.category}
                      </Badge>
                      {getTrendIcon(measure.trend)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {measure.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">
                      {measure.percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: {measure.target}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="glass-morphism p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-foreground">
                      {measure.numerator.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Achieving Target
                    </div>
                  </div>
                  <div className="glass-morphism p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-foreground">
                      {measure.denominator.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Population
                    </div>
                  </div>
                  <div className="glass-morphism p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-foreground">
                      {((measure.percentage / measure.target) * 100).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      of Target
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress
                    value={(measure.percentage / measure.target) * 100}
                    className="h-3"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Active Interventions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {measure.interventions.map((intervention, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {intervention}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Stratification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Risk Stratification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskStrata.map((stratum, index) => (
                <div
                  key={index}
                  className={`glass-morphism p-4 rounded-xl ${getRiskColor(stratum.name)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      {stratum.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {stratum.count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stratum.percentage}% of population
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Avg Annual Cost
                      </div>
                      <div className="font-semibold text-foreground">
                        ${stratum.avgCost.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Active Interventions
                      </div>
                      <div className="font-semibold text-foreground">
                        {stratum.interventions}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Top Conditions
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {stratum.topConditions.map((condition, condIndex) => (
                          <Badge
                            key={condIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">
                          Readmissions
                        </div>
                        <div className="font-medium">
                          {stratum.outcomes.readmissions}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Adherence</div>
                        <div className="font-medium">
                          {stratum.outcomes.adherence}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Satisfaction
                        </div>
                        <div className="font-medium">
                          {stratum.outcomes.satisfaction}/10
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intervention Effectiveness */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Intervention Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interventionEffectiveness.map((intervention, index) => (
                <div key={index} className="glass-morphism p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      {intervention.intervention}
                    </h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ROI {intervention.roi}x
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Patients Enrolled
                      </div>
                      <div className="font-semibold text-foreground">
                        {intervention.patients}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Cost Savings
                      </div>
                      <div className="font-semibold text-foreground">
                        ${intervention.costSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Key Outcomes
                    </div>
                    <div className="space-y-1">
                      {Object.entries(intervention.outcomes).map(
                        ([outcome, value]) => (
                          <div
                            key={outcome}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-muted-foreground capitalize">
                              {outcome.replace("_", " ")}
                            </span>
                            <span className="font-medium text-foreground">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
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
