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
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  TestTube,
  Heart,
  Pill,
  Brain,
  Download,
  RefreshCw,
  Filter,
  Search,
  Share,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Zap,
  Shield,
  Plus,
  Settings,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  Star,
  Layers,
} from "lucide-react";

export function Trends() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("3m");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "labs",
    "vitals",
    "medications",
  ]);
  const [viewMode, setViewMode] = useState("timeline");

  // Mock trends data
  const timelineEvents = [
    {
      date: "2024-02-15",
      category: "lab",
      title: "Lab Results Received",
      description:
        "Comprehensive metabolic panel shows improved cholesterol levels",
      impact: "positive",
      metrics: { cholesterol: 185, glucose: 88, hdl: 66 },
      provider: "LabCorp",
      location: "Downtown Medical Center",
    },
    {
      date: "2024-02-10",
      category: "medication",
      title: "Medication Started",
      description: "Began atorvastatin 20mg for cholesterol management",
      impact: "neutral",
      prescriber: "Dr. Smith",
      pharmacy: "CVS Pharmacy",
    },
    {
      date: "2024-02-05",
      category: "ai_insight",
      title: "AI Health Insight",
      description: "Sleep quality correlation with glucose control detected",
      impact: "positive",
      confidence: 91,
      recommendation: "Maintain consistent sleep schedule",
    },
    {
      date: "2024-01-28",
      category: "vital",
      title: "Blood Pressure Trend",
      description: "Sustained improvement in blood pressure readings",
      impact: "positive",
      metrics: { systolic: 118, diastolic: 76 },
      device: "Omron Monitor",
    },
    {
      date: "2024-01-20",
      category: "lab",
      title: "Lab Results Received",
      description: "Initial baseline measurements established",
      impact: "neutral",
      metrics: { cholesterol: 205, glucose: 95, hdl: 58 },
      provider: "LabCorp",
    },
    {
      date: "2024-01-15",
      category: "pgx",
      title: "PGx Testing Completed",
      description:
        "Pharmacogenomic profile established for personalized medicine",
      impact: "positive",
      genes: ["CYP2D6", "SLCO1B1", "CYP2C19"],
      provider: "Genomind",
    },
  ];

  const healthMetrics = [
    {
      name: "Total Cholesterol",
      unit: "mg/dL",
      current: 185,
      target: 170,
      trend: "improving",
      change: -9.8,
      data: [205, 198, 195, 190, 185],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "on_track",
    },
    {
      name: "Blood Pressure (Systolic)",
      unit: "mmHg",
      current: 118,
      target: 120,
      trend: "improving",
      change: -2.5,
      data: [125, 122, 120, 119, 118],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "optimal",
    },
    {
      name: "Fasting Glucose",
      unit: "mg/dL",
      current: 88,
      target: 100,
      trend: "improving",
      change: -7.4,
      data: [95, 92, 90, 89, 88],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "excellent",
    },
    {
      name: "HDL Cholesterol",
      unit: "mg/dL",
      current: 66,
      target: 60,
      trend: "improving",
      change: 13.8,
      data: [58, 60, 62, 64, 66],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "excellent",
    },
    {
      name: "Weight",
      unit: "lbs",
      current: 165,
      target: 160,
      trend: "improving",
      change: -3.2,
      data: [170, 168, 167, 166, 165],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "on_track",
    },
    {
      name: "Daily Steps",
      unit: "steps",
      current: 8543,
      target: 10000,
      trend: "stable",
      change: 2.1,
      data: [8200, 8350, 8400, 8500, 8543],
      dates: ["Jan 20", "Jan 27", "Feb 03", "Feb 10", "Feb 15"],
      status: "needs_improvement",
    },
  ];

  const correlationInsights = [
    {
      metric1: "Sleep Quality",
      metric2: "Glucose Control",
      correlation: 0.78,
      strength: "strong",
      description:
        "Better sleep nights correlate with 12% better glucose readings",
      recommendation: "Maintain consistent 7-8 hour sleep schedule",
    },
    {
      metric1: "Exercise Frequency",
      metric2: "Blood Pressure",
      correlation: -0.65,
      strength: "moderate",
      description:
        "Increased activity days show 8% lower blood pressure readings",
      recommendation: "Continue current exercise routine, aim for 150 min/week",
    },
    {
      metric1: "Medication Adherence",
      metric2: "Cholesterol Levels",
      correlation: -0.72,
      strength: "strong",
      description: "Consistent statin use shows 15% improvement in cholesterol",
      recommendation: "Maintain excellent medication adherence",
    },
  ];

  const predictiveModels = [
    {
      metric: "Cholesterol Target",
      prediction: "Target range in 4-6 weeks",
      confidence: 94,
      timeline: "6 weeks",
      factors: ["Current medication", "Diet compliance", "Exercise routine"],
    },
    {
      metric: "Weight Goal",
      prediction: "Goal weight in 3 months",
      confidence: 78,
      timeline: "12 weeks",
      factors: ["Current trajectory", "Activity level", "Caloric intake"],
    },
    {
      metric: "HbA1c Maintenance",
      prediction: "Maintain excellent control",
      confidence: 92,
      timeline: "Ongoing",
      factors: [
        "Glucose stability",
        "Lifestyle factors",
        "Medication compliance",
      ],
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lab":
        return <TestTube className="w-4 h-4" />;
      case "medication":
        return <Pill className="w-4 h-4" />;
      case "vital":
        return <Heart className="w-4 h-4" />;
      case "ai_insight":
        return <Brain className="w-4 h-4" />;
      case "pgx":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lab":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "medication":
        return "bg-green-100 text-green-800 border-green-200";
      case "vital":
        return "bg-red-100 text-red-800 border-red-200";
      case "ai_insight":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pgx":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "optimal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on_track":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "needs_improvement":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return "strong";
    if (abs >= 0.4) return "moderate";
    return "weak";
  };

  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "weak":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
                <TrendingUp className="w-8 h-8 text-primary mr-3" />
                Health Trends & Timeline
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive health journey visualization with predictive
                insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" size="sm" className="hover-lift">
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Data
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Share className="w-4 h-4 mr-2" />
                Share Insights
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex space-x-2">
              {["1m", "3m", "6m", "1y", "all"].map((period) => (
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
            <div className="flex space-x-2">
              {["timeline", "metrics", "correlations"].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={
                    viewMode === mode ? "gradient-bg text-white border-0" : ""
                  }
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* View Content */}
        {viewMode === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <Calendar className="w-6 h-6 text-primary mr-2" />
                    Health Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getCategoryColor(event.category)}`}
                          >
                            {getCategoryIcon(event.category)}
                          </div>
                          {index < timelineEvents.length - 1 && (
                            <div className="w-0.5 h-12 bg-border mt-2"></div>
                          )}
                        </div>

                        <div className="flex-1 glass-morphism p-4 rounded-xl hover-lift">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-foreground">
                                {event.title}
                              </h3>
                              {getImpactIcon(event.impact)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {event.description}
                          </p>

                          {event.metrics && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {Object.entries(event.metrics).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="text-center p-2 bg-background/50 rounded"
                                  >
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {key}
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {value}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {event.provider && (
                              <span>Provider: {event.provider}</span>
                            )}
                            {event.prescriber && (
                              <span>Prescriber: {event.prescriber}</span>
                            )}
                            {event.confidence && (
                              <span>Confidence: {event.confidence}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Insights */}
            <div>
              <Card className="glass-morphism border border-border/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <Target className="w-5 h-5 text-primary mr-2" />
                    Predictive Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveModels.map((model, index) => (
                      <div
                        key={index}
                        className="glass-morphism p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground text-sm">
                            {model.metric}
                          </span>
                          <Badge className="text-xs">
                            {model.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {model.prediction}
                        </p>
                        <div className="text-xs text-primary">
                          <strong>Timeline:</strong> {model.timeline}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <Zap className="w-5 h-5 text-primary mr-2" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="glass-morphism p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">
                          Cholesterol Improved
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        15% reduction in 4 weeks
                      </p>
                    </div>

                    <div className="glass-morphism p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">
                          Glucose Control
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Excellent HbA1c maintained
                      </p>
                    </div>

                    <div className="glass-morphism p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">
                          Blood Pressure
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Optimal range achieved
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {viewMode === "metrics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthMetrics.map((metric, index) => (
              <Card
                key={index}
                className="glass-morphism border border-border/20 hover-lift"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      {metric.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-foreground">
                        {metric.current}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {metric.unit}
                      </span>
                      <span
                        className={`text-sm font-medium ${metric.change > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Target: {metric.target} {metric.unit}
                    </div>

                    <div className="h-16 flex items-end justify-between space-x-1">
                      {metric.data.map((value, dataIndex) => (
                        <div
                          key={dataIndex}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{
                              height: `${(value / Math.max(...metric.data)) * 40}px`,
                            }}
                          ></div>
                          <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-left">
                            {metric.dates[dataIndex]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "correlations" && (
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center">
                <Layers className="w-6 h-6 text-primary mr-2" />
                Health Metric Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {correlationInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getCorrelationColor(insight.strength)}>
                        {insight.strength} correlation
                      </Badge>
                      <div className="text-lg font-bold text-foreground">
                        {Math.abs(insight.correlation).toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          {insight.metric1}
                        </div>
                        <div className="text-xs text-muted-foreground">↕</div>
                        <div className="text-sm font-medium text-foreground">
                          {insight.metric2}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>

                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">
                          Recommendation
                        </div>
                        <div className="text-sm text-foreground">
                          {insight.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
