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
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Heart,
  TestTube,
  Pill,
  Activity,
  Zap,
  Target,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Star,
  Lightbulb,
  Shield,
  BarChart3,
  PieChart,
  Sparkles,
  Info,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export function AIInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock AI insights data
  const healthScore = {
    overall: 85,
    cardiovascular: 78,
    metabolic: 92,
    lifestyle: 81,
    trend: "improving",
  };

  const riskFactors = [
    {
      category: "Cardiovascular",
      risk: "moderate",
      score: 65,
      factors: ["Elevated LDL cholesterol", "Family history"],
      recommendations: [
        "Continue statin therapy",
        "Increase physical activity",
      ],
      trend: "improving",
    },
    {
      category: "Diabetes",
      risk: "low",
      score: 25,
      factors: ["Prediabetes indicators"],
      recommendations: ["Maintain current diet", "Regular glucose monitoring"],
      trend: "stable",
    },
    {
      category: "Liver Function",
      risk: "low",
      score: 15,
      factors: ["Normal enzyme levels"],
      recommendations: ["Continue current medications"],
      trend: "stable",
    },
  ];

  const insights = [
    {
      id: 1,
      category: "Cardiovascular Health",
      title: "Cholesterol Management Success",
      type: "positive",
      confidence: 94,
      priority: "medium",
      timeframe: "3 months",
      description:
        "Your cholesterol levels have improved by 15% since starting atorvastatin. Current LDL levels are approaching target range.",
      recommendations: [
        "Continue current statin dosage",
        "Maintain low-saturated fat diet",
        "Consider adding omega-3 supplements",
      ],
      metrics: {
        before: 205,
        after: 185,
        target: 170,
        improvement: "9.8%",
      },
      nextReview: "2024-04-15",
    },
    {
      id: 2,
      category: "Medication Optimization",
      title: "PGx-Guided Dosing Opportunity",
      type: "alert",
      confidence: 88,
      priority: "high",
      timeframe: "immediate",
      description:
        "Your genetic profile suggests you may benefit from a different statin or adjusted dosing due to SLCO1B1 variants.",
      recommendations: [
        "Discuss genetic testing results with physician",
        "Consider rosuvastatin as alternative",
        "Monitor for muscle-related side effects",
      ],
      genetics: {
        gene: "SLCO1B1",
        variant: "*15",
        impact: "Increased muscle toxicity risk",
      },
      nextReview: "2024-03-01",
    },
    {
      id: 3,
      category: "Lifestyle Optimization",
      title: "Sleep-Glucose Correlation Detected",
      type: "insight",
      confidence: 91,
      priority: "medium",
      timeframe: "6 weeks",
      description:
        "AI analysis shows strong correlation between your sleep quality and glucose control. Better sleep nights correlate with 12% better glucose readings.",
      recommendations: [
        "Maintain consistent sleep schedule",
        "Target 7-8 hours nightly",
        "Consider sleep hygiene improvements",
      ],
      correlation: {
        metric1: "Sleep Quality",
        metric2: "Glucose Control",
        strength: 0.78,
        improvement: "12%",
      },
      nextReview: "2024-03-20",
    },
    {
      id: 4,
      category: "Preventive Care",
      title: "Vitamin D Deficiency Risk",
      type: "warning",
      confidence: 76,
      priority: "low",
      timeframe: "2 months",
      description:
        "Based on location, season, and lab trends, AI predicts 73% likelihood of vitamin D deficiency.",
      recommendations: [
        "Order vitamin D 25-OH test",
        "Consider vitamin D3 supplementation",
        "Increase sun exposure safely",
      ],
      prediction: {
        likelihood: "73%",
        basedOn: [
          "Geographic location",
          "Seasonal patterns",
          "Previous lab values",
        ],
        timeline: "2-3 months",
      },
      nextReview: "2024-04-01",
    },
  ];

  const trendAnalysis = [
    {
      metric: "Blood Pressure",
      current: "118/76",
      trend: "improving",
      change: "-5%",
      prediction: "Stable target range in 2 months",
      confidence: 89,
    },
    {
      metric: "Cholesterol",
      current: "185 mg/dL",
      trend: "improving",
      change: "-9.8%",
      prediction: "Target range in 4-6 weeks",
      confidence: 94,
    },
    {
      metric: "HbA1c",
      current: "5.4%",
      trend: "stable",
      change: "0%",
      prediction: "Maintain excellent control",
      confidence: 92,
    },
    {
      metric: "Weight",
      current: "165 lbs",
      trend: "improving",
      change: "-3.2%",
      prediction: "Goal weight in 3 months",
      confidence: 78,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "alert":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "insight":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
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
                <Brain className="w-8 h-8 text-primary mr-3" />
                AI Health Insights
              </h1>
              <p className="text-muted-foreground text-lg">
                Advanced AI analysis with personalized recommendations and risk
                stratification
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
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          </div>

          {/* Time frame selector */}
          <div className="flex space-x-2">
            {["7d", "30d", "90d", "1y"].map((period) => (
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
        </div>

        {/* Health Score Overview */}
        <Card className="mb-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <Target className="w-6 h-6 text-primary mr-2" />
              Overall Health Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore.overall / 100)}`}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {healthScore.overall}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Overall
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className="gradient-bg text-white border-0">
                  {healthScore.trend}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="glass-morphism p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Cardiovascular
                    </span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {healthScore.cardiovascular}
                  </div>
                  <Progress
                    value={healthScore.cardiovascular}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-morphism p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Metabolic
                    </span>
                    <TestTube className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {healthScore.metabolic}
                  </div>
                  <Progress value={healthScore.metabolic} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-morphism p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Lifestyle
                    </span>
                    <Activity className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {healthScore.lifestyle}
                  </div>
                  <Progress value={healthScore.lifestyle} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Risk Stratification */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="glass-morphism p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {factor.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(factor.trend)}
                        <span
                          className={`text-sm font-medium ${getRiskColor(factor.risk)}`}
                        >
                          {factor.risk} risk
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {factor.score}/100
                    </div>
                    <Progress value={factor.score} className="h-2 mb-3" />
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        <strong>Factors:</strong> {factor.factors.join(", ")}
                      </div>
                      <div className="text-xs text-primary">
                        <strong>Action:</strong> {factor.recommendations[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Predictions */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center">
                <BarChart3 className="w-5 h-5 text-primary mr-2" />
                Predictive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendAnalysis.map((trend, index) => (
                  <div key={index} className="glass-morphism p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {trend.metric}
                      </span>
                      {getTrendIcon(trend.trend)}
                    </div>
                    <div className="text-lg font-bold text-foreground mb-1">
                      {trend.current}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-green-600">
                        {trend.change}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {trend.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trend.prediction}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center">
                <Lightbulb className="w-5 h-5 text-primary mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start glass-morphism hover:shadow-md"
                  variant="ghost"
                >
                  <TestTube className="w-4 h-4 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Order Lab Tests</div>
                    <div className="text-xs text-muted-foreground">
                      Vitamin D, Lipid Panel
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  className="w-full justify-start glass-morphism hover:shadow-md"
                  variant="ghost"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Schedule Consultation</div>
                    <div className="text-xs text-muted-foreground">
                      Discuss PGx results
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  className="w-full justify-start glass-morphism hover:shadow-md"
                  variant="ghost"
                >
                  <Heart className="w-4 h-4 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Lifestyle Plan</div>
                    <div className="text-xs text-muted-foreground">
                      Personalized recommendations
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  className="w-full justify-start glass-morphism hover:shadow-md"
                  variant="ghost"
                >
                  <Pill className="w-4 h-4 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Medication Review</div>
                    <div className="text-xs text-muted-foreground">
                      Optimize current regimen
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Insights */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              Detailed AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getTypeColor(insight.type)}>
                          {insight.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(insight.priority)}
                        >
                          {insight.priority} priority
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {insight.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Confidence
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {insight.confidence}%
                        </div>
                      </div>
                      <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="glass-morphism p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start space-x-2"
                          >
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-morphism p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">
                        Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Timeframe:
                          </span>
                          <span className="text-foreground">
                            {insight.timeframe}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Next Review:
                          </span>
                          <span className="text-foreground">
                            {new Date(insight.nextReview).toLocaleDateString()}
                          </span>
                        </div>
                        {insight.metrics && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Improvement:
                            </span>
                            <span className="text-green-600 font-medium">
                              {insight.metrics.improvement}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      More Details
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-bg text-white border-0"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
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
