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
  Heart,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Zap,
  Shield,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Footprints,
  Thermometer,
  Droplets,
  Moon,
  Sun,
  Battery,
  Wifi,
  Smartphone,
  Watch,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  ArrowRight,
  Plus,
} from "lucide-react";

export function Wellness() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Mock wellness data
  const todayStats = {
    steps: 8543,
    stepsGoal: 10000,
    calories: 2340,
    caloriesGoal: 2500,
    activeMinutes: 67,
    activeGoal: 90,
    heartRate: 72,
    sleepHours: 7.5,
    sleepGoal: 8,
    dfpasScore: 23,
    hydration: 6,
    hydrationGoal: 8,
  };

  const vitalSigns = [
    {
      metric: "Heart Rate",
      current: 72,
      unit: "bpm",
      range: "60-100",
      status: "normal",
      trend: "stable",
      lastUpdated: "5 min ago",
      device: "Apple Watch",
      history: [68, 70, 72, 74, 71, 69, 72],
    },
    {
      metric: "Blood Pressure",
      current: "118/76",
      unit: "mmHg",
      range: "<120/80",
      status: "optimal",
      trend: "improving",
      lastUpdated: "2 hours ago",
      device: "Omron Monitor",
      history: ["120/82", "119/80", "118/78", "118/76"],
    },
    {
      metric: "SpO2",
      current: 98,
      unit: "%",
      range: "95-100",
      status: "normal",
      trend: "stable",
      lastUpdated: "1 min ago",
      device: "Apple Watch",
      history: [97, 98, 98, 99, 98, 97, 98],
    },
    {
      metric: "Body Temperature",
      current: 98.6,
      unit: "°F",
      range: "97.0-99.0",
      status: "normal",
      trend: "stable",
      lastUpdated: "6 hours ago",
      device: "Smart Thermometer",
      history: [98.4, 98.5, 98.6, 98.7, 98.6],
    },
  ];

  const dfpasMetrics = {
    currentScore: 23,
    riskLevel: "low",
    timeInStasis: 2.3,
    dailyAverage: 3.1,
    weeklyTrend: "improving",
    recommendations: [
      "Take movement breaks every 2 hours",
      "Consider compression socks for long sitting periods",
      "Maintain current activity level",
    ],
    riskFactors: [
      { factor: "Prolonged sitting", severity: "low", duration: "2.3 hrs" },
      { factor: "Travel history", severity: "none", duration: "N/A" },
      { factor: "Medical conditions", severity: "none", duration: "N/A" },
    ],
  };

  const sleepData = {
    lastNight: {
      duration: 7.5,
      quality: 85,
      deepSleep: 1.8,
      remSleep: 1.2,
      lightSleep: 4.5,
      efficiency: 92,
      bedtime: "10:45 PM",
      wakeTime: "6:15 AM",
      restingHR: 58,
    },
    weeklyAverage: {
      duration: 7.2,
      quality: 82,
      efficiency: 89,
    },
  };

  const activityGoals = [
    {
      name: "Daily Steps",
      current: todayStats.steps,
      goal: todayStats.stepsGoal,
      progress: (todayStats.steps / todayStats.stepsGoal) * 100,
      unit: "steps",
      icon: Footprints,
      color: "text-blue-600",
    },
    {
      name: "Active Minutes",
      current: todayStats.activeMinutes,
      goal: todayStats.activeGoal,
      progress: (todayStats.activeMinutes / todayStats.activeGoal) * 100,
      unit: "minutes",
      icon: Activity,
      color: "text-green-600",
    },
    {
      name: "Calories Burned",
      current: todayStats.calories,
      goal: todayStats.caloriesGoal,
      progress: (todayStats.calories / todayStats.caloriesGoal) * 100,
      unit: "cal",
      icon: Zap,
      color: "text-orange-600",
    },
    {
      name: "Hydration",
      current: todayStats.hydration,
      goal: todayStats.hydrationGoal,
      progress: (todayStats.hydration / todayStats.hydrationGoal) * 100,
      unit: "glasses",
      icon: Droplets,
      color: "text-cyan-600",
    },
  ];

  const connectedDevices = [
    {
      name: "Apple Watch Series 9",
      type: "smartwatch",
      status: "connected",
      battery: 78,
      lastSync: "2 min ago",
      metrics: ["Heart Rate", "Steps", "Activity", "Sleep"],
    },
    {
      name: "Omron Blood Pressure Monitor",
      type: "medical",
      status: "connected",
      battery: 45,
      lastSync: "2 hours ago",
      metrics: ["Blood Pressure"],
    },
    {
      name: "Oura Ring Gen 3",
      type: "wearable",
      status: "connected",
      battery: 62,
      lastSync: "15 min ago",
      metrics: ["Sleep", "Temperature", "HRV"],
    },
    {
      name: "Withings Smart Scale",
      type: "scale",
      status: "connected",
      battery: 89,
      lastSync: "1 day ago",
      metrics: ["Weight", "BMI", "Body Composition"],
    },
  ];

  const weeklyActivity = [
    { day: "Mon", steps: 9543, active: 65, calories: 2280 },
    { day: "Tue", steps: 11234, active: 85, calories: 2450 },
    { day: "Wed", steps: 7632, active: 45, calories: 2100 },
    { day: "Thu", steps: 10876, active: 78, calories: 2380 },
    { day: "Fri", steps: 8954, active: 62, calories: 2250 },
    { day: "Sat", steps: 12456, active: 95, calories: 2520 },
    {
      day: "Today",
      steps: todayStats.steps,
      active: todayStats.activeMinutes,
      calories: todayStats.calories,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "normal":
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "warning":
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
      case "poor":
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

  const getDfpasColor = (score: number) => {
    if (score < 20) return "text-green-600";
    if (score < 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">Wellness Dashboard</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Comprehensive wellness tracking with wearable integration and
                DFPAS monitoring
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="hover-lift">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sync Devices</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Device</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* Time frame selector */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
            {["today", "7d", "30d", "90d"].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(period)}
                className={`flex-shrink-0 ${
                  selectedTimeframe === period
                    ? "gradient-bg text-white border-0"
                    : ""
                }`}
              >
                {period === "today" ? "Today" : period}
              </Button>
            ))}
          </div>
        </div>

        {/* Vital Signs */}
        <Card className="glass-morphism border border-border/20 mb-6 lg:mb-8">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Current Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {vitalSigns.map((vital, index) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "normal":
                    case "optimal":
                      return "text-green-600 bg-green-50 border-green-200";
                    case "warning":
                      return "text-yellow-600 bg-yellow-50 border-yellow-200";
                    case "critical":
                      return "text-red-600 bg-red-50 border-red-200";
                    default:
                      return "text-gray-600 bg-gray-50 border-gray-200";
                  }
                };

                const getTrendIcon = (trend: string) => {
                  switch (trend) {
                    case "up":
                    case "improving":
                      return <TrendingUp className="w-4 h-4 text-green-500" />;
                    case "down":
                      return <TrendingDown className="w-4 h-4 text-red-500" />;
                    default:
                      return <Activity className="w-4 h-4 text-gray-500" />;
                  }
                };

                const getVitalIcon = (metric: string) => {
                  switch (metric) {
                    case "Heart Rate":
                      return <Heart className="w-5 h-5 text-primary" />;
                    case "Blood Pressure":
                      return <Activity className="w-5 h-5 text-primary" />;
                    case "SpO2":
                      return <Activity className="w-5 h-5 text-primary" />;
                    case "Body Temperature":
                      return <Thermometer className="w-5 h-5 text-primary" />;
                    default:
                      return <Activity className="w-5 h-5 text-primary" />;
                  }
                };

                return (
                  <div
                    key={index}
                    className="glass-morphism p-3 sm:p-4 rounded-xl hover-lift"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getVitalIcon(vital.metric)}
                        <span className="text-sm font-medium text-muted-foreground">
                          {vital.metric}
                        </span>
                      </div>
                      {getTrendIcon(vital.trend)}
                    </div>
                    <div className="flex items-baseline space-x-1 mb-2">
                      <span className="text-2xl font-bold text-foreground">
                        {vital.current}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {vital.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(vital.status)}`}
                      >
                        {vital.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {vital.range}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated: {vital.lastUpdated} • {vital.device}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {activityGoals.map((goal, index) => {
            const Icon = goal.icon;
            return (
              <Card
                key={index}
                className="glass-morphism border border-border/20 hover-lift"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${goal.color === "text-blue-600" ? "bg-blue-500" : goal.color === "text-green-600" ? "bg-green-500" : goal.color === "text-orange-600" ? "bg-orange-500" : "bg-cyan-500"} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {goal.progress.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of goal
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">{goal.name}</h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-foreground">
                        {goal.current.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {goal.goal.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Vital Signs */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Activity className="w-6 h-6 text-primary mr-2" />
                  Real-time Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {vitalSigns.map((vital, index) => (
                    <div
                      key={index}
                      className="glass-morphism p-4 sm:p-6 rounded-xl hover-lift"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">
                          {vital.metric}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(vital.trend)}
                          <Badge className={getStatusColor(vital.status)}>
                            {vital.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold text-foreground">
                            {vital.current}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {vital.unit}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Range: {vital.range}</div>
                          <div className="flex items-center space-x-2">
                            <Watch className="w-3 h-3" />
                            <span>{vital.device}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{vital.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DFPAS Score */}
          <div>
            <Card className="glass-morphism border border-border/20 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <Target className="w-5 h-5 text-primary mr-2" />
                  DFPAS Stasis Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div
                    className={`text-4xl font-bold ${getDfpasColor(dfpasMetrics.currentScore)} mb-2`}
                  >
                    {dfpasMetrics.currentScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Current Score
                  </div>
                  <Badge className={getStatusColor(dfpasMetrics.riskLevel)}>
                    {dfpasMetrics.riskLevel} risk
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="glass-morphism p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      Time in Stasis Today
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {dfpasMetrics.timeInStasis} hours
                    </div>
                  </div>

                  <div className="glass-morphism p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      Daily Average
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {dfpasMetrics.dailyAverage} hours
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      Recommendations
                    </h4>
                    {dfpasMetrics.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground flex items-start space-x-2"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Summary */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <Moon className="w-5 h-5 text-primary mr-2" />
                  Sleep Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {sleepData.lastNight.duration}h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Night
                    </div>
                    <Badge
                      className={getStatusColor(
                        sleepData.lastNight.quality > 80 ? "good" : "fair",
                      )}
                    >
                      {sleepData.lastNight.quality}% quality
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-morphism p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-foreground">
                        {sleepData.lastNight.deepSleep}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deep Sleep
                      </div>
                    </div>
                    <div className="glass-morphism p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-foreground">
                        {sleepData.lastNight.remSleep}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        REM Sleep
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Bedtime: {sleepData.lastNight.bedtime}</div>
                    <div>Wake Time: {sleepData.lastNight.wakeTime}</div>
                    <div>Efficiency: {sleepData.lastNight.efficiency}%</div>
                    <div>Resting HR: {sleepData.lastNight.restingHR} bpm</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <Card className="mb-6 lg:mb-8 glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2" />
              Weekly Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {(
                    weeklyActivity.reduce((sum, day) => sum + day.steps, 0) /
                    1000
                  ).toFixed(1)}
                  k
                </div>
                <div className="text-sm text-muted-foreground">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {Math.round(
                    weeklyActivity.reduce((sum, day) => sum + day.active, 0) /
                      weeklyActivity.length,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Active Minutes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {Math.round(
                    weeklyActivity.reduce((sum, day) => sum + day.calories, 0) /
                      weeklyActivity.length,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Calories
                </div>
              </div>
            </div>

            <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 sm:space-x-2 overflow-x-auto">
              {weeklyActivity.map((day, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-[32px] flex flex-col items-center space-y-2"
                >
                  <div className="w-full space-y-1">
                    <div
                      className="bg-blue-500 rounded-t min-h-[8px]"
                      style={{
                        height: `${Math.max(8, (day.steps / 15000) * 100)}px`,
                      }}
                      title={`${day.steps} steps`}
                    ></div>
                    <div
                      className="bg-green-500 rounded-t min-h-[4px]"
                      style={{
                        height: `${Math.max(4, (day.active / 120) * 60)}px`,
                      }}
                      title={`${day.active} active minutes`}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium truncate">
                    {day.day.length > 3 ? day.day.substring(0, 3) : day.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground">Steps</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground">Active Minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <Smartphone className="w-6 h-6 text-primary mr-2" />
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {connectedDevices.map((device, index) => (
                <div
                  key={index}
                  className="glass-morphism p-4 sm:p-6 rounded-xl border border-border/10 hover-lift"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                        {device.type === "smartwatch" ? (
                          <Watch className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : device.type === "medical" ? (
                          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : device.type === "wearable" ? (
                          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {device.name}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {device.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Battery className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Battery
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {device.battery}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last Sync
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {device.lastSync}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Metrics
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {device.metrics.map((metric, metricIndex) => (
                          <Badge
                            key={metricIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {metric}
                          </Badge>
                        ))}
                      </div>
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
