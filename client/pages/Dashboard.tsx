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
import { Progress } from "../components/ui/progress";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  TestTube,
  Heart,
  Pill,
  Calendar,
  MessageCircle,
  Send,
  Target,
  Droplets,
  Moon,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Eye,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  Users,
  Shield,
  Upload,
  Camera,
  Dna,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Chart Components
const MiniLineChart = ({
  data,
  color = "#6366f1",
  height = 60,
}: {
  data: number[];
  color?: string;
  height?: number;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-16 relative">
      <svg width="100%" height={height} className="absolute inset-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient
            id={`gradient-${color.replace("#", "")}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#gradient-${color.replace("#", "")})`}
          points={`0,${height} ${points} 100,${height}`}
        />
      </svg>
    </div>
  );
};

// Doughnut Chart Component
const DoughnutChart = ({
  data,
  size = 80,
  strokeWidth = 8,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -(
            (accumulatedPercentage / 100) *
            circumference
          );

          accumulatedPercentage += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  );
};

const TimeSeriesChart = ({
  data,
  dates,
  color = "#6366f1",
  height = 120,
  normalRange,
}: {
  data: number[];
  dates: string[];
  color?: string;
  height?: number;
  normalRange?: { min: number; max: number };
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const paddingLeft = 5;
  const paddingRight = 2; // Minimal right padding to extend to edge
  const paddingY = 10;
  const chartHeight = height - paddingY * 2;
  const chartWidth = 100 - paddingLeft - paddingRight;

  // Calculate points for smooth curve
  const points = data.map((value, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y, value };
  });

  // Create smooth path using Bezier curves
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      if (i === 1) {
        // First curve - start with quadratic
        const controlX = previous.x + (current.x - previous.x) * 0.5;
        const controlY = previous.y;
        path += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
      } else {
        // Subsequent curves - use cubic Bezier for smoothness
        const prev2 = points[i - 2];
        const controlPoint1X = previous.x + (current.x - prev2.x) * 0.2;
        const controlPoint1Y = previous.y;
        const controlPoint2X = current.x - (current.x - previous.x) * 0.2;
        const controlPoint2Y = current.y;

        path += ` C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${current.x} ${current.y}`;
      }
    }

    return path;
  };

  const smoothPath = createSmoothPath(points);
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full relative" style={{ height: height + 40 }}>
      <svg
        width="100%"
        height={height}
        className="absolute inset-0"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
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
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Normal range background */}
        {normalRange && (
          <rect
            x={paddingLeft}
            y={
              paddingY +
              chartHeight -
              ((normalRange.max - min) / range) * chartHeight
            }
            width={chartWidth}
            height={((normalRange.max - normalRange.min) / range) * chartHeight}
            fill="#10b981"
            fillOpacity="0.1"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.3"
          />
        )}

        {/* Gradient fill */}
        <defs>
          <linearGradient
            id={`timeseriesGradient-${color.replace("#", "")}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Area under smooth curve */}
        <path
          d={`${smoothPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
          fill={`url(#timeseriesGradient-${color.replace("#", "")})`}
        />

        {/* Smooth thin line */}
        <path
          d={smoothPath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Minimal data points - only show current */}
        {points.map((point, index) => {
          const isLatest = index === points.length - 1;
          const isHigh = normalRange ? point.value > normalRange.max : false;

          // Only show the latest point, make others invisible
          if (!isLatest) return null;

          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill={isHigh ? "#ef4444" : color}
                stroke="white"
                strokeWidth="1"
                className="drop-shadow-sm"
              />
              {/* Subtle pulse for current value */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.3"
                className="animate-pulse"
              />
            </g>
          );
        })}

        {/* Current value extension line to edge */}
        {points.length > 0 && (
          <line
            x1={points[points.length - 1].x}
            y1={points[points.length - 1].y}
            x2={98}
            y2={points[points.length - 1].y}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.4"
          />
        )}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
        {dates.map((date, index) => (
          <span
            key={index}
            className={
              index === dates.length - 1 ? "font-medium text-foreground" : ""
            }
          >
            {date}
          </span>
        ))}
      </div>

      {/* Value labels */}
      <div className="flex justify-between text-xs font-medium mt-1 px-2">
        {data.map((value, index) => (
          <span
            key={index}
            className={`${index === data.length - 1 ? "text-foreground font-bold" : "text-muted-foreground"}`}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
};

const CircularProgress = ({
  value,
  size = 80,
  strokeWidth = 8,
  color = "#6366f1",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(value)}</span>
      </div>
    </div>
  );
};

// Widget Components
const MetricWidget = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  chart,
  color = "#6366f1",
  doughnutData,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: any;
  chart?: number[];
  color?: string;
  doughnutData?: { label: string; value: number; color: string }[];
}) => {
  const changeColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-blue-600",
  };

  const changeIcons = {
    up: <ArrowUp className="w-3 h-3" />,
    down: <ArrowDown className="w-3 h-3" />,
    neutral: <Clock className="w-3 h-3" />,
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 ${changeColors[changeType]}`}
          >
            {changeIcons[changeType]}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>

        {/* Render different chart types */}
        {chart && <MiniLineChart data={chart} color={color} />}

        {doughnutData && (
          <div className="flex items-center justify-between">
            <DoughnutChart data={doughnutData} size={70} strokeWidth={6} />
            <div className="flex-1 ml-4">
              <div className="space-y-1">
                {doughnutData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LabResultCard = ({
  name,
  values,
  dates,
  unit,
  mostRecent,
  date,
  status,
  range,
  normalRange,
  aiInsight,
  flaggedResults,
}: {
  name: string;
  values: number[];
  dates?: string[];
  unit: string;
  mostRecent: string;
  date: string;
  status: string;
  range: string;
  normalRange?: { min: number; max: number };
  aiInsight: string;
  flaggedResults: number;
}) => {
  const [labDateFilter, setLabDateFilter] = useState("30days");
  const statusColor =
    status === "High"
      ? "text-red-600"
      : status === "Low"
        ? "text-blue-600"
        : "text-green-600";

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        {/* AI Header */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 text-white rounded text-xs font-bold flex items-center justify-center">
              AI
            </div>
            <div>
              <p className="text-sm font-medium">AI Summary</p>
              <p className="text-xs text-muted-foreground">
                {flaggedResults} flagged results. Tap to view.
              </p>
            </div>
          </div>
        </div>

        {/* Lab Results Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Lab Results</h3>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Date Filter */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <select
                  value={labDateFilter}
                  onChange={(e) => setLabDateFilter(e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  <option value="7days">7 days</option>
                  <option value="30days">30 days</option>
                  <option value="90days">3 months</option>
                  <option value="1year">1 year</option>
                </select>
              </div>

              {/* Upload Button */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload
              </Button>

              {/* Scan Button */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
              >
                <Camera className="w-3 h-3" />
                Scan
              </Button>
            </div>
          </div>

          {/* Lab Name and Chart */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">{name}</h4>
              <div className="text-xs text-muted-foreground">
                Normal: {range}
              </div>
            </div>

            {/* Time Series Chart */}
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {dates ? (
                <TimeSeriesChart
                  data={values}
                  dates={dates}
                  color="#6366f1"
                  height={120}
                  normalRange={normalRange}
                />
              ) : (
                <MiniLineChart data={values} color="#6366f1" height={60} />
              )}

              {/* Current vs Past Comparison */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="text-sm font-medium">
                    {values[values.length - 2]} {unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dates ? dates[dates.length - 2] : "Last"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                  <ArrowUp
                    className={`w-4 h-4 ${values[values.length - 1] > values[values.length - 2] ? "text-red-500" : "text-green-500"}`}
                  />
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-sm font-bold">
                    {mostRecent} {unit}
                  </p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Most Recent Result */}
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Most recent</p>
              <p className="text-lg font-bold">
                {mostRecent} {unit}
              </p>
              <p className="text-xs text-muted-foreground">Most recent</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{date}</p>
              <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="w-5 h-5 bg-blue-600 text-white rounded text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            AI
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {aiInsight}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  const { user } = useAuth();
  const [aiMessage, setAiMessage] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [dateFilter, setDateFilter] = useState("7days");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [labResultsFilter, setLabResultsFilter] = useState("all"); // all, flagged, high, medium, low

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  // Medications doughnut data - Must be declared before healthMetrics
  const medicationsData = [
    { label: "On Schedule", value: 5, color: "#10b981" },
    { label: "Delayed", value: 2, color: "#f59e0b" },
    { label: "Missed", value: 1, color: "#ef4444" },
  ];

  // Health metrics data
  const healthMetrics = [
    {
      title: "Health Score",
      value: "85",
      change: "+3%",
      changeType: "up" as const,
      icon: Heart,
      chart: [82, 84, 83, 85, 87, 85, 88],
      color: "#10b981",
    },
    {
      title: "Medications",
      value: "8",
      change: "5 on track",
      changeType: "neutral" as const,
      icon: Pill,
      chart: null,
      color: "#8b5cf6",
      doughnutData: medicationsData,
    },
  ];

  // Lab results data for specialized cards
  const labResultsCards = [
    {
      name: "Creatinine",
      values: [1.3, 1.5, 1.4, 1.6, 1.7, 1.5, 1.6],
      dates: [
        "May 10",
        "May 17",
        "May 24",
        "May 31",
        "Jun 07",
        "Jun 14",
        "Jun 20",
      ],
      unit: "mg/dL",
      mostRecent: "1.6",
      date: "Jun 20",
      status: "High",
      range: "0.6-1.2",
      normalRange: { min: 0.6, max: 1.2 },
      aiInsight: "Your BUN/creatinine ratio suggests mild dehydration.",
      flaggedResults: 2,
    },
  ];

  // All lab results with flagged status
  const allLabResults = [
    {
      name: "Creatinine",
      value: "1.6 mg/dL",
      status: "high",
      trend: "up",
      flagged: true,
      lastDate: "Jun 20",
      priority: "high",
    },
    {
      name: "Total Cholesterol",
      value: "245 mg/dL",
      status: "high",
      trend: "up",
      flagged: true,
      lastDate: "Jun 18",
      priority: "medium",
    },
    {
      name: "HDL",
      value: "38 mg/dL",
      status: "low",
      trend: "down",
      flagged: true,
      lastDate: "Jun 18",
      priority: "medium",
    },
    {
      name: "LDL",
      value: "165 mg/dL",
      status: "high",
      trend: "up",
      flagged: true,
      lastDate: "Jun 18",
      priority: "high",
    },
    {
      name: "Triglycerides",
      value: "210 mg/dL",
      status: "high",
      trend: "up",
      flagged: true,
      lastDate: "Jun 18",
      priority: "medium",
    },
    {
      name: "Glucose",
      value: "110 mg/dL",
      status: "borderline",
      trend: "up",
      flagged: true,
      lastDate: "Jun 15",
      priority: "low",
    },
    {
      name: "HbA1c",
      value: "6.8%",
      status: "borderline",
      trend: "up",
      flagged: true,
      lastDate: "Jun 10",
      priority: "medium",
    },
    {
      name: "BUN",
      value: "28 mg/dL",
      status: "high",
      trend: "up",
      flagged: true,
      lastDate: "Jun 20",
      priority: "medium",
    },
    {
      name: "Vitamin D",
      value: "45 ng/mL",
      status: "normal",
      trend: "neutral",
      flagged: false,
      lastDate: "Jun 15",
      priority: "low",
    },
    {
      name: "TSH",
      value: "2.1 mIU/L",
      status: "normal",
      trend: "neutral",
      flagged: false,
      lastDate: "Jun 10",
      priority: "low",
    },
    {
      name: "Hemoglobin",
      value: "13.8 g/dL",
      status: "normal",
      trend: "neutral",
      flagged: false,
      lastDate: "Jun 12",
      priority: "low",
    },
    {
      name: "Platelets",
      value: "250 K/μL",
      status: "normal",
      trend: "neutral",
      flagged: false,
      lastDate: "Jun 12",
      priority: "low",
    },
  ];

  // Goals data
  const todaysGoals = [
    { label: "Steps", current: 7250, target: 10000, color: "#6366f1" },
    { label: "Water", current: 6, target: 8, color: "#06b6d4" },
    { label: "Sleep", current: 7.5, target: 8, color: "#8b5cf6" },
    { label: "Exercise", current: 3, target: 5, color: "#10b981" },
  ];

  // Recent lab results
  const labResults = [
    {
      name: "Total Cholesterol",
      value: "245 mg/dL",
      status: "high",
      trend: "up",
    },
    { name: "HDL", value: "38 mg/dL", status: "low", trend: "down" },
    { name: "Glucose", value: "110 mg/dL", status: "borderline", trend: "up" },
    {
      name: "Vitamin D",
      value: "45 ng/mL",
      status: "normal",
      trend: "neutral",
    },
  ];

  // AI Insights
  const aiInsights = [
    {
      type: "alert",
      title: "Cholesterol Management",
      message:
        "Your cholesterol levels show an upward trend. Consider scheduling a consultation.",
      confidence: 95,
    },
    {
      type: "tip",
      title: "Sleep Optimization",
      message:
        "Your sleep pattern analysis suggests 7.5-8 hours works best for your recovery.",
      confidence: 88,
    },
    {
      type: "success",
      title: "Activity Progress",
      message:
        "Great job! You've been consistently active for 22 days straight.",
      confidence: 100,
    },
  ];

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      console.log("AI Message:", aiMessage);
      setAiMessage("");
      setTimeout(() => {
        alert("AI is analyzing your question...");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {greeting}, {firstName}!
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics Dashboard
              </p>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-sm border rounded px-3 py-1.5 bg-background"
                >
                  <option value="1day">Last 24 hours</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 3 months</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAiChat(!showAiChat)}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button asChild className="gap-2">
              <Link to="/schedule">
                <Calendar className="w-4 h-4" />
                Schedule Visit
              </Link>
            </Button>
          </div>
        </div>

        {/* AI Chat Panel */}
        {showAiChat && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Health Assistant
                <Badge variant="secondary" className="ml-auto">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAiSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    placeholder="Ask about your health metrics, trends, or get personalized insights..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </form>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  "Analyze my cholesterol trend"
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  "Medication interactions?"
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  "Health score insights"
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.map((metric, idx) => (
            <MetricWidget key={idx} {...metric} />
          ))}
          {labResultsCards.map((lab, idx) => (
            <div key={`lab-${idx}`} className="lg:col-span-2">
              <LabResultCard {...lab} />
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Score Visualization */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-500" />
                  AI-Powered Health Score Analysis
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">
                    Excellent
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Algorithm v2.1
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Main Score Circle */}
                  <div className="text-center">
                    <CircularProgress value={85} color="#10b981" size={120} />
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Overall Health Score
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          +3 points this week
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on genomic, lab, and lifestyle factors
                      </p>
                    </div>
                  </div>

                  {/* Algorithm Component Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      ALGORITHM COMPONENTS
                    </h4>

                    {/* Genomic Factors */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Dna className="w-3 h-3 text-purple-500" />
                          <span className="text-sm font-medium">
                            Genomic Factors
                          </span>
                          <Badge variant="outline" className="text-xs">
                            25%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          72
                        </span>
                      </div>
                      <Progress value={72} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-5">
                        APOE ε4 variant detected • Elevated CAD risk score
                      </div>
                    </div>

                    {/* Lab Results */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TestTube className="w-3 h-3 text-blue-500" />
                          <span className="text-sm font-medium">
                            Lab Results
                          </span>
                          <Badge variant="outline" className="text-xs">
                            30%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          78
                        </span>
                      </div>
                      <Progress value={78} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-5">
                        Cholesterol high • Creatinine elevated • HbA1c normal
                      </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-sm font-medium">
                            Vital Signs
                          </span>
                          <Badge variant="outline" className="text-xs">
                            20%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          92
                        </span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-5">
                        BP optimal • HR normal • BMI in range
                      </div>
                    </div>

                    {/* Lifestyle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium">Lifestyle</span>
                          <Badge variant="outline" className="text-xs">
                            15%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          95
                        </span>
                      </div>
                      <Progress value={95} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-5">
                        Excellent activity • Good sleep • Balanced nutrition
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-3 h-3 text-purple-500" />
                          <span className="text-sm font-medium">
                            Medications
                          </span>
                          <Badge variant="outline" className="text-xs">
                            10%
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          88
                        </span>
                      </div>
                      <Progress value={88} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-5">
                        Good adherence • Drug interaction alert
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights Section */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-sm">AI Health Insights</h4>
                    <Badge variant="secondary" className="text-xs">
                      95% Confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Genomic Risk Alert */}
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Genetic Risk Factor
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Your APOE ε4 variant increases cardiovascular disease
                        risk. Enhanced monitoring and preventive care
                        recommended.
                      </p>
                    </div>

                    {/* Positive Trend */}
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Lifestyle Excellence
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your consistent activity and sleep patterns are
                        positively impacting your overall health trajectory.
                      </p>
                    </div>
                  </div>

                  {/* Action Recommendations */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Personalized Recommendations
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="text-blue-700 dark:text-blue-300">
                        • Schedule cardiology consultation for genetic risk
                        assessment
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        • Consider statin optimization based on genetic profile
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        • Continue current lifestyle pattern for optimal results
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Goals Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Today's Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {todaysGoals.map((goal, idx) => {
                    const percentage = Math.min(
                      (goal.current / goal.target) * 100,
                      100,
                    );
                    return (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={percentage}
                            className="h-3"
                            style={
                              {
                                "--progress-foreground": goal.color,
                              } as React.CSSProperties
                            }
                          />
                          {percentage >= 100 && (
                            <CheckCircle className="absolute -right-1 -top-1 w-5 h-5 text-green-500 bg-background rounded-full" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage >= 100
                            ? "Goal achieved!"
                            : `${Math.round(percentage)}% complete`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Labs & Insights */}
          <div className="space-y-6">
            {/* Enhanced Lab Results with Flagged Selection */}
            <Card>
              <CardHeader className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-orange-500" />
                    Lab Results
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/labs">
                      <Eye className="w-3 h-3 mr-1" />
                      View All
                    </Link>
                  </Button>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Filter:
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {["all", "flagged", "high", "medium"].map((filter) => (
                      <Button
                        key={filter}
                        variant={
                          labResultsFilter === filter ? "default" : "outline"
                        }
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => setLabResultsFilter(filter)}
                      >
                        {filter === "all" && "All"}
                        {filter === "flagged" &&
                          `Flagged (${allLabResults.filter((r) => r.flagged).length})`}
                        {filter === "high" &&
                          `High (${allLabResults.filter((r) => r.priority === "high").length})`}
                        {filter === "medium" &&
                          `Medium (${allLabResults.filter((r) => r.priority === "medium").length})`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    let filteredResults = allLabResults;

                    if (labResultsFilter === "flagged") {
                      filteredResults = allLabResults.filter((r) => r.flagged);
                    } else if (labResultsFilter === "high") {
                      filteredResults = allLabResults.filter(
                        (r) => r.priority === "high",
                      );
                    } else if (labResultsFilter === "medium") {
                      filteredResults = allLabResults.filter(
                        (r) => r.priority === "medium",
                      );
                    }

                    const displayResults = filteredResults.slice(0, 6); // Show max 6 results

                    const statusColors = {
                      high: "text-red-600 bg-red-50 border-red-200",
                      low: "text-blue-600 bg-blue-50 border-blue-200",
                      borderline:
                        "text-orange-600 bg-orange-50 border-orange-200",
                      normal: "text-green-600 bg-green-50 border-green-200",
                    };

                    const priorityColors = {
                      high: "border-l-red-500",
                      medium: "border-l-orange-500",
                      low: "border-l-green-500",
                    };

                    const trendIcons = {
                      up: <TrendingUp className="w-3 h-3" />,
                      down: <TrendingDown className="w-3 h-3" />,
                      neutral: <Activity className="w-3 h-3" />,
                    };

                    return displayResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                          result.flagged
                            ? "bg-red-50/50 border border-red-100"
                            : "bg-muted/30 border border-border/50"
                        } ${priorityColors[result.priority]}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{result.name}</p>
                            {result.flagged && (
                              <Badge
                                variant="destructive"
                                className="text-xs px-1 py-0"
                              >
                                <AlertTriangle className="w-2 h-2 mr-1" />
                                Flagged
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs px-1 py-0 ${
                                result.priority === "high"
                                  ? "border-red-300 text-red-700"
                                  : result.priority === "medium"
                                    ? "border-orange-300 text-orange-700"
                                    : "border-green-300 text-green-700"
                              }`}
                            >
                              {result.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {result.value}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {result.lastDate}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${statusColors[result.status].split(" ")[0]} px-2 py-1 rounded-md ${statusColors[result.status]}`}
                        >
                          {trendIcons[result.trend]}
                          <span className="text-xs font-medium uppercase">
                            {result.status}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}

                  {/* Summary Stats */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <div className="font-bold text-red-600">
                          {allLabResults.filter((r) => r.flagged).length}
                        </div>
                        <div className="text-red-600/70">Flagged</div>
                      </div>
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <div className="font-bold text-orange-600">
                          {
                            allLabResults.filter((r) => r.priority === "high")
                              .length
                          }
                        </div>
                        <div className="text-orange-600/70">High Priority</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <div className="font-bold text-green-600">
                          {allLabResults.filter((r) => !r.flagged).length}
                        </div>
                        <div className="text-green-600/70">Normal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => {
                    const typeColors = {
                      alert: "border-red-200 bg-red-50 dark:bg-red-900/20",
                      tip: "border-blue-200 bg-blue-50 dark:bg-blue-900/20",
                      success:
                        "border-green-200 bg-green-50 dark:bg-green-900/20",
                    };

                    const typeIcons = {
                      alert: <AlertTriangle className="w-4 h-4 text-red-600" />,
                      tip: <Info className="w-4 h-4 text-blue-600" />,
                      success: (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ),
                    };

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${typeColors[insight.type]}`}
                      >
                        <div className="flex items-start gap-2">
                          {typeIcons[insight.type]}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {insight.message}
                            </p>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                asChild
              >
                <Link to="/labs/upload">
                  <TestTube className="w-5 h-5" />
                  <span className="text-sm">Upload Labs</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                asChild
              >
                <Link to="/medications">
                  <Pill className="w-5 h-5" />
                  <span className="text-sm">Medications</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                asChild
              >
                <Link to="/trends">
                  <LineChart className="w-5 h-5" />
                  <span className="text-sm">View Trends</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                asChild
              >
                <Link to="/ai-insights">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm">AI Analysis</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
