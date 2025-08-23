import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Activity,
  Heart,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
} from "lucide-react";

interface LabResult {
  test: string;
  value: number;
  unit: string;
  range: string;
  status: "normal" | "borderline" | "high" | "low";
  interpretation: string;
  risk: "low" | "medium" | "high";
  history: Array<{ date: string; value: number; status: string }>;
  lastChange: number;
  changeDirection: "increasing" | "decreasing" | "stable";
  aiInsights: {
    riskFactors: string[];
    recommendations: string[];
    correlations: string[];
    predictiveAnalysis: string;
    confidence: number;
  };
}

interface LabChartsProps {
  labResults: LabResult[];
  isAnalyzing: boolean;
  analysisComplete: boolean;
  onRequestDoctorReview: () => void;
}

export function LabCharts({
  labResults,
  isAnalyzing,
  analysisComplete,
  onRequestDoctorReview,
}: LabChartsProps) {
  const [selectedChart, setSelectedChart] = useState<
    "trend" | "correlation" | "risk"
  >("trend");
  const [aiInsightStep, setAiInsightStep] = useState(0);
  const [showPredictive, setShowPredictive] = useState(false);

  useEffect(() => {
    if (analysisComplete && aiInsightStep < 3) {
      const timer = setTimeout(() => {
        setAiInsightStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [analysisComplete, aiInsightStep]);

  const getHealthScore = () => {
    const normalCount = labResults.filter((r) => r.status === "normal").length;
    return Math.round((normalCount / labResults.length) * 100);
  };

  const getRiskLevel = () => {
    const highRiskCount = labResults.filter((r) => r.risk === "high").length;
    if (highRiskCount > 0) return "High";
    const mediumRiskCount = labResults.filter(
      (r) => r.risk === "medium",
    ).length;
    if (mediumRiskCount > 0) return "Medium";
    return "Low";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-700 bg-green-50 border-green-200";
      case "borderline":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-700 bg-red-50 border-red-200";
      case "low":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const renderTrendChart = (result: LabResult, compact = false) => {
    const maxValue = Math.max(...result.history.map((h) => h.value));
    const minValue = Math.min(...result.history.map((h) => h.value));
    const range = maxValue - minValue || 1;

    return (
      <div
        className={`relative ${compact ? "h-12" : "h-32"} bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg overflow-hidden`}
      >
        <svg className="w-full h-full" viewBox="0 0 300 100">
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Trend line */}
          <path
            d={result.history
              .map((point, idx) => {
                const x = (idx / (result.history.length - 1)) * 280 + 10;
                const y = 80 - ((point.value - minValue) / range) * 60 + 10;
                return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {result.history.map((point, idx) => {
            const x = (idx / (result.history.length - 1)) * 280 + 10;
            const y = 80 - ((point.value - minValue) / range) * 60 + 10;
            const color =
              point.status === "normal"
                ? "#10b981"
                : point.status === "borderline"
                  ? "#f59e0b"
                  : "#ef4444";
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-sm"
              >
                <title>{`${new Date(point.date).toLocaleDateString()}: ${point.value} ${result.unit}`}</title>
              </circle>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {!compact && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500">
            <span>
              {new Date(result.history[0].date).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })}
            </span>
            <span>
              {new Date(
                result.history[result.history.length - 1].date,
              ).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderAIInsightCard = (result: LabResult) => (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          AI Analysis: {result.test}
          <Badge className="ml-2 bg-purple-100 text-purple-800">
            {result.aiInsights.confidence}% Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Factors */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Risk Factors Identified
          </h4>
          <div className="space-y-1">
            {result.aiInsights.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-500" />
            AI Recommendations
          </h4>
          <div className="space-y-1">
            {result.aiInsights.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Correlations */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-500" />
            Health Correlations
          </h4>
          <div className="space-y-1">
            {result.aiInsights.correlations.map((corr, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                <span>{corr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Analysis */}
        <div className="bg-white p-3 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            Predictive Analysis
          </h4>
          <p className="text-sm text-gray-700">
            {result.aiInsights.predictiveAnalysis}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!analysisComplete) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header with Animation */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  AI Lab Analysis Complete
                </h2>
                <p className="text-muted-foreground">
                  Advanced insights with predictive modeling
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {getHealthScore()}
              </div>
              <div className="text-sm text-muted-foreground">Health Score</div>
            </div>
          </div>

          {/* Animated Insights Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div
              className={`p-4 rounded-lg transition-all duration-1000 ${aiInsightStep >= 1 ? "bg-white shadow-sm scale-100 opacity-100" : "scale-95 opacity-50"}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${aiInsightStep >= 1 ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Data Processed</span>
              </div>
              <p className="text-sm text-gray-600">
                Lab values extracted and validated
              </p>
            </div>

            <div
              className={`p-4 rounded-lg transition-all duration-1000 delay-500 ${aiInsightStep >= 2 ? "bg-white shadow-sm scale-100 opacity-100" : "scale-95 opacity-50"}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${aiInsightStep >= 2 ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Trends Analyzed</span>
              </div>
              <p className="text-sm text-gray-600">
                Historical patterns identified
              </p>
            </div>

            <div
              className={`p-4 rounded-lg transition-all duration-1000 delay-1000 ${aiInsightStep >= 3 ? "bg-white shadow-sm scale-100 opacity-100" : "scale-95 opacity-50"}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${aiInsightStep >= 3 ? "bg-purple-500" : "bg-gray-300"}`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">AI Insights Ready</span>
              </div>
              <p className="text-sm text-gray-600">
                Personalized recommendations generated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-primary" />
              <span className="text-lg sm:text-xl">
                Interactive Lab Visualization
              </span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
              <Button
                variant={selectedChart === "trend" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("trend")}
                className="w-full sm:w-auto"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trends
              </Button>
              <Button
                variant={
                  selectedChart === "correlation" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedChart("correlation")}
                className="w-full sm:w-auto"
              >
                <Activity className="w-4 h-4 mr-2" />
                Correlations
              </Button>
              <Button
                variant={selectedChart === "risk" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("risk")}
                className="w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Risk Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedChart === "trend" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {labResults.slice(0, 4).map((result, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {result.test}
                    </h3>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  {renderTrendChart(result)}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Current: {result.value} {result.unit}
                    </span>
                    <span
                      className={`font-medium ${
                        result.changeDirection === "increasing"
                          ? "text-red-600"
                          : result.changeDirection === "decreasing"
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {result.changeDirection === "increasing" && "↗"}
                      {result.changeDirection === "decreasing" && "↘"}
                      {result.changeDirection === "stable" && "→"}
                      {result.lastChange > 0 ? "+" : ""}
                      {result.lastChange}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedChart === "correlation" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      Strong
                    </div>
                    <div className="text-sm text-red-700 mb-2">
                      Cholesterol ↔ Cardiovascular Risk
                    </div>
                    <div className="text-xs text-red-600">
                      Correlation: 0.84
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      Moderate
                    </div>
                    <div className="text-sm text-yellow-700 mb-2">
                      A1C ↔ Glucose Levels
                    </div>
                    <div className="text-xs text-yellow-600">
                      Correlation: 0.67
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      Good
                    </div>
                    <div className="text-sm text-green-700 mb-2">
                      Thyroid ↔ Metabolic Health
                    </div>
                    <div className="text-xs text-green-600">
                      Correlation: 0.45
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {selectedChart === "risk" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    High
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Cardiovascular Risk
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    LDL Cholesterol elevation
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    Low
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Diabetes Risk
                  </div>
                  <Progress value={15} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Excellent glucose control
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    Low
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Thyroid Risk
                  </div>
                  <Progress value={20} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Normal hormone levels
                  </div>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights for Each Lab Result */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Brain className="w-6 h-6 mr-2 text-primary" />
          Detailed AI Insights
        </h2>
        {labResults
          .filter((r) => r.status !== "normal" || r.risk !== "low")
          .map((result, idx) => (
            <div key={idx}>{renderAIInsightCard(result)}</div>
          ))}
      </div>

      {/* Predictive Health Timeline */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Predictive Health Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3M</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">3 Months</h4>
                <p className="text-sm text-muted-foreground">
                  With dietary changes, expect 10-15% reduction in cholesterol
                  levels
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">6M</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">6 Months</h4>
                <p className="text-sm text-muted-foreground">
                  Cardiovascular risk profile improvement with current trends
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1Y</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">1 Year</h4>
                <p className="text-sm text-muted-foreground">
                  Target: Normal cholesterol range with lifestyle modifications
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Center */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Take Action on Your Results
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI has identified areas for improvement. Connect with your
                  healthcare team.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button
                onClick={onRequestDoctorReview}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Request Doctor Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
